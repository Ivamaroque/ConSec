import { Component, OnInit } from '@angular/core';
import { TemaCustoService, TemaCustoResponse, TemaCustoDto } from '../services/tema-custo.service';

@Component({
  selector: 'app-gerenciar-temas',
  templateUrl: './gerenciar-temas.component.html',
  styleUrls: ['./gerenciar-temas.component.css']
})
export class GerenciarTemasComponent implements OnInit {
  temas: TemaCustoResponse[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Formulário
  showForm = false;
  editMode = false;
  currentTemaId: number | null = null;
  temaForm: TemaCustoDto = {
    nome: '',
    descricao: ''
  };

  constructor(private temaCustoService: TemaCustoService) { }

  ngOnInit(): void {
    this.loadTemas();
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
      descricao: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditForm(tema: TemaCustoResponse): void {
    this.showForm = true;
    this.editMode = true;
    this.currentTemaId = tema.id;
    this.temaForm = {
      nome: tema.nome,
      descricao: tema.descricao
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.editMode = false;
    this.currentTemaId = null;
    this.temaForm = {
      nome: '',
      descricao: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveTema(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.temaForm.nome || this.temaForm.nome.trim() === '') {
      this.errorMessage = 'O nome do tema é obrigatório.';
      return;
    }

    this.loading = true;

    if (this.editMode && this.currentTemaId !== null) {
      // Atualizar tema existente
      this.temaCustoService.update(this.currentTemaId, this.temaForm).subscribe({
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
      this.temaCustoService.create(this.temaForm).subscribe({
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
}
