import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustoResponse } from './custo.service';

export interface ResumoTema {
  temaNome: string;
  total: number;
  quantidade: number;
}

export interface ResumoUsuario {
  usuarioNome: string;
  total: number;
  quantidade: number;
}

export interface ResumoMes {
  mes: string;
  total: number;
  quantidade: number;
}

export interface DashboardResumo {
  totalGeral: number;
  quantidadeTotal: number;
  porTema: ResumoTema[];
  porUsuario: ResumoUsuario[];
  porMes: ResumoMes[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/dashboard';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getResumo(dataInicio?: string, dataFim?: string, temaCustoId?: number, usuarioId?: number): Observable<DashboardResumo> {
    let params = new HttpParams();
    
    if (dataInicio) {
      params = params.set('dataInicio', dataInicio);
    }
    if (dataFim) {
      params = params.set('dataFim', dataFim);
    }
    if (temaCustoId) {
      params = params.set('temaCustoId', temaCustoId.toString());
    }
    if (usuarioId) {
      params = params.set('usuarioId', usuarioId.toString());
    }

    return this.http.get<DashboardResumo>(`${this.apiUrl}/resumo`, { 
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getAllCustos(dataInicio?: string, dataFim?: string, temaCustoId?: number, usuarioId?: number): Observable<CustoResponse[]> {
    let params = new HttpParams();
    
    if (dataInicio) {
      params = params.set('dataInicio', dataInicio);
    }
    if (dataFim) {
      params = params.set('dataFim', dataFim);
    }
    if (temaCustoId) {
      params = params.set('temaCustoId', temaCustoId.toString());
    }
    if (usuarioId) {
      params = params.set('usuarioId', usuarioId.toString());
    }

    return this.http.get<CustoResponse[]>(`${this.apiUrl}/custos`, { 
      headers: this.getAuthHeaders(),
      params: params
    });
  }
}
