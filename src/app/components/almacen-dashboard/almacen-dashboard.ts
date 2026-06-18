import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import {
  InventarioService,
  MovimientoStockRequest,
  MovimientoStockResponse,
  AlertaStockResponse
} from '../../services/inventario';
import { ProductoService, ProductoResponse, CategoriaResponse } from '../../services/producto';
import { Auth } from '../../services/auth';

type TabActiva = 'movimientos' | 'alertas' | 'precios';

@Component({
  selector: 'app-almacen-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule,
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './almacen-dashboard.html',
  styleUrl: './almacen-dashboard.css'
})
export class AlmacenDashboardComponent implements OnInit {

  // ── Estado general ─────────────────────────────────────────
  tabActiva = signal<TabActiva>('movimientos');
  nombreUsuario = '';

  // ── Productos y categorías ─────────────────────────────────
  productos = signal<ProductoResponse[]>([]);
  categorias = signal<CategoriaResponse[]>([]);
  cargandoProductos = signal(true);

  productosStockCritico = computed(() =>
    this.productos().filter(p => p.enStockCritico && p.activo)
  );

  // ── Formulario de movimiento ───────────────────────────────
  movForm = {
    idProducto: null as number | null,
    tipo: 'ENTRADA' as 'ENTRADA' | 'AJUSTE',
    cantidad: null as number | null,
    motivo: ''
  };
  procesandoMov = signal(false);

  productoSeleccionado = computed(() =>
    this.productos().find(
      p => p.idProducto === this.movForm.idProducto
    ) ?? null
  );

  // ── Historial de movimientos ───────────────────────────────
  movimientos = signal<MovimientoStockResponse[]>([]);
  cargandoMov = signal(false);
  columnasMov = [
    'fecha', 'producto', 'tipo', 'stockAnterior',
    'diferencia', 'stockNuevo', 'responsable', 'motivo'
  ];

  // ── Alertas ────────────────────────────────────────────────
  alertas = signal<AlertaStockResponse[]>([]);
  cargandoAlertas = signal(false);
  columnasAlertas = [
    'producto', 'stockCapturado', 'stockMinimo',
    'fechaAlerta', 'estado', 'accion'
  ];

  totalAlertasPendientes = computed(() =>
    this.alertas().filter(a => !a.resuelta).length
  );

  // ── Actualización de precios ───────────────────────────────
  precioForm = {
    idCategoria: null as number | null,
    porcentajeAjuste: null as number | null,
    tipoAjuste: 'INCREMENTO' as 'INCREMENTO' | 'DESCUENTO'
  };
  procesandoPrecio = signal(false);

  constructor(
    private inventarioService: InventarioService,
    private productoService: ProductoService,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = this.auth.getNombre() ?? 'Encargado';
    this.cargarProductos();
    this.cargarCategorias();
    this.cargarMovimientos();
    this.cargarAlertas();
  }

  // ── Carga de datos ─────────────────────────────────────────

  private cargarProductos(): void {
    this.cargandoProductos.set(true);
    this.productoService.getCatalogo().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargandoProductos.set(false);
      },
      error: () => {
        this.snackBar.open('Error cargando productos', 'Cerrar',
          { duration: 3000 });
        this.cargandoProductos.set(false);
      }
    });
  }

  private cargarCategorias(): void {
    this.productoService.getCategorias().subscribe({
      next: (data) => this.categorias.set(data),
      error: () => console.error('Error cargando categorías')
    });
  }

  cargarMovimientos(): void {
    this.cargandoMov.set(true);
    this.inventarioService.listarMovimientos().subscribe({
      next: (data) => {
        this.movimientos.set(data);
        this.cargandoMov.set(false);
      },
      error: () => {
        this.snackBar.open('Error cargando movimientos', 'Cerrar',
          { duration: 3000 });
        this.cargandoMov.set(false);
      }
    });
  }

  cargarAlertas(): void {
    this.cargandoAlertas.set(true);
    this.inventarioService.listarAlertasPendientes().subscribe({
      next: (data) => {
        this.alertas.set(data);
        this.cargandoAlertas.set(false);
      },
      error: () => {
        this.snackBar.open('Error cargando alertas', 'Cerrar',
          { duration: 3000 });
        this.cargandoAlertas.set(false);
      }
    });
  }

  // ── Movimientos ────────────────────────────────────────────

  puedeRegistrarMovimiento(): boolean {
    const f = this.movForm;
    if (!f.idProducto || !f.cantidad || f.cantidad < 1) return false;
    if (f.tipo === 'AJUSTE' && !f.motivo.trim()) return false;
    return !this.procesandoMov();
  }

  registrarMovimiento(): void {
    if (!this.puedeRegistrarMovimiento()) return;

    this.procesandoMov.set(true);

    const request: MovimientoStockRequest = {
      idProducto: this.movForm.idProducto!,
      tipo: this.movForm.tipo,
      cantidad: this.movForm.cantidad!,
      motivo: this.movForm.motivo || undefined
    };

    this.inventarioService.registrarMovimiento(request).subscribe({
      next: (mov) => {
        this.procesandoMov.set(false);
        this.snackBar.open(
          `✓ Movimiento registrado: ${mov.nombreProducto} | ` +
          `${mov.stockAnterior} → ${mov.stockNuevo} uds.`,
          'OK',
          { duration: 4000, panelClass: 'snack-success' }
        );
        this.resetMovForm();
        this.cargarProductos();
        this.cargarMovimientos();
        this.cargarAlertas();
      },
      error: (err) => {
        this.procesandoMov.set(false);
        const msg = err.error?.mensaje ?? 'Error al registrar el movimiento';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
      }
    });
  }

  private resetMovForm(): void {
    this.movForm = {
      idProducto: null,
      tipo: 'ENTRADA',
      cantidad: null,
      motivo: ''
    };
  }

  getTipoClass(tipo: string): string {
    const map: Record<string, string> = {
      'ENTRADA': 'tipo-entrada',
      'SALIDA':  'tipo-salida',
      'AJUSTE':  'tipo-ajuste'
    };
    return map[tipo] ?? '';
  }

  getDiferenciaDisplay(mov: MovimientoStockResponse): string {
    const diff = mov.diferencia;
    return diff >= 0 ? `+${diff}` : `${diff}`;
  }

  // ── Alertas ────────────────────────────────────────────────

  marcarAlertaLeida(alerta: AlertaStockResponse): void {
    this.inventarioService.marcarAlertaLeida(alerta.idAlerta).subscribe({
      next: () => {
        this.alertas.update(items =>
          items.filter(a => a.idAlerta !== alerta.idAlerta)
        );
        this.snackBar.open('Alerta marcada como leída', 'OK',
          { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Error al actualizar alerta', 'Cerrar',
          { duration: 3000 });
      }
    });
  }

  getAlertaUrgencia(alerta: AlertaStockResponse): string {
    const ratio = alerta.stockCapturado / alerta.stockMinimo;
    if (ratio === 0) return 'urgente';
    if (ratio <= 0.5) return 'alta';
    return 'media';
  }

  // ── Precios masivos ────────────────────────────────────────

  puedeActualizarPrecio(): boolean {
    const f = this.precioForm;
    return !!f.idCategoria &&
           !!f.porcentajeAjuste &&
           f.porcentajeAjuste > 0 &&
           !this.procesandoPrecio();
  }

  actualizarPrecios(): void {
    if (!this.puedeActualizarPrecio()) return;

    this.procesandoPrecio.set(true);

    this.inventarioService.actualizarPreciosMasivo({
      idCategoria: this.precioForm.idCategoria!,
      porcentajeAjuste: this.precioForm.porcentajeAjuste!,
      tipoAjuste: this.precioForm.tipoAjuste
    }).subscribe({
      next: (productos) => {
        this.procesandoPrecio.set(false);
        this.snackBar.open(
          `✓ ${productos.length} productos actualizados correctamente`,
          'OK',
          { duration: 4000, panelClass: 'snack-success' }
        );
        this.precioForm = {
          idCategoria: null,
          porcentajeAjuste: null,
          tipoAjuste: 'INCREMENTO'
        };
        this.cargarProductos();
      },
      error: (err) => {
        this.procesandoPrecio.set(false);
        const msg = err.error?.mensaje ?? 'Error al actualizar precios';
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
}