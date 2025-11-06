import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TemaCustoDto {
  nome: string;
  descricao?: string;
  cor?: string;
  icone?: string;
  usuarioId: number;
  usuarioIds?: number[]; // Novo - lista de IDs
}

export interface UsuarioSimplificado {
  id: number;
  nome: string;
  email: string;
}

export interface TemaCustoResponse {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  usuarioId: number;
  usuarioNome: string;
  usuarios?: UsuarioSimplificado[]; // Novo - lista de usuários
}

export interface UsuarioListDto {
  id: number;
  nome: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemaCustoService {
  private apiUrl = '/api/temacusto';
  private usuarioUrl = '/api/usuario';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(): Observable<TemaCustoResponse[]> {
    return this.http.get<TemaCustoResponse[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getById(id: number): Observable<TemaCustoResponse> {
    return this.http.get<TemaCustoResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  create(tema: TemaCustoDto): Observable<TemaCustoResponse> {
    return this.http.post<TemaCustoResponse>(this.apiUrl, tema, {
      headers: this.getAuthHeaders()
    });
  }

  update(id: number, tema: TemaCustoDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, tema, {
      headers: this.getAuthHeaders()
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getFuncionarios(): Observable<UsuarioListDto[]> {
    return this.http.get<UsuarioListDto[]>(`${this.usuarioUrl}/funcionarios`, {
      headers: this.getAuthHeaders()
    });
  }
}
