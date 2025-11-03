import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardResumo } from '../services/dashboard.service';
import { CustoResponse } from '../services/custo.service';
import { TemaCustoService, TemaCustoResponse } from '../services/tema-custo.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  resumo: DashboardResumo | null = null;
  custos: CustoResponse[] = [];
  temas: TemaCustoResponse[] = [];
  loading = false;
  errorMessage = '';

  // Filtros
  filtros = {
    dataInicio: '',
    dataFim: '',
    temaCustoId: null as number | null,
    usuarioId: null as number | null
  };

  constructor(
    private dashboardService: DashboardService,
    private temaCustoService: TemaCustoService
  ) { }

  ngOnInit(): void {
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
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar custos.';
        this.loading = false;
        console.error(error);
      }
    });
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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  getTotalPorcentagem(valor: number): number {
    if (!this.resumo || this.resumo.totalGeral === 0) return 0;
    return (valor / this.resumo.totalGeral) * 100;
  }
}
