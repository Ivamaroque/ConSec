import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TemaCustoService, TemaCustoResponse, TemaCustoDto, UsuarioListDto } from '../services/tema-custo.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-gerenciar-temas',
  templateUrl: './gerenciar-temas.component.html',
  styleUrls: ['./gerenciar-temas.component.css']
})
export class GerenciarTemasComponent implements OnInit {
  temas: TemaCustoResponse[] = [];
  funcionarios: UsuarioListDto[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Formulário
  showForm = false;
  editMode = false;
  currentTemaId: number | null = null;
  temaForm: TemaCustoDto = {
    nome: '',
    descricao: '',
    cor: '#3498db',
    icone: 'label',
    usuarioId: 0
  };

  // Seleção múltipla de funcionários
  funcionariosSelecionados: number[] = [];
  searchFuncionario: string = '';

  // Lista de ícones disponíveis do Material Icons
  iconesDisponiveis = [
    { nome: 'label', descricao: 'Etiqueta' },
    { nome: 'directions_bus', descricao: 'Ônibus' },
    { nome: 'directions_car', descricao: 'Carro' },
    { nome: 'restaurant', descricao: 'Alimentação' },
    { nome: 'local_cafe', descricao: 'Café' },
    { nome: 'shopping_cart', descricao: 'Compras' },
    { nome: 'home', descricao: 'Casa' },
    { nome: 'school', descricao: 'Educação' },
    { nome: 'fitness_center', descricao: 'Academia' },
    { nome: 'local_hospital', descricao: 'Saúde' },
    { nome: 'phone', descricao: 'Telefone' },
    { nome: 'bolt', descricao: 'Energia' },
    { nome: 'water_drop', descricao: 'Água' },
    { nome: 'wifi', descricao: 'Internet' },
    { nome: 'pets', descricao: 'Animais' },
    { nome: 'sports_esports', descricao: 'Jogos' },
    { nome: 'movie', descricao: 'Entretenimento' },
    { nome: 'flight', descricao: 'Viagem' },
    { nome: 'hotel', descricao: 'Hotel' },
    { nome: 'local_gas_station', descricao: 'Combustível' },
    { nome: 'build', descricao: 'Manutenção' },
    { nome: 'credit_card', descricao: 'Cartão' },
    { nome: 'attach_money', descricao: 'Dinheiro' },
    { nome: 'savings', descricao: 'Poupança' }
  ];

  constructor(
    private temaCustoService: TemaCustoService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFuncionarios();
    this.loadTemas();
  }

  // Getter para filtrar funcionários
  get funcionariosFiltrados(): UsuarioListDto[] {
    if (!this.searchFuncionario || this.searchFuncionario.trim() === '') {
      return this.funcionarios;
    }
    
    const search = this.searchFuncionario.toLowerCase().trim();
    return this.funcionarios.filter(f => 
      f.nome.toLowerCase().includes(search) || 
      f.email.toLowerCase().includes(search)
    );
  }

  loadFuncionarios(): void {
    this.temaCustoService.getFuncionarios().subscribe({
      next: (data) => {
        this.funcionarios = data;
      },
      error: (error) => {
        console.error('Erro ao carregar funcionários', error);
      }
    });
  }

  loadTemas(): void {
    this.loading = true;
    this.errorMessage = '';

    this.temaCustoService.getAll().subscribe({
      next: (data) => {
        this.temas = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar temas de custo.';
        this.loading = false;
        console.error(error);
      }
    });
  }

  openCreateForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentTemaId = null;
    this.temaForm = {
      nome: '',
      descricao: '',
      cor: '#3498db',
      usuarioId: this.funcionarios.length > 0 ? this.funcionarios[0].id : 0
    };
    this.funcionariosSelecionados = []; // Limpa seleção
    this.searchFuncionario = ''; // Limpa pesquisa
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditForm(tema: TemaCustoResponse): void {
    this.showForm = true;
    this.editMode = true;
    this.currentTemaId = tema.id;
    this.temaForm = {
      nome: tema.nome,
      descricao: tema.descricao,
      cor: tema.cor,
      usuarioId: tema.usuarioId
    };
    
    // Carrega funcionários selecionados (compatível com nova estrutura)
    if (tema.usuarios && tema.usuarios.length > 0) {
      this.funcionariosSelecionados = tema.usuarios.map((u: any) => u.id);
    } else if (tema.usuarioId) {
      this.funcionariosSelecionados = [tema.usuarioId];
    } else {
      this.funcionariosSelecionados = [];
    }
    
    this.searchFuncionario = ''; // Limpa pesquisa
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.editMode = false;
    this.currentTemaId = null;
    this.temaForm = {
      nome: '',
      descricao: '',
      cor: '#3498db',
      usuarioId: 0
    };
    this.funcionariosSelecionados = [];
    this.searchFuncionario = ''; // Limpa pesquisa
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Gerenciar seleção múltipla de funcionários
  toggleFuncionario(funcionarioId: number): void {
    const index = this.funcionariosSelecionados.indexOf(funcionarioId);
    if (index > -1) {
      this.funcionariosSelecionados.splice(index, 1);
    } else {
      this.funcionariosSelecionados.push(funcionarioId);
    }
  }

  isFuncionarioSelecionado(funcionarioId: number): boolean {
    return this.funcionariosSelecionados.includes(funcionarioId);
  }

  saveTema(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.temaForm.nome || this.temaForm.nome.trim() === '') {
      this.errorMessage = 'O nome do tema é obrigatório.';
      return;
    }

    if (this.funcionariosSelecionados.length === 0) {
      this.errorMessage = 'Selecione pelo menos um funcionário.';
      return;
    }

    this.loading = true;

    // Preparar objeto com lista de usuários
    const temaData = {
      ...this.temaForm,
      usuarioIds: this.funcionariosSelecionados
    };

    if (this.editMode && this.currentTemaId !== null) {
      // Atualizar tema existente - incluir o ID no objeto
      const updateDto = {
        ...temaData,
        id: this.currentTemaId
      };

      this.temaCustoService.update(this.currentTemaId, updateDto).subscribe({
        next: () => {
          this.successMessage = 'Tema atualizado com sucesso!';
          this.loading = false;
          this.loadTemas();
          this.closeForm();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao atualizar tema.';
          this.loading = false;
          console.error(error);
        }
      });
    } else {
      // Criar novo tema
      this.temaCustoService.create(temaData).subscribe({
        next: () => {
          this.successMessage = 'Tema criado com sucesso!';
          this.loading = false;
          this.loadTemas();
          this.closeForm();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao criar tema.';
          this.loading = false;
          console.error(error);
        }
      });
    }
  }

  deleteTema(id: number, nome: string): void {
    if (confirm(`Tem certeza que deseja excluir o tema "${nome}"?`)) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.temaCustoService.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Tema excluído com sucesso!';
          this.loading = false;
          this.loadTemas();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao excluir tema. Pode haver custos associados a ele.';
          this.loading = false;
          console.error(error);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
