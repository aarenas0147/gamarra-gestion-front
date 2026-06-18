import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DetalleVentaRequest {
  idProducto: number;
  cantidad: number;
  descuento?: number;
}

export interface VentaRequest {
  idCliente: number;
  tipoComprobante: string;
  metodoPago: string;
  observaciones?: string;
  detalle: DetalleVentaRequest[];
}

export interface DetalleVentaResponse {
  idDetalle: number;
  idProducto: number;
  nombreProducto: string;
  codigoBarra: string;
  talla: string;
  color: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

export interface VentaResponse {
  idVenta: number;
  idCliente: number;
  nombreCliente: string;
  numeroDocumentoCliente: string;
  cajero: string;
  numeroComprobante: string;
  tipoComprobante: string;
  metodoPago: string;
  estado: string;
  montoSubtotal: number;
  igv: number;
  montoTotal: number;
  observaciones: string;
  fechaVenta: string;
  detalle: DetalleVentaResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  procesarVenta(request: VentaRequest): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(this.apiUrl, request);
  }

  buscarPorId(id: number): Observable<VentaResponse> {
    return this.http.get<VentaResponse>(`${this.apiUrl}/${id}`);
  }

  listarPorRango(desde: string, hasta: string): Observable<VentaResponse[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<VentaResponse[]>(`${this.apiUrl}/reporte`, { params });
  }

  anularVenta(id: number, motivo: string): Observable<VentaResponse> {
    return this.http.patch<VentaResponse>(
      `${this.apiUrl}/${id}/anular`, { motivo }
    );
  }
}