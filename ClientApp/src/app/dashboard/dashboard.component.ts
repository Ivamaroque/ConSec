import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService, DashboardResumo } from '../services/dashboard.service';
import { CustoResponse } from '../services/custo.service';
import { TemaCustoService, TemaCustoResponse } from '../services/tema-custo.service';
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

  resumo: DashboardResumo | null = null;
  custos: CustoResponse[] = [];
  temas: TemaCustoResponse[] = [];
  loading = false;
  errorMessage = '';
  pieChart: Chart | null = null;
  barChart: Chart | null = null;
  gastoPorDia: { dia: number; total: number; cor: string }[] = [];
  gastoPorDiaPorTema: Map<number, Map<string, { valor: number; temaNome: string; temaCor: string }>> = new Map();

  // Modais
  showEditModal = false;
  showDeleteModal = false;
  custoSelecionado: CustoResponse | null = null;
  
  // Verificação de role
  isAdmin = false;

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
    
    this.loadTemas();
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

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    // Carrega resumo
    this.dashboardService.getResumo(
      this.filtros.dataInicio || undefined,
      this.filtros.dataFim || undefined,
      this.filtros.temaCustoId || undefined,
      this.filtros.usuarioId || undefined
    ).subscribe({
      next: (data) => {
        this.resumo = data;
        this.updatePieChart(); // Atualiza o gráfico quando os dados chegam
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar resumo.';
        console.error(error);
      }
    });

    // Carrega custos
    this.dashboardService.getAllCustos(
      this.filtros.dataInicio || undefined,
      this.filtros.dataFim || undefined,
      this.filtros.temaCustoId || undefined,
      this.filtros.usuarioId || undefined
    ).subscribe({
      next: (data) => {
        this.custos = data;
        console.log('Custos carregados:', data); // Debug: verificar se temaCustoCor está presente
        if (data.length > 0) {
          console.log('=== DEBUG DATA ===');
          console.log('Primeira data raw:', data[0].dataPagamento);
          console.log('Tipo:', typeof data[0].dataPagamento);
          console.log('Convertida:', new Date(data[0].dataPagamento));
        }
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

    console.log('Total de custos recebidos:', custos.length);

    if (custos.length === 0) {
      this.gastoPorDia = [];
      return;
    }

    // Usa o mês/ano atual (vigente)
    const now = new Date();
    const mesAlvo = now.getMonth();
    const anoAlvo = now.getFullYear();

    console.log('Filtrando por mês vigente:', mesAlvo + 1, '/', anoAlvo);

    // Filtra custos do mês vigente (atual)
    const custosMesAlvo = custos.filter(c => {
      const dataCusto = new Date(c.dataPagamento);
      const mesCusto = dataCusto.getMonth();
      const anoCusto = dataCusto.getFullYear();

      return mesCusto === mesAlvo && anoCusto === anoAlvo;
    });

    console.log('Custos do mês vigente:', custosMesAlvo.length);

    // Define uma paleta de cores para os temas
    const paletaCores = [
      '#e74c3c', // Vermelho
      '#27ae60', // Verde
      '#3498db', // Azul
      '#f39c12', // Laranja
      '#9b59b6', // Roxo
      '#1abc9c', // Turquesa
      '#e67e22', // Laranja escuro
      '#34495e', // Cinza azulado
      '#16a085', // Verde água
      '#c0392b'  // Vermelho escuro
    ];
    
    const temaParaCor = new Map<string, string>();
    let corIndex = 0;

    // Agrupa por dia e por tema
    custosMesAlvo.forEach(custo => {
      const dia = new Date(custo.dataPagamento).getDate();
      
      console.log(`Custo: ${custo.descricao}, Tema: ${custo.temaCustoNome}, Cor: ${custo.temaCustoCor}`);
      
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
      
      // Atribui uma cor da paleta para cada tema único
      if (!temaParaCor.has(temaNome)) {
        temaParaCor.set(temaNome, paletaCores[corIndex % paletaCores.length]);
        corIndex++;
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

    console.log('Gastos por dia calculados:', this.gastoPorDia);
    console.log('Gastos por dia por tema:', this.gastoPorDiaPorTema);
  }

  updatePieChart(): void {
    if (!this.resumo || !this.resumo.porTema || this.resumo.porTema.length === 0) {
      return;
    }

    // Aguarda o canvas estar disponível
    setTimeout(() => {
      if (!this.pieChartCanvas) return;

      const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      // Destrói o gráfico anterior se existir
      if (this.pieChart) {
        this.pieChart.destroy();
      }

      const labels = this.resumo!.porTema.map(t => t.temaNome);
      const data = this.resumo!.porTema.map(t => t.total);
      // Usa as cores dos temas vindas do backend
      const backgroundColors = this.resumo!.porTema.map(t => t.temaCor || '#3498db');

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
                  const total = this.resumo?.totalGeral || 0;
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
    }, 100);
  }

  updateBarChart(): void {
    if (!this.gastoPorDia || this.gastoPorDia.length === 0) {
      return;
    }

    // Aguarda o canvas estar disponível
    setTimeout(() => {
      if (!this.barChartCanvas) return;

      const ctx = this.barChartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      // Destrói o gráfico anterior se existir
      if (this.barChart) {
        this.barChart.destroy();
      }

      // Prepara os labels (dias)
      const labels = this.gastoPorDia.map(g => `Dia ${g.dia}`);
      
      console.log('=== DEBUG GRÁFICO DE BARRAS ===');
      console.log('Dias com gastos:', this.gastoPorDia);
      console.log('Gastos por dia por tema:', this.gastoPorDiaPorTema);
      
      // Coleta todos os temas únicos
      const temasUnicos = new Map<string, { cor: string }>();
      this.gastoPorDiaPorTema.forEach((temasDoDia) => {
        temasDoDia.forEach((tema, nomeTema) => {
          if (!temasUnicos.has(nomeTema)) {
            temasUnicos.set(nomeTema, { cor: tema.temaCor });
          }
        });
      });

      console.log('Temas únicos encontrados:', temasUnicos);

      // Função para converter hex para rgba
      const hexToRgba = (hex: string, alpha: number = 0.8): string => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      // Cria um dataset para cada tema
      const datasets = Array.from(temasUnicos.entries()).map(([nomeTema, { cor }]) => {
        const data = this.gastoPorDia.map(g => {
          const temasDoDia = this.gastoPorDiaPorTema.get(g.dia);
          if (temasDoDia && temasDoDia.has(nomeTema)) {
            return temasDoDia.get(nomeTema)!.valor;
          }
          return 0;
        });

        console.log(`Dataset para ${nomeTema}:`, { cor, data });

        return {
          label: nomeTema,
          data: data,
          backgroundColor: hexToRgba(cor, 0.7),
          borderColor: cor,
          borderWidth: 2,
          borderRadius: 4
        };
      });

      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
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
              display: true,
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 11
                },
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed.y || 0;
                  const tema = context.dataset.label || '';
                  return `${tema}: ${this.formatCurrency(value)}`;
                }
              },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#ddd',
              borderWidth: 1,
              padding: 12,
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

      this.barChart = new Chart(ctx, config);
    }, 100);
  }

  aplicarFiltros(): void {
    this.loadDashboard();
  }

  limparFiltros(): void {
    this.filtros = {
      dataInicio: '',
      dataFim: '',
      temaCustoId: null,
      usuarioId: null
    };
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
    const extensao = filePath.split('.').pop()?.toUpperCase() || '';
    return extensao;
  }

  downloadComprovante(custo: CustoResponse): void {
    if (!custo.arquivoAnexoPath) return;

    console.log('Tentando baixar arquivo:', custo.arquivoAnexoPath);

    // Obtém a extensão do arquivo original
    const extensao = custo.arquivoAnexoPath.split('.').pop() || 'pdf';
    
    // Cria o nome do arquivo personalizado
    const nomeArquivo = `Comprovante - ${custo.descricao}.${extensao}`;

    // O arquivo está no backend, não no Angular
    // Usa o mesmo origin que a API usa (não o origin do Angular)
    const fileUrl = custo.arquivoAnexoPath; // Já vem como /uploads/arquivo.ext

    console.log('Fazendo requisição para:', fileUrl);

    // Faz o download - o proxy do Angular vai redirecionar para o backend
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        console.log('Arquivo baixado com sucesso, tamanho:', blob.size);
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
