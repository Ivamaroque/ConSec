import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TemaCustoService, TemaCustoResponse } from '../services/tema-custo.service';
import { CustoService, CustoResponse, CreateCustoDto } from '../services/custo.service';

@Component({
  selector: 'app-meus-custos',
  templateUrl: './meus-custos.component.html',
  styleUrls: ['./meus-custos.component.css']
})
export class MeusCustosComponent implements OnInit {
  custoForm!: FormGroup;
  temas: TemaCustoResponse[] = [];
  temaSelecionado: TemaCustoResponse | null = null;
  meusCustos: CustoResponse[] = [];
  loading = false;
  loadingCustos = false;
  successMessage = '';
  errorMessage = '';
  arquivoSelecionado: File | null = null;
  usuarioNome = '';
  setorNumero = 2; // Pode vir do backend

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private temaCustoService: TemaCustoService,
    private custoService: CustoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.usuarioNome = user?.nome || 'Funcionário';

    // Define a data de hoje no formato YYYY-MM-DD para o input type="date"
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split('T')[0];

    this.custoForm = this.formBuilder.group({
      descricao: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      valorDisplay: [''], // Campo para exibição formatada
      dataPagamento: [dataHoje, Validators.required], // Data de hoje como padrão
      temaCustoId: ['']
    });

    this.loadTemas();
    this.loadMeusCustos();
  }

  loadTemas(): void {
    this.temaCustoService.getAll().subscribe({
      next: (data) => {
        this.temas = data;
      },
      error: (error) => {
        console.error('Erro ao carregar temas', error);
        this.errorMessage = 'Erro ao carregar temas disponíveis';
      }
    });
  }

  loadMeusCustos(): void {
    this.loadingCustos = true;

    this.custoService.getMyCustos().subscribe({
      next: (data: CustoResponse[]) => {
        this.meusCustos = data;
        this.loadingCustos = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar custos', error);
        this.loadingCustos = false;
      }
    });
  }

  selecionarTema(tema: TemaCustoResponse): void {
    this.temaSelecionado = tema;
    this.custoForm.patchValue({ temaCustoId: tema.id });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'O arquivo deve ter no máximo 5MB';
        event.target.value = '';
        return;
      }
      this.arquivoSelecionado = file;
    }
  }

  onSubmit(): void {
    if (this.custoForm.invalid || !this.temaSelecionado) {
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const custoDto: CreateCustoDto = {
      descricao: this.custoForm.value.descricao,
      valor: parseFloat(this.custoForm.value.valor),
      data: this.custoForm.value.dataPagamento,
      temaCustoId: this.temaSelecionado.id,
      tipo: 'unico'
    };

    this.custoService.createWithFile(custoDto, this.arquivoSelecionado || undefined).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Custo adicionado com sucesso!';
        this.resetForm();
        this.loadMeusCustos(); // Recarrega a lista

        // Limpa a mensagem após 3 segundos
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Erro ao adicionar custo';
        console.error('Erro:', error);
      }
    });
  }

  resetForm(): void {
    this.custoForm.reset();
    this.arquivoSelecionado = null;

    // Reseta o input de arquivo também
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Redefine a data para hoje
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split('T')[0];

    if (this.temaSelecionado) {
      this.custoForm.patchValue({ 
        temaCustoId: this.temaSelecionado.id,
        dataPagamento: dataHoje
      });
    } else {
      this.custoForm.patchValue({ dataPagamento: dataHoje });
    }
  }

  formatarValor(event: any): void {
    let valor = event.target.value;

    // Remove tudo que não é número
    valor = valor.replace(/\D/g, '');

    // Se estiver vazio, zera
    if (valor === '') {
      this.custoForm.patchValue({ valor: '', valorDisplay: '' });
      return;
    }

    // Converte para número (centavos)
    const numero = parseInt(valor, 10);

    // Converte para reais
    const valorEmReais = numero / 100;

    // Formata para exibição
    const valorFormatado = valorEmReais.toFixed(2).replace('.', ',');

    // Atualiza os campos
    this.custoForm.patchValue({
      valor: valorEmReais,
      valorDisplay: valorFormatado
    }, { emitEvent: false });
  }

  formatarValorCompleto(): void {
    const valor = this.custoForm.get('valor')?.value;
    if (valor) {
      const valorFormatado = parseFloat(valor).toFixed(2).replace('.', ',');
      this.custoForm.patchValue({ valorDisplay: valorFormatado }, { emitEvent: false });
    }
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
