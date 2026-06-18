import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  ReporteService,
  ResumenDashboardResponse,
  ReporteVentasPeriodoResponse,
  TopProductoResponse,
  ReporteKardexResponse
} from '../../services/reporte';
import { ProductoService, ProductoResponse } from '../../services/producto';
import { VentaService } from '../../services/venta';
import { Auth } from '../../services/auth';

type SeccionActiva = 'dashboard' | 'ventas' | 'productos' | 'kardex';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {

  // ── Estado general ─────────────────────────────────────────
  seccionActiva = signal<SeccionActiva>('dashboard');
  nombreUsuario = '';
  cargando = signal(true);

  // ── Dashboard principal ────────────────────────────────────
  resumen = signal<ResumenDashboardResponse | null>(null);

  // ── Reporte 1: Ventas por período ──────────────────────────
  filtroVentas = {
    desde: this.primerDiaMes(),
    hasta: this.hoy()
  };
  reporteVentas = signal<ReporteVentasPeriodoResponse | null>(null);
  cargandoVentas = signal(false);

  columnasUltimasVentas = [
    'comprobante', 'cliente', 'metodo', 'total', 'estado', 'fecha'
  ];

  // ── Reporte 2: Top productos ───────────────────────────────
  filtroTop = {
    limite: 10,
    desde: '',
    hasta: ''
  };
  topProductos = signal<TopProductoResponse[]>([]);
  cargandoTop = signal(false);
  columnasTop = [
    'ranking', 'nombre', 'categoria', 'talla',
    'color', 'unidades', 'ingresos'
  ];

  // ── Reporte 3: Kardex ──────────────────────────────────────
  productos = signal<ProductoResponse[]>([]);
  kardexIdProducto: number | null = null;
  kardex = signal<ReporteKardexResponse | null>(null);
  cargandoKardex = signal(false);
  columnasKardex = [
    'fecha', 'tipo', 'anterior', 'variacion', 'nuevo', 'responsable', 'motivo'
  ];

  // ── Anulación de ventas ────────────────────────────────────
  anulacionId: number | null = null;
  anulacionMotivo = '';
  procesandoAnulacion = signal(false);

  constructor(
    private reporteService: ReporteService,
    private productoService: ProductoService,
    private ventaService: VentaService,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = this.auth.getNombre() ?? 'Administrador';
    this.cargarDashboard();
    this.cargarProductos();
  }

  // ── Carga de datos ─────────────────────────────────────────

  private cargarDashboard(): void {
    this.cargando.set(true);
    this.reporteService.getDashboard().subscribe({
      next: (data) => {
        this.resumen.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.snackBar.open('Error cargando dashboard', 'Cerrar',
          { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  private cargarProductos(): void {
    this.productoService.getCatalogo().subscribe({
      next: (data) => this.productos.set(data),
      error: () => console.error('Error cargando productos')
    });
  }

  // ── Reporte 1: Ventas ──────────────────────────────────────

  generarReporteVentas(): void {
    if (!this.filtroVentas.desde || !this.filtroVentas.hasta) return;

    this.cargandoVentas.set(true);

    const desde = `${this.filtroVentas.desde}T00:00:00`;
    const hasta  = `${this.filtroVentas.hasta}T23:59:59`;

    this.reporteService.getReporteVentas(desde, hasta).subscribe({
      next: (data) => {
        this.reporteVentas.set(data[0] ?? null);
        this.cargandoVentas.set(false);
      },
      error: () => {
        this.snackBar.open('Error generando reporte', 'Cerrar',
          { duration: 3000 });
        this.cargandoVentas.set(false);
      }
    });
  }

  getMetodosPago(): string[] {
    const reporte = this.reporteVentas();
    if (!reporte) return [];
    return Object.keys(reporte.transaccionesPorMetodoPago);
  }

  // ── Reporte 2: Top productos ───────────────────────────────

  generarTopProductos(): void {
    this.cargandoTop.set(true);

    const desde = this.filtroTop.desde
      ? `${this.filtroTop.desde}T00:00:00` : undefined;
    const hasta  = this.filtroTop.hasta
      ? `${this.filtroTop.hasta}T23:59:59`  : undefined;

    this.reporteService.getTopProductos(
      this.filtroTop.limite, desde, hasta
    ).subscribe({
      next: (data) => {
        this.topProductos.set(data);
        this.cargandoTop.set(false);
      },
      error: () => {
        this.snackBar.open('Error generando reporte', 'Cerrar',
          { duration: 3000 });
        this.cargandoTop.set(false);
      }
    });
  }

  // ── Reporte 3: Kardex ──────────────────────────────────────

  generarKardex(): void {
    if (!this.kardexIdProducto) return;

    this.cargandoKardex.set(true);
    this.kardex.set(null);

    this.reporteService.getKardex(this.kardexIdProducto).subscribe({
      next: (data) => {
        this.kardex.set(data);
        this.cargandoKardex.set(false);
      },
      error: () => {
        this.snackBar.open('Error generando kardex', 'Cerrar',
          { duration: 3000 });
        this.cargandoKardex.set(false);
      }
    });
  }

  getKardexTasaColor(): string {
    const tasa = this.kardex()?.tasaResolucionAlertas ?? 0;
    if (tasa >= 80) return 'tasa-buena';
    if (tasa >= 50) return 'tasa-media';
    return 'tasa-baja';
  }

  // ── Anulación de ventas ────────────────────────────────────

  anularVenta(): void {
    if (!this.anulacionId || !this.anulacionMotivo.trim()) {
      this.snackBar.open(
        'Ingresa el ID de la venta y el motivo',
        'Cerrar', { duration: 3000 }
      );
      return;
    }

    this.procesandoAnulacion.set(true);

    this.ventaService.anularVenta(
      this.anulacionId,
      this.anulacionMotivo
    ).subscribe({
      next: (venta) => {
        this.procesandoAnulacion.set(false);
        this.snackBar.open(
          `✓ Venta ${venta.numeroComprobante} anulada`,
          'OK', { duration: 4000, panelClass: 'snack-success' }
        );
        this.anulacionId = null;
        this.anulacionMotivo = '';
        this.cargarDashboard();
      },
      error: (err) => {
        this.procesandoAnulacion.set(false);
        const msg = err.error?.mensaje ?? 'Error al anular la venta';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      }
    });
  }

  // ── Utilidades ─────────────────────────────────────────────

  logout(): void {
    this.auth.logout();
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatMoneda(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'COMPLETADA': 'estado-completada',
      'ANULADA':    'estado-anulada',
      'PENDIENTE':  'estado-pendiente'
    };
    return map[estado] ?? '';
  }

  getTipoMovClass(tipo: string): string {
    const map: Record<string, string> = {
      'ENTRADA': 'tipo-entrada',
      'SALIDA':  'tipo-salida',
      'AJUSTE':  'tipo-ajuste'
    };
    return map[tipo] ?? '';
  }

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private primerDiaMes(): string {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      .toISOString().split('T')[0];
  }
}