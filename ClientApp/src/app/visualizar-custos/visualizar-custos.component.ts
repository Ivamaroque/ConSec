import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DashboardService } from '../services/dashboard.service';
import { CustoResponse } from '../services/custo.service';
import { TemaCustoService, TemaCustoResponse } from '../services/tema-custo.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-visualizar-custos',
  templateUrl: './visualizar-custos.component.html',
  styleUrls: ['./visualizar-custos.component.css']
})
export class VisualizarCustosComponent implements OnInit {
  custos: CustoResponse[] = [];
  temas: TemaCustoResponse[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  // Filtros
  temaSelecionadoId: number | null = null;
  dataInicio = '';
  dataFim = '';

  // Modais
  showEditModal = false;
  showDeleteModal = false;
  custoSelecionado: CustoResponse | null = null;
  custoEditForm = {
    descricao: '',
    valor: 0,
    dataPagamento: '',
    comentario: '',
    temaCustoId: 0
  };

  constructor(
    private dashboardService: DashboardService,
    private temaCustoService: TemaCustoService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadTemas();
    this.loadCustos();
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

  loadCustos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.getAllCustos(
      this.dataInicio || undefined,
      this.dataFim || undefined,
      this.temaSelecionadoId || undefined
    ).subscribe({
      next: (data) => {
        // Ordena por data mais recente primeiro
        this.custos = data.sort((a, b) => {
          return new Date(b.dataPagamento).getTime() - new Date(a.dataPagamento).getTime();
        });
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
    this.loadCustos();
  }

  limparFiltros(): void {
    this.temaSelecionadoId = null;
    this.dataInicio = '';
    this.dataFim = '';
    this.loadCustos();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // Abrir modal de edição
  openEditModal(custo: CustoResponse): void {
    this.custoSelecionado = custo;
    this.custoEditForm = {
      descricao: custo.descricao,
      valor: custo.valor,
      dataPagamento: custo.dataPagamento.split('T')[0],
      comentario: custo.comentario || '',
      temaCustoId: custo.temaCustoId
    };
    this.showEditModal = true;
  }

  // Fechar modal de edição
  closeEditModal(): void {
    this.showEditModal = false;
    this.custoSelecionado = null;
  }

  // Salvar edição
  saveEdit(): void {
    if (!this.custoSelecionado) return;

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const updateData = {
      id: this.custoSelecionado.id,
      descricao: this.custoEditForm.descricao,
      valor: parseFloat(this.custoEditForm.valor.toString()),
      dataPagamento: this.custoEditForm.dataPagamento,
      comentario: this.custoEditForm.comentario || '',
      temaCustoId: this.custoEditForm.temaCustoId,
      tipo: this.custoSelecionado.tipo || 'Despesa'
    };

    this.http.put(`/api/custo/${this.custoSelecionado.id}`, updateData, { headers }).subscribe({
      next: () => {
        this.successMessage = 'Custo atualizado com sucesso!';
        this.closeEditModal();
        this.loadCustos();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Erro ao atualizar custo', error);
        this.errorMessage = 'Erro ao atualizar custo.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // Abrir modal de exclusão
  openDeleteModal(custo: CustoResponse): void {
    this.custoSelecionado = custo;
    this.showDeleteModal = true;
  }

  // Fechar modal de exclusão
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.custoSelecionado = null;
  }

  // Confirmar exclusão
  confirmDelete(): void {
    if (!this.custoSelecionado) return;

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.delete(`/api/custo/${this.custoSelecionado.id}`, { headers }).subscribe({
      next: () => {
        this.successMessage = 'Custo excluído com sucesso!';
        this.closeDeleteModal();
        this.loadCustos();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Erro ao excluir custo', error);
        this.errorMessage = 'Erro ao excluir custo.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // Baixar comprovante
  downloadComprovante(custo: CustoResponse): void {
    if (!custo.arquivoAnexoPath) {
      alert('Este custo não possui comprovante anexado.');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.get(`/api/custo/comprovante/${custo.id}`, { 
      headers, 
      responseType: 'blob' 
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprovante-${custo.id}-${custo.descricao}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erro ao baixar comprovante', error);
        alert('Erro ao baixar comprovante');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
