import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService, CreateFuncionarioDto, UpdateFuncionarioDto, FuncionarioResponse } from '../services/usuario.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-gerenciar-funcionarios',
  templateUrl: './gerenciar-funcionarios.component.html',
  styleUrls: ['./gerenciar-funcionarios.component.css']
})
export class GerenciarFuncionariosComponent implements OnInit {
  funcionarios: FuncionarioResponse[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Formulário
  showForm = false;
  editMode = false;
  currentFuncionarioId: number | null = null;
  funcionarioForm: CreateFuncionarioDto & UpdateFuncionarioDto = {
    nome: '',
    email: '',
    senha: ''
  };

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFuncionarios();
  }

  loadFuncionarios(): void {
    this.loading = true;
    this.errorMessage = '';

    this.usuarioService.getFuncionarios().subscribe({
      next: (data) => {
        console.log('Funcionários recebidos:', data);
        this.funcionarios = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar funcionários.';
        this.loading = false;
        console.error(error);
      }
    });
  }

  openCreateForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentFuncionarioId = null;
    this.funcionarioForm = {
      nome: '',
      email: '',
      senha: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditForm(funcionario: FuncionarioResponse): void {
    this.showForm = true;
    this.editMode = true;
    this.currentFuncionarioId = funcionario.id;
    this.funcionarioForm = {
      nome: funcionario.nome,
      email: funcionario.email,
      senha: '' // Senha em branco - só atualiza se preenchida
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.editMode = false;
    this.currentFuncionarioId = null;
    this.funcionarioForm = {
      nome: '',
      email: '',
      senha: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveFuncionario(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.funcionarioForm.nome || this.funcionarioForm.nome.trim() === '') {
      this.errorMessage = 'O nome é obrigatório.';
      return;
    }

    if (!this.funcionarioForm.email || this.funcionarioForm.email.trim() === '') {
      this.errorMessage = 'O email é obrigatório.';
      return;
    }

    if (!this.editMode && (!this.funcionarioForm.senha || this.funcionarioForm.senha.length < 6)) {
      this.errorMessage = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (this.editMode && this.funcionarioForm.senha && this.funcionarioForm.senha.length < 6) {
      this.errorMessage = 'Se informar senha, ela deve ter no mínimo 6 caracteres.';
      return;
    }

    this.loading = true;

    if (this.editMode && this.currentFuncionarioId !== null) {
      // Atualizar funcionário existente
      const updateDto: UpdateFuncionarioDto = {
        nome: this.funcionarioForm.nome,
        email: this.funcionarioForm.email
      };

      // Só inclui senha se foi preenchida
      if (this.funcionarioForm.senha && this.funcionarioForm.senha.trim() !== '') {
        updateDto.senha = this.funcionarioForm.senha;
      }

      this.usuarioService.updateFuncionario(this.currentFuncionarioId, updateDto).subscribe({
        next: () => {
          this.successMessage = 'Funcionário atualizado com sucesso!';
          this.loading = false;
          this.loadFuncionarios();
          this.closeForm();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erro ao atualizar funcionário.';
          this.loading = false;
          console.error(error);
        }
      });
    } else {
      // Criar novo funcionário
      this.usuarioService.criarFuncionario(this.funcionarioForm as CreateFuncionarioDto).subscribe({
        next: () => {
          this.successMessage = 'Funcionário criado com sucesso!';
          this.loading = false;
          this.loadFuncionarios();
          this.closeForm();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erro ao criar funcionário.';
          this.loading = false;
          console.error(error);
        }
      });
    }
  }

  deleteFuncionario(id: number, nome: string): void {
    if (!confirm(`Tem certeza que deseja excluir o funcionário "${nome}"?`)) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.usuarioService.deleteFuncionario(id).subscribe({
      next: () => {
        this.successMessage = `Funcionário "${nome}" excluído com sucesso!`;
        this.loading = false;
        this.loadFuncionarios();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao excluir funcionário.';
        this.loading = false;
        console.error(error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
