import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateCustoDto {
  descricao: string;
  valor: number;
  data: string; // formato: yyyy-MM-dd
  comentario?: string;
  temaCustoId: number;
  tipo?: string; // "unico", "semanal", "mensal"
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
  dataPagamento: string; // Backend retorna DataPagamento
  tipo: string;
  comentario: string;
  arquivoAnexoPath?: string;
  usuarioId: number;
  usuarioNome: string;
  usuarioEmail: string;
  temaCustoId: number;
  temaCustoNome: string;
  temaCustoCor?: string; // Cor do tema
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
    return this.http.get<CustoResponse[]>(this.apiUrl, {
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

  createWithFile(custo: CreateCustoDto, arquivo?: File): Observable<CustoResponse> {
    const formData = new FormData();
    formData.append('descricao', custo.descricao);
    // Garante que o valor seja enviado com ponto como separador decimal (cultura invariante)
    formData.append('valor', custo.valor.toFixed(2));
    formData.append('dataPagamento', custo.data); // Corrigido: backend espera 'dataPagamento'
    formData.append('temaCustoId', custo.temaCustoId.toString());
    formData.append('tipo', custo.tipo || 'unico');

    if (custo.comentario) {
      formData.append('comentario', custo.comentario);
    }

    if (arquivo) {
      formData.append('arquivoAnexo', arquivo, arquivo.name);
    }

    // Não adiciona Content-Type header - deixa o browser definir automaticamente com boundary
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.post<CustoResponse>(this.apiUrl, formData, { headers });
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
