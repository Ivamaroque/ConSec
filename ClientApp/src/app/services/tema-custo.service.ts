import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TemaCustoDto {
  nome: string;
  descricao?: string;
}

export interface TemaCustoResponse {
  id: number;
  nome: string;
  descricao: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemaCustoService {
  private apiUrl = '/api/temacusto';

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
}
