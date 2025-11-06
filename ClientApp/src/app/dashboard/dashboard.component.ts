import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService, DashboardResumo } from '../services/dashboard.service';
import { CustoResponse } from '../services/custo.service';
import { TemaCustoService, TemaCustoResponse } from '../services/tema-custo.service';
import { SaldoService } from '../services/saldo.service';
import { AuthService } from '../services/auth.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';

// Registrar todos os componentes do Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;

  resumo: DashboardResumo | null = null;
  resumoAnual: DashboardResumo | null = null; // DADOS DO ANO TODO para os gráficos
  custos: CustoResponse[] = [];
  temas: TemaCustoResponse[] = [];
  saldoTotal = 0;
  totalDisponivel = 0;
  statusDisponivel: 'positivo' | 'alerta' | 'negativo' = 'positivo';
  loading = false;
  errorMessage = '';
  pieChart: Chart | null = null;
  barChart: Chart | null = null;
  lineChart: Chart | null = null;
  gastoPorDia: { dia: number; total: number; cor: string }[] = [];
  gastoPorDiaPorTema: Map<number, Map<string, { valor: number; temaNome: string; temaCor: string }>> = new Map();

  // Modais
  showEditModal = false;
  showDeleteModal = false;
  showDayDetailModal = false;
  custoSelecionado: CustoResponse | null = null;
  diaDetalhadoData: {
    dia: number;
    total: number;
    temas: { nome: string; cor: string; valor: number }[];
  } | null = null;

  // Verificação de role
  isAdmin = false;

  // Filtros de mês e ano
  mesSelecionado: number = new Date().getMonth() + 1;
  anoSelecionado: number = new Date().getFullYear();
  meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' }
  ];
  anos: number[] = [];

  // Filtros
  filtros = {
    dataInicio: '',
    dataFim: '',
    temaCustoId: null as number | null,
    usuarioId: null as number | null
  };

  constructor(
    private dashboardService: DashboardService,
    private temaCustoService: TemaCustoService,
    private saldoService: SaldoService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngAfterViewInit(): void {
    // O canvas estará disponível aqui
  }

  ngOnInit(): void {
    // Verifica se o usuário é admin (gestor)
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.cargo === 'gestor';

    // Inicializa os filtros com mês e ano atuais
    const hoje = new Date();
    this.mesSelecionado = hoje.getMonth() + 1; // JavaScript usa 0-11, então +1
    this.anoSelecionado = hoje.getFullYear();

    // Gera lista de anos (últimos 5 anos + ano atual + próximos 2)
    this.gerarListaAnos();

    // Atualiza os filtros de data com base no mês/ano selecionados
    this.atualizarFiltrosData();

    this.loadTemas();
    this.loadSaldoTotal();
    this.loadDashboard();
  }

  gerarListaAnos(): void {
    const anoAtual = new Date().getFullYear();
    this.anos = [];
    for (let i = anoAtual - 5; i <= anoAtual + 2; i++) {
      this.anos.push(i);
    }
  }

  atualizarFiltrosData(): void {
    // Define data início como primeiro dia do mês selecionado
    const dataInicio = new Date(this.anoSelecionado, this.mesSelecionado - 1, 1);
    this.filtros.dataInicio = dataInicio.toISOString().split('T')[0];

    // Define data fim como último dia do mês selecionado
    const dataFim = new Date(this.anoSelecionado, this.mesSelecionado, 0); // Dia 0 do próximo mês = último dia do mês atual
    this.filtros.dataFim = dataFim.toISOString().split('T')[0];
  }

  onMesAnoChange(): void {
    // Atualiza os filtros de data
    this.atualizarFiltrosData();
    
    // Recarrega os dados do dashboard
    this.loadSaldoTotal();
    this.loadDashboard();
  }

  loadTemas(): void {
    this.temaCustoService.getAll().subscribe({
      next: (data) => {
        this.temas = data;
      },
      error: (error) => {
        console.error('Erro ao carregar temas', error);
      }
    });
  }

  loadSaldoTotal(): void {
    // Filtrar saldo apenas pelo ano selecionado
    let dataInicio: string | undefined;
    let dataFim: string | undefined;

    if (this.filtros.dataInicio) {
      // Se tem data início, pega o ano e cria o range do ano completo
      const ano = new Date(this.filtros.dataInicio).getFullYear();
      dataInicio = `${ano}-01-01`;
      dataFim = `${ano}-12-31`;
    } else if (this.filtros.dataFim) {
      // Se só tem data fim, usa o ano dela
      const ano = new Date(this.filtros.dataFim).getFullYear();
      dataInicio = `${ano}-01-01`;
      dataFim = `${ano}-12-31`;
    } else {
      // Se não tem filtros, usa o ano atual
      const anoAtual = new Date().getFullYear();
      dataInicio = `${anoAtual}-01-01`;
      dataFim = `${anoAtual}-12-31`;
    }

    this.saldoService.getTotal(dataInicio, dataFim).subscribe({
      next: (data) => {
        this.saldoTotal = data.total;
        this.calcularDisponivel();
      },
      error: (error) => {
        console.error('Erro ao carregar saldo total', error);
        this.saldoTotal = 0;
        this.calcularDisponivel();
      }
    });
  }

  calcularDisponivel(): void {
    const custoTotal = this.resumo?.totalGeral || 0;
    this.totalDisponivel = this.saldoTotal - custoTotal;

    // Calcula o status baseado na distância do custo
    if (this.totalDisponivel < 0) {
      // Negativo: não tem saldo suficiente
      this.statusDisponivel = 'negativo';
    } else {
      // Calcula 10% do custo total
      const margemAlerta = custoTotal * 0.1;

      if (this.totalDisponivel <= margemAlerta) {
        // Alerta: disponível está dentro de 10% do custo (zona crítica)
        this.statusDisponivel = 'alerta';
      } else {
        // Positivo: tem margem segura
        this.statusDisponivel = 'positivo';
      }
    }
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    // Carrega resumo do MÊS SELECIONADO (apenas para os cards de resumo)
    this.dashboardService.getResumo(
      this.filtros.dataInicio || undefined,
      this.filtros.dataFim || undefined,
      this.filtros.temaCustoId || undefined,
      this.filtros.usuarioId || undefined
    ).subscribe({
      next: (data) => {
        this.resumo = data;
        this.calcularDisponivel();
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar resumo.';
        console.error(error);
      }
    });

    // Carrega resumo do ANO TODO (para gráficos de pizza e linha)
    const anoInicio = `${this.anoSelecionado}-01-01`;
    const anoFim = `${this.anoSelecionado}-12-31`;
    
    this.dashboardService.getResumo(
      anoInicio,
      anoFim,
      this.filtros.temaCustoId || undefined,
      this.filtros.usuarioId || undefined
    ).subscribe({
      next: (data) => {
        // SALVA os dados anuais para o HTML usar
        this.resumoAnual = data;
        
        // SEMPRE atualiza os gráficos, mesmo que não tenha dados no mês atual
        // Os gráficos internamente decidem se mostram "Nenhum dado disponível"
        setTimeout(() => this.updatePieChart(data), 200);
        setTimeout(() => this.updateLineChart(data), 200);
      },
      error: (error) => {
        console.error('Erro ao carregar resumo anual', error);
        // Mesmo com erro, tenta renderizar gráficos vazios
        this.updatePieChart();
        this.updateLineChart();
      }
    });

    // Carrega custos do MÊS SELECIONADO (para gráfico de barras por dia)
    this.dashboardService.getAllCustos(
      this.filtros.dataInicio || undefined,
      this.filtros.dataFim || undefined,
      this.filtros.temaCustoId || undefined,
      this.filtros.usuarioId || undefined
    ).subscribe({
      next: (data) => {
        this.custos = data;
        this.calcularGastoPorDia(data);
        this.updateBarChart();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar custos.';
        this.loading = false;
        console.error(error);
      }
    });
  }

  calcularGastoPorDia(custos: CustoResponse[]): void {
    // Agrupa custos por dia do mês
    const gastosPorDiaMap = new Map<number, { total: number; custos: CustoResponse[] }>();
    this.gastoPorDiaPorTema = new Map();

    if (custos.length === 0) {
      this.gastoPorDia = [];
      return;
    }

    // Mapa para armazenar a cor real de cada tema
    const temaParaCor = new Map<string, string>();

    // Agrupa por dia e por tema (não precisa filtrar, a API já filtra por período)
    custos.forEach(custo => {
      const dataCusto = new Date(custo.dataPagamento);
      const dia = dataCusto.getDate();

      // Agrupa por dia (total geral)
      const atual = gastosPorDiaMap.get(dia) || { total: 0, custos: [] };
      atual.total += custo.valor;
      atual.custos.push(custo);
      gastosPorDiaMap.set(dia, atual);

      // Agrupa por dia e por tema
      if (!this.gastoPorDiaPorTema.has(dia)) {
        this.gastoPorDiaPorTema.set(dia, new Map());
      }

      const temasDoDia = this.gastoPorDiaPorTema.get(dia)!;
      const temaNome = custo.temaCustoNome || 'Sem categoria';

      // Usa a cor real do tema (não a paleta)
      if (!temaParaCor.has(temaNome)) {
        temaParaCor.set(temaNome, custo.temaCustoCor || '#667eea');
      }

      const corDoTema = temaParaCor.get(temaNome)!;

      const temaAtual = temasDoDia.get(temaNome) || {
        valor: 0,
        temaNome: temaNome,
        temaCor: corDoTema
      };

      temaAtual.valor += custo.valor;
      temasDoDia.set(temaNome, temaAtual);
    });

    // Converte para array e ordena por dia, determinando a cor dominante
    this.gastoPorDia = Array.from(gastosPorDiaMap.entries())
      .map(([dia, dados]) => {
        // Determina a cor do tema dominante (maior valor total por tema)
        const temasPorValor = new Map<string, { valor: number; cor: string }>();

        dados.custos.forEach(custo => {
          const temaCor = custo.temaCustoCor || '#3498db';
          const atual = temasPorValor.get(temaCor) || { valor: 0, cor: temaCor };
          atual.valor += custo.valor;
          temasPorValor.set(temaCor, atual);
        });

        // Pega a cor do tema com maior valor
        let corDominante = '#3498db';
        let maiorValor = 0;
        temasPorValor.forEach((tema) => {
          if (tema.valor > maiorValor) {
            maiorValor = tema.valor;
            corDominante = tema.cor;
          }
        });

        return { dia, total: dados.total, cor: corDominante };
      })
      .sort((a, b) => a.dia - b.dia);
  }

  updatePieChart(resumoAnual?: DashboardResumo): void {
    // Aguarda o canvas estar disponível com retry
    const tentarCriarGrafico = (tentativa: number = 0) => {
      if (tentativa > 10) {
        return;
      }

      if (!this.pieChartCanvas) {
        setTimeout(() => tentarCriarGrafico(tentativa + 1), 200);
        return;
      }

      const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
      if (!ctx) {
        return;
      }

      // Destrói o gráfico anterior se existir
      if (this.pieChart) {
        this.pieChart.destroy();
        this.pieChart = null;
      }

      // SEMPRE usa os dados anuais se fornecidos
      const dadosParaGrafico = resumoAnual;

      // Se realmente não há dados NO ANO TODO, não cria o gráfico
      if (!dadosParaGrafico || !dadosParaGrafico.porTema || dadosParaGrafico.porTema.length === 0) {
        return;
      }

      const labels = dadosParaGrafico!.porTema.map(t => t.temaNome);
      const data = dadosParaGrafico!.porTema.map(t => t.total);
      const backgroundColors = dadosParaGrafico!.porTema.map(t => t.temaCor || '#3498db');

      const config: ChartConfiguration<'pie'> = {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderColor: '#fff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = dadosParaGrafico?.totalGeral || 0;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                  const formattedValue = this.formatCurrency(value);
                  return `${label}: ${formattedValue} (${percentage}%)`;
                }
              },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#ddd',
              borderWidth: 1,
              padding: 12,
              displayColors: true,
              bodyFont: {
                size: 14
              },
              titleFont: {
                size: 14,
                weight: 'bold'
              }
            }
          }
        }
      };

      this.pieChart = new Chart(ctx, config);
    };

    // Inicia a tentativa de criar o gráfico
    tentarCriarGrafico(0);
  }

  updateBarChart(): void {
    // Aguarda o canvas estar disponível
    setTimeout(() => {
      if (!this.barChartCanvas) return;

      const ctx = this.barChartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      // Destrói o gráfico anterior se existir
      if (this.barChart) {
        this.barChart.destroy();
      }

      // Se não há dados, não cria o gráfico
      if (!this.gastoPorDia || this.gastoPorDia.length === 0) {
        this.barChart = null;
        return;
      }

      // Prepara os labels (dias) e valores totais
      const labels = this.gastoPorDia.map(g => `Dia ${g.dia}`);
      const valores = this.gastoPorDia.map(g => g.total);
      const cores = this.gastoPorDia.map(g => g.cor);

      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total do Dia',
            data: valores,
            backgroundColor: cores.map(c => this.hexToRgba(c, 0.7)),
            borderColor: cores,
            borderWidth: 2,
            borderRadius: 6,
            maxBarThickness: 80
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: true
          },
          onHover: (event: any, chartElement: any) => {
            (event.native.target as HTMLCanvasElement).style.cursor = chartElement[0] ? 'pointer' : 'default';
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const diaClicado = this.gastoPorDia[index];
              this.abrirDetalheDia(diaClicado.dia);
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => {
                  return this.formatCurrency(Number(value));
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                title: (context) => {
                  return context[0].label;
                },
                label: (context) => {
                  const value = context.parsed.y || 0;
                  return `Total: ${this.formatCurrency(value)}`;
                },
                afterLabel: () => {
                  return 'Clique para ver detalhes';
                }
              },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              footerColor: '#aaa',
              borderColor: '#ddd',
              borderWidth: 1,
              padding: 12,
              bodyFont: {
                size: 14
              },
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              footerFont: {
                size: 11,
                style: 'italic'
              }
            }
          }
        }
      };

      this.barChart = new Chart(ctx, config);
    }, 100);
  }

  hexToRgba(hex: string, alpha: number = 0.8): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  abrirDetalheDia(dia: number): void {
    const temasDoDia = this.gastoPorDiaPorTema.get(dia);
    if (!temasDoDia) return;

    const totalDia = this.gastoPorDia.find(g => g.dia === dia)?.total || 0;

    const temasArray = Array.from(temasDoDia.values()).map(tema => ({
      nome: tema.temaNome,
      cor: tema.temaCor,
      valor: tema.valor
    })).sort((a, b) => b.valor - a.valor); // Ordena por valor decrescente

    this.diaDetalhadoData = {
      dia,
      total: totalDia,
      temas: temasArray
    };

    this.showDayDetailModal = true;
  }

  fecharDetalheDia(): void {
    this.showDayDetailModal = false;
    this.diaDetalhadoData = null;
  }

  updateLineChart(resumoAnual?: DashboardResumo): void {
    // Aguarda o canvas estar disponível com retry
    const tentarCriarGrafico = (tentativa: number = 0) => {
      if (tentativa > 10) {
        return;
      }

      if (!this.lineChartCanvas) {
        setTimeout(() => tentarCriarGrafico(tentativa + 1), 200);
        return;
      }

      const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      // Destrói o gráfico anterior se existir
      if (this.lineChart) {
        this.lineChart.destroy();
      }

      // Usa os dados anuais passados como parâmetro
      const dadosParaGrafico = resumoAnual;
      
      // Cria um mapa com todos os 12 meses do ano inicializados com 0
      const mesesDoAno = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      // Inicializa todos os meses com 0
      const valoresPorMes = new Map<string, number>();
      mesesDoAno.forEach((mes, index) => {
        valoresPorMes.set(index.toString(), 0);
      });

      // Preenche com os valores reais vindos da API
      if (dadosParaGrafico && dadosParaGrafico.porMes && dadosParaGrafico.porMes.length > 0) {
        dadosParaGrafico.porMes.forEach(item => {
          // A API retorna no formato "01/2024", "02/2024", etc
          const mesParts = item.mes.split('/');
          const mesNumero = parseInt(mesParts[0], 10); // "01" -> 1, "02" -> 2
          const mesIndex = mesNumero - 1; // JavaScript usa 0-11, então Janeiro=0, Fevereiro=1
          
          if (mesIndex >= 0 && mesIndex < 12) {
            valoresPorMes.set(mesIndex.toString(), item.total);
          }
        });
      }

      // Prepara os dados para o gráfico (todos os 12 meses em ordem)
      const labels = mesesDoAno.map(mes => `${mes}/${this.anoSelecionado}`);
      const valores = mesesDoAno.map((_, index) => valoresPorMes.get(index.toString()) || 0);

      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Gastos Mensais',
            data: valores,
            borderColor: '#121B4F',
            backgroundColor: this.hexToRgba('#121B4F', 0.1),
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#121B4F',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            mode: 'point',
            intersect: true
          },
          onHover: (event: any, chartElement: any) => {
            (event.native.target as HTMLCanvasElement).style.cursor = chartElement[0] ? 'pointer' : 'default';
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              // Index corresponde ao mês (0 = Janeiro, 1 = Fevereiro, etc.)
              const mesClicado = index + 1; // Converte para 1-12
              this.mesSelecionado = mesClicado;
              this.onMesAnoChange();
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => {
                  return this.formatCurrency(Number(value));
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                title: (context) => {
                  return context[0].label;
                },
                label: (context) => {
                  const value = context.parsed.y || 0;
                  return `Total: ${this.formatCurrency(value)}`;
                },
                afterLabel: () => {
                  return 'Clique para filtrar por este mês';
                }
              },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              footerColor: '#aaa',
              borderColor: '#ddd',
              borderWidth: 1,
              padding: 12,
              bodyFont: {
                size: 14
              },
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              footerFont: {
                size: 11,
                style: 'italic'
              }
            }
          }
        }
      };

      this.lineChart = new Chart(ctx, config);
    };

    // Inicia a tentativa de criar o gráfico
    tentarCriarGrafico(0);
  }

  aplicarFiltros(): void {
    this.loadSaldoTotal();
    this.loadDashboard();
  }

  limparFiltros(): void {
    this.filtros = {
      dataInicio: '',
      dataFim: '',
      temaCustoId: null,
      usuarioId: null
    };
    this.loadSaldoTotal();
    this.loadDashboard();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    // Tenta parsear a data
    const date = new Date(dateString);

    // Verifica se é uma data válida
    if (isNaN(date.getTime())) {
      console.error('Data inválida:', dateString);
      return dateString;
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  getTotalPorcentagem(valor: number): number {
    if (!this.resumo || this.resumo.totalGeral === 0) return 0;
    return (valor / this.resumo.totalGeral) * 100;
  }

  getColorForIndex(index: number): string {
    const colors = [
      '#dc3545', // red
      '#ffc107', // yellow/orange
      '#28a745', // green
      '#17a2b8', // cyan
      '#6f42c1', // purple
      '#fd7e14', // orange
      '#20c997', // teal
      '#e83e8c', // pink
      '#6610f2', // indigo
      '#007bff'  // blue
    ];
    return colors[index % colors.length];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getFileExtension(filePath: string): string {
    if (!filePath) return '';
    const extensao = filePath.split('.').pop() || '';
    return extensao;
  }

  downloadComprovante(custo: CustoResponse): void {
    if (!custo.arquivoAnexoPath) return;

    // Obtém a extensão do arquivo original
    const extensao = custo.arquivoAnexoPath.split('.').pop() || 'pdf';

    // Cria o nome do arquivo personalizado
    const nomeArquivo = `Comprovante - ${custo.descricao}.${extensao}`;

    // O arquivo está no backend, não no Angular
    // Usa o mesmo origin que a API usa (não o origin do Angular)
    const fileUrl = custo.arquivoAnexoPath; // Já vem como /uploads/arquivo.ext

    // Faz o download - o proxy do Angular vai redirecionar para o backend
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erro ao baixar comprovante:', error);
        alert('Erro ao baixar o arquivo. Verifique o console para mais detalhes.');
      }
    });
  }

  abrirModalEdicao(custo: CustoResponse): void {
    this.custoSelecionado = { ...custo }; // Clona o objeto

    // Converte a data para o formato yyyy-MM-dd para o input type="date"
    if (this.custoSelecionado.dataPagamento) {
      const data = new Date(this.custoSelecionado.dataPagamento);
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const dia = String(data.getDate()).padStart(2, '0');
      this.custoSelecionado.dataPagamento = `${ano}-${mes}-${dia}` as any;
    }

    this.showEditModal = true;
  }

  fecharModalEdicao(): void {
    this.showEditModal = false;
    this.custoSelecionado = null;
  }

  abrirModalExclusao(custo: CustoResponse): void {
    this.custoSelecionado = custo;
    this.showDeleteModal = true;
  }

  fecharModalExclusao(): void {
    this.showDeleteModal = false;
    this.custoSelecionado = null;
  }

  confirmarExclusao(): void {
    if (!this.custoSelecionado) return;

    this.loading = true;
    this.dashboardService.deleteCusto(this.custoSelecionado.id).subscribe({
      next: () => {
        this.fecharModalExclusao();
        this.loadDashboard(); // Recarrega os dados
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao excluir custo:', error);
        this.errorMessage = 'Erro ao excluir custo';
        this.loading = false;
      }
    });
  }

  salvarEdicao(): void {
    if (!this.custoSelecionado) return;

    this.loading = true;
    // Aqui você precisará implementar o método de update no service
    // Por enquanto, apenas fecha o modal
    this.fecharModalEdicao();
    this.loadDashboard();
    this.loading = false;
  }
}
