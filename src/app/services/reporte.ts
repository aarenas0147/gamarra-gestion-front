import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';

export interface ResumenDashboardResponse {
  totalVentasHoy: number;
  recaudacionHoy: number;
  totalProductosActivos: number;
  productosEnStockCritico: number;
  alertasNoLeidas: number;
  alertasPendientes: number;
  topProductos: TopProductoResponse[];
  ultimasVentas: VentaResumenResponse[];
}

export interface ReporteVentasPeriodoResponse {
  periodo: string;
  totalTransacciones: number;
  montoSubtotalAcumulado: number;
  igvAcumulado: number;
  montoTotalRecaudado: number;
  transaccionesPorMetodoPago: Record<string, number>;
  recaudacionPorMetodoPago: Record<string, number>;
}

export interface TopProductoResponse {
  idProducto: number;
  codigoBarra: string;
  nombre: string;
  modelo: string;
  talla: string;
  color: string;
  categoria: string;
  unidadesVendidas: number;
  ingresosGenerados: number;
  rankingPosicion: number;
}

export interface ReporteKardexResponse {
  idProducto: number;
  nombreProducto: string;
  codigoBarra: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  enStockCritico: boolean;
  valorInventario: number;
  totalMovimientos: number;
  totalEntradas: number;
  totalSalidas: number;
  totalAjustes: number;
  alertasGeneradas: number;
  alertasResueltas: number;
  tasaResolucionAlertas: number;
  ultimosMovimientos: any[];
}

export interface VentaResumenResponse {
  idVenta: number;
  numeroComprobante: string;
  nombreCliente: string;
  metodoPago: string;
  estado: string;
  montoTotal: number;
  fechaVenta: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  getDashboard(): Observable<ResumenDashboardResponse> {
    return this.http.get<ResumenDashboardResponse>(
      `${this.apiUrl}/dashboard`
    );
  }

  getReporteVentas(
    desde: string,
    hasta: string
  ): Observable<ReporteVentasPeriodoResponse[]> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    return this.http.get<ReporteVentasPeriodoResponse[]>(
      `${this.apiUrl}/ventas`, { params }
    );
  }

  getTopProductos(
    limite: number = 10,
    desde?: string,
    hasta?: string
  ): Observable<TopProductoResponse[]> {
    let params = new HttpParams().set('limite', limite);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<TopProductoResponse[]>(
      `${this.apiUrl}/top-productos`, { params }
    );
  }

  getKardex(idProducto: number): Observable<ReporteKardexResponse> {
    return this.http.get<ReporteKardexResponse>(
      `${this.apiUrl}/kardex/${idProducto}`
    );
  }
}