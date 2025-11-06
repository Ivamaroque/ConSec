import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SaldoService, SaldoResponse, CreateSaldoDto } from '../services/saldo.service';

@Component({
  selector: 'app-gerenciar-saldo',
  templateUrl: './gerenciar-saldo.component.html',
  styleUrls: ['./gerenciar-saldo.component.css']
})
export class GerenciarSaldoComponent implements OnInit {
  saldos: SaldoResponse[] = [];
  loading = false;
  showForm = false;
  editMode = false;
  successMessage = '';
  errorMessage = '';
  arquivoSelecionado: File | null = null;
  totalSaldo = 0;

  saldoForm = {
    id: 0,
    descricao: '',
    valor: 0,
    dataEntrada: ''
  };

  // Filtros
  filtros = {
    dataInicio: '',
    dataFim: ''
  };

  constructor(
    private saldoService: SaldoService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSaldos();
    this.loadTotal();

    // Define a data de hoje como padrão
    const hoje = new Date();
    this.saldoForm.dataEntrada = hoje.toISOString().split('T')[0];
  }

  loadSaldos(): void {
    this.loading = true;
    this.saldoService.getAll(
      this.filtros.dataInicio || undefined,
      this.filtros.dataFim || undefined
    ).subscribe({
      next: (data) => {
        this.saldos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar saldos', error);
        this.errorMessage = 'Erro ao carregar saldos';
        this.loading = false;
      }
    });
  }

  loadTotal(): void {
    this.saldoService.getTotal(
      this.filtros.dataInicio || undefined,
      this.filtros.dataFim || undefined
    ).subscribe({
      next: (data) => {
        this.totalSaldo = data.total;
      },
      error: (error) => {
        console.error('Erro ao carregar total', error);
      }
    });
  }

  openCreateForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.resetForm();
  }

  openEditForm(saldo: SaldoResponse): void {
    this.showForm = true;
    this.editMode = true;
    this.saldoForm = {
      id: saldo.id,
      descricao: saldo.descricao,
      valor: saldo.valor,
      dataEntrada: new Date(saldo.dataEntrada).toISOString().split('T')[0]
    };
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    const hoje = new Date();
    this.saldoForm = {
      id: 0,
      descricao: '',
      valor: 0,
      dataEntrada: hoje.toISOString().split('T')[0]
    };
    this.arquivoSelecionado = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.arquivoSelecionado = file;
    }
  }

  saveSaldo(): void {
    if (!this.saldoForm.descricao || this.saldoForm.valor <= 0 || !this.saldoForm.dataEntrada) {
      this.errorMessage = 'Preencha todos os campos obrigatórios';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.editMode) {
      // Atualizar
      const updateDto = {
        descricao: this.saldoForm.descricao,
        valor: this.saldoForm.valor,
        dataEntrada: this.saldoForm.dataEntrada
      };

      this.saldoService.update(this.saldoForm.id, updateDto, this.arquivoSelecionado || undefined).subscribe({
        next: () => {
          this.successMessage = 'Saldo atualizado com sucesso!';
          this.closeForm();
          this.loadSaldos();
          this.loadTotal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao atualizar saldo', error);
          this.errorMessage = 'Erro ao atualizar saldo';
          this.loading = false;
        }
      });
    } else {
      // Criar
      const createDto: CreateSaldoDto = {
        descricao: this.saldoForm.descricao,
        valor: this.saldoForm.valor,
        dataEntrada: this.saldoForm.dataEntrada
      };

      this.saldoService.create(createDto, this.arquivoSelecionado || undefined).subscribe({
        next: () => {
          this.successMessage = 'Saldo adicionado com sucesso!';
          this.closeForm();
          this.loadSaldos();
          this.loadTotal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao criar saldo', error);
          this.errorMessage = 'Erro ao criar saldo';
          this.loading = false;
        }
      });
    }
  }

  deleteSaldo(id: number, descricao: string): void {
    if (!confirm(`Tem certeza que deseja excluir "${descricao}"?`)) {
      return;
    }

    this.loading = true;
    this.saldoService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Saldo excluído com sucesso!';
        this.loadSaldos();
        this.loadTotal();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao excluir saldo', error);
        this.errorMessage = 'Erro ao excluir saldo';
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.loadSaldos();
    this.loadTotal();
  }

  limparFiltros(): void {
    this.filtros = {
      dataInicio: '',
      dataFim: ''
    };
    this.loadSaldos();
    this.loadTotal();
  }

  downloadComprovante(saldo: SaldoResponse): void {
    if (!saldo.arquivoAnexoPath) return;

    this.saldoService.downloadComprovante(saldo.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprovante_${saldo.id}.${this.getFileExtension(saldo.arquivoAnexoPath!)}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Erro ao baixar comprovante', error);
        this.errorMessage = 'Erro ao baixar comprovante';
      }
    });
  }

  getFileExtension(filePath: string): string {
    return filePath.split('.').pop() || 'pdf';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
