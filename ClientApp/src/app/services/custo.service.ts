import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateCustoDto {
  descricao: string;
  valor: number;
  data: string; // formato: yyyy-MM-dd
  comentario?: string;
  temaCustoId: number;
}

export interface UpdateCustoDto {
  descricao?: string;
  valor?: number;
  data?: string;
  comentario?: string;
  temaCustoId?: number;
}

export interface CustoResponse {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  comentario: string;
  usuarioId: number;
  usuarioNome: string;
  temaCustoId: number;
  temaCustoNome: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustoService {
  private apiUrl = '/api/custo';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getMyCustos(): Observable<CustoResponse[]> {
    return this.http.get<CustoResponse[]>(`${this.apiUrl}/meus`, { 
      headers: this.getAuthHeaders() 
    });
  }

  getById(id: number): Observable<CustoResponse> {
    return this.http.get<CustoResponse>(`${this.apiUrl}/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  create(custo: CreateCustoDto): Observable<CustoResponse> {
    return this.http.post<CustoResponse>(this.apiUrl, custo, { 
      headers: this.getAuthHeaders() 
    });
  }

  update(id: number, custo: UpdateCustoDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, custo, { 
      headers: this.getAuthHeaders() 
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getAuthHeaders() 
    });
  }
}
