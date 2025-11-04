import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateFuncionarioDto {
  nome: string;
  email: string;
  senha: string;
}

export interface UpdateFuncionarioDto {
  nome?: string;
  email?: string;
  senha?: string;
}

export interface FuncionarioResponse {
  id: number;
  nome: string;
  email: string;
  temas: {
    id: number;
    nome: string;
    cor: string;
    icone: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = '/api/usuario';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getFuncionarios(): Observable<FuncionarioResponse[]> {
    return this.http.get<FuncionarioResponse[]>(`${this.apiUrl}/funcionarios`, {
      headers: this.getAuthHeaders()
    });
  }

  criarFuncionario(funcionario: CreateFuncionarioDto): Observable<FuncionarioResponse> {
    return this.http.post<FuncionarioResponse>(`${this.apiUrl}/criar-funcionario`, funcionario, {
      headers: this.getAuthHeaders()
    });
  }

  updateFuncionario(id: number, funcionario: UpdateFuncionarioDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/funcionario/${id}`, funcionario, {
      headers: this.getAuthHeaders()
    });
  }

  deleteFuncionario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/funcionario/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
