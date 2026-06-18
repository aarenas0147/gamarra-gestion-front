import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MovimientoStockRequest {
  idProducto: number;
  tipo: 'ENTRADA' | 'AJUSTE';
  cantidad: number;
  motivo?: string;
}

export interface MovimientoStockResponse {
  idMovimiento: number;
  idProducto: number;
  nombreProducto: string;
  codigoBarra: string;
  tipo: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  diferencia: number;
  motivo: string;
  responsable: string;
  idVenta: number | null;
  numeroComprobante: string | null;
  fecha: string;
}

export interface AlertaStockResponse {
  idAlerta: number;
  idProducto: number;
  nombreProducto: string;
  codigoBarra: string;
  stockCapturado: number;
  stockMinimo: number;
  leida: boolean;
  resuelta: boolean;
  resueltaPor: string | null;
  fechaAlerta: string;
  fechaResolucion: string | null;
}

export interface ActualizacionPrecioRequest {
  idCategoria: number;
  porcentajeAjuste: number;
  tipoAjuste: 'INCREMENTO' | 'DESCUENTO';
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = `${environment.apiUrl}/inventario`;

  constructor(private http: HttpClient) {}

  // ── Movimientos ──────────────────────────────────────────────

  registrarMovimiento(
    request: MovimientoStockRequest
  ): Observable<MovimientoStockResponse> {
    return this.http.post<MovimientoStockResponse>(
      `${this.apiUrl}/movimientos`, request
    );
  }

  listarMovimientos(): Observable<MovimientoStockResponse[]> {
    return this.http.get<MovimientoStockResponse[]>(
      `${this.apiUrl}/movimientos`
    );
  }

  historialProducto(idProducto: number): Observable<MovimientoStockResponse[]> {
    return this.http.get<MovimientoStockResponse[]>(
      `${this.apiUrl}/movimientos/producto/${idProducto}`
    );
  }

  // ── Alertas ──────────────────────────────────────────────────

  listarAlertasNoLeidas(): Observable<AlertaStockResponse[]> {
    return this.http.get<AlertaStockResponse[]>(
      `${this.apiUrl}/alertas`
    );
  }

  listarAlertasPendientes(): Observable<AlertaStockResponse[]> {
    return this.http.get<AlertaStockResponse[]>(
      `${this.apiUrl}/alertas/pendientes`
    );
  }

  marcarAlertaLeida(idAlerta: number): Observable<AlertaStockResponse> {
    return this.http.patch<AlertaStockResponse>(
      `${this.apiUrl}/alertas/${idAlerta}/leer`, {}
    );
  }

  // ── Precios ──────────────────────────────────────────────────

  actualizarPreciosMasivo(
    request: ActualizacionPrecioRequest
  ): Observable<any[]> {
    return this.http.patch<any[]>(
      `${this.apiUrl}/precios/actualizar`, request
    );
  }
}