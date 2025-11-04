import { Component, OnInit } from '@angular/core';
import { CustoService, CreateCustoDto, UpdateCustoDto, CustoResponse } from '../services/custo.service';
import { TemaCustoService, TemaCustoResponse } from '../services/tema-custo.service';

@Component({
  selector: 'app-cadastrar-custos',
  templateUrl: './cadastrar-custos.component.html',
  styleUrls: ['./cadastrar-custos.component.css']
})
export class CadastrarCustosComponent implements OnInit {
  custos: CustoResponse[] = [];
  temas: TemaCustoResponse[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Formulário
  showForm = false;
  editMode = false;
  currentCustoId: number | null = null;

  // Armazena o valor em centavos (inteiro)
  valorEmCentavos: number = 0;

  custoForm: any = {
    descricao: '',
    valor: null,
    data: '',
    comentario: '',
    temaCustoId: null
  };

  constructor(
    private custoService: CustoService,
    private temaCustoService: TemaCustoService
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

    this.custoService.getMyCustos().subscribe({
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

  openCreateForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentCustoId = null;

    // Define data de hoje como padrão
    const today = new Date().toISOString().split('T')[0];
    this.custoForm = {
      descricao: '',
      valor: null,
      data: today,
      comentario: '',
      temaCustoId: null
    };

    // Reseta o valor em centavos
    this.valorEmCentavos = 0;

    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditForm(custo: CustoResponse): void {
    this.showForm = true;
    this.editMode = true;
    this.currentCustoId = custo.id;
    this.custoForm = {
      descricao: custo.descricao,
      valor: custo.valor,
      data: custo.dataPagamento.split('T')[0], // Converte para formato yyyy-MM-dd
      comentario: custo.comentario || '',
      temaCustoId: custo.temaCustoId
    };

    // Converte o valor para centavos
    this.valorEmCentavos = Math.round(custo.valor * 100);

    this.errorMessage = '';
    this.successMessage = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.editMode = false;
    this.currentCustoId = null;
    this.custoForm = {
      descricao: '',
      valor: null,
      data: '',
      comentario: '',
      temaCustoId: null
    };

    // Reseta o valor em centavos
    this.valorEmCentavos = 0;

    this.errorMessage = '';
    this.successMessage = '';
  }

  saveCusto(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validações
    if (!this.custoForm.descricao || this.custoForm.descricao.trim() === '') {
      this.errorMessage = 'A descrição é obrigatória.';
      return;
    }

    if (!this.custoForm.valor || this.custoForm.valor <= 0) {
      this.errorMessage = 'O valor deve ser maior que zero.';
      return;
    }

    if (!this.custoForm.data) {
      this.errorMessage = 'A data é obrigatória.';
      return;
    }

    if (!this.custoForm.temaCustoId) {
      this.errorMessage = 'Selecione um tema de custo.';
      return;
    }

    this.loading = true;

    if (this.editMode && this.currentCustoId !== null) {
      // Atualizar custo existente
      const updateDto: UpdateCustoDto = {
        descricao: this.custoForm.descricao,
        valor: parseFloat(this.custoForm.valor),
        data: this.custoForm.data,
        comentario: this.custoForm.comentario || undefined,
        temaCustoId: parseInt(this.custoForm.temaCustoId)
      };

      this.custoService.update(this.currentCustoId, updateDto).subscribe({
        next: () => {
          this.successMessage = 'Custo atualizado com sucesso!';
          this.loading = false;
          this.loadCustos();
          this.closeForm();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao atualizar custo.';
          this.loading = false;
          console.error(error);
        }
      });
    } else {
      // Criar novo custo
      const createDto: CreateCustoDto = {
        descricao: this.custoForm.descricao,
        valor: parseFloat(this.custoForm.valor),
        data: this.custoForm.data,
        comentario: this.custoForm.comentario || undefined,
        temaCustoId: parseInt(this.custoForm.temaCustoId)
      };

      this.custoService.create(createDto).subscribe({
        next: () => {
          this.successMessage = 'Custo cadastrado com sucesso!';
          this.loading = false;
          this.loadCustos();
          this.closeForm();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao cadastrar custo.';
          this.loading = false;
          console.error(error);
        }
      });
    }
  }

  deleteCusto(id: number, descricao: string): void {
    if (confirm(`Tem certeza que deseja excluir o custo "${descricao}"?`)) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.custoService.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Custo excluído com sucesso!';
          this.loading = false;
          this.loadCustos();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao excluir custo.';
          this.loading = false;
          console.error(error);
        }
      });
    }
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

  // Formata o valor para exibição (R$ 0,00)
  formatValueDisplay(): string {
    const reais = Math.floor(this.valorEmCentavos / 100);
    const centavos = this.valorEmCentavos % 100;
    return `R$ ${reais.toLocaleString('pt-BR')},${centavos.toString().padStart(2, '0')}`;
  }

  // Manipula a digitação no campo de valor
  handleValueKeydown(event: KeyboardEvent): void {
    // Permite apenas números, backspace e delete
    if (event.key >= '0' && event.key <= '9') {
      event.preventDefault();
      // Adiciona o dígito à direita
      this.valorEmCentavos = this.valorEmCentavos * 10 + parseInt(event.key);
      // Atualiza o valor no formulário (em reais)
      this.custoForm.valor = this.valorEmCentavos / 100;
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      // Remove o último dígito
      this.valorEmCentavos = Math.floor(this.valorEmCentavos / 10);
      // Atualiza o valor no formulário (em reais)
      this.custoForm.valor = this.valorEmCentavos / 100;
    } else if (event.key === 'Tab' || event.key === 'Enter') {
      // Permite Tab e Enter para navegação
      return;
    } else {
      // Bloqueia outras teclas
      event.preventDefault();
    }
  }
}
