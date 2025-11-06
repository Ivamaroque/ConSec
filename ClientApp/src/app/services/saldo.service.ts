import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateSaldoDto {
  descricao: string;
  valor: number;
  dataEntrada: string; // formato: yyyy-MM-dd
}

export interface UpdateSaldoDto {
  descricao?: string;
  valor?: number;
  dataEntrada?: string;
}

export interface SaldoResponse {
  id: number;
  descricao: string;
  valor: number;
  dataEntrada: string;
  arquivoAnexoPath?: string;
  usuarioId: number;
  usuarioNome: string;
  criadoEm: string;
}

@Injectable({
  providedIn: 'root'
})
export class SaldoService {
  private apiUrl = '/api/saldo';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(dataInicio?: string, dataFim?: string): Observable<SaldoResponse[]> {
    let url = this.apiUrl;
    const params: string[] = [];

    if (dataInicio) params.push(`dataInicio=${dataInicio}`);
    if (dataFim) params.push(`dataFim=${dataFim}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<SaldoResponse[]>(url, { headers: this.getAuthHeaders() });
  }

  getById(id: number): Observable<SaldoResponse> {
    return this.http.get<SaldoResponse>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  create(dto: CreateSaldoDto, arquivoAnexo?: File): Observable<SaldoResponse> {
    const formData = new FormData();
    formData.append('descricao', dto.descricao);
    formData.append('valor', dto.valor.toString());
    formData.append('dataEntrada', dto.dataEntrada);

    if (arquivoAnexo) {
      formData.append('arquivoAnexo', arquivoAnexo);
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<SaldoResponse>(this.apiUrl, formData, { headers });
  }

  update(id: number, dto: UpdateSaldoDto, arquivoAnexo?: File): Observable<void> {
    const formData = new FormData();

    if (dto.descricao) formData.append('descricao', dto.descricao);
    if (dto.valor) formData.append('valor', dto.valor.toString());
    if (dto.dataEntrada) formData.append('dataEntrada', dto.dataEntrada);

    if (arquivoAnexo) {
      formData.append('arquivoAnexo', arquivoAnexo);
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<void>(`${this.apiUrl}/${id}`, formData, { headers });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getTotal(dataInicio?: string, dataFim?: string): Observable<{ total: number }> {
    let url = `${this.apiUrl}/total`;
    const params: string[] = [];

    if (dataInicio) params.push(`dataInicio=${dataInicio}`);
    if (dataFim) params.push(`dataFim=${dataFim}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<{ total: number }>(url, { headers: this.getAuthHeaders() });
  }

  downloadComprovante(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/comprovante/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
}
