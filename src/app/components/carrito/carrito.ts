import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CarritoService } from '../../services/carrito';
import { ClienteService, ClienteResponse } from '../../services/cliente';
import { VentaService, VentaResponse } from '../../services/venta';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoComponent implements OnInit {

  // Carrito
  get items() {
    return this.carritoService.items;
  }

  get subtotal() {
    return this.carritoService.subtotal;
  }

  get igv() {
    return this.carritoService.igv;
  }

  get total() {
    return this.carritoService.total;
  }

  // Cliente
  cliente = signal<ClienteResponse | null>(null);
  buscandoCliente = signal(false);
  documentoCliente = '';
  errorCliente = signal<string | null>(null);

  // Pago
  tipoComprobante = signal<'BOLETA' | 'FACTURA'>('BOLETA');
  metodoPago = signal<string>('EFECTIVO');
  metodosPago = ['EFECTIVO', 'TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA'];

  // Estado
  procesando = signal(false);
  comprobante = signal<VentaResponse | null>(null);

  nombreUsuario = '';

  constructor(
    public carritoService: CarritoService,
    private clienteService: ClienteService,
    private ventaService: VentaService,
    private auth: Auth,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = this.auth.getNombre() ?? '';
    if (this.items().length === 0 && !this.comprobante()) {
      this.snackBar.open(
        'Tu carrito está vacío', 'Cerrar', { duration: 3000 }
      );
    }
  }

  // ── Cliente ────────────────────────────────────────────────

  buscarCliente(): void {
    if (!this.documentoCliente.trim()) return;
    this.buscandoCliente.set(true);
    this.errorCliente.set(null);

    this.clienteService.buscarPorDocumento(this.documentoCliente).subscribe({
      next: (c) => {
        this.cliente.set(c);
        this.buscandoCliente.set(false);
      },
      error: () => {
        this.errorCliente.set(
          'No se encontró un cliente con ese documento. ' +
          'Verifica el número ingresado.'
        );
        this.cliente.set(null);
        this.buscandoCliente.set(false);
      }
    });
  }

  // ── Carrito ────────────────────────────────────────────────

  actualizarCantidad(idProducto: number, cantidad: number): void {
    this.carritoService.actualizarCantidad(idProducto, cantidad);
  }

  eliminar(idProducto: number): void {
    this.carritoService.eliminar(idProducto);
  }

  // ── Compra ─────────────────────────────────────────────────

  puedeComprar(): boolean {
    return this.items().length > 0 &&
           this.cliente() !== null &&
           !this.procesando();
  }

  finalizarCompra(): void {
    if (!this.puedeComprar()) return;
    this.procesando.set(true);

    const request = {
      idCliente: this.cliente()!.idCliente,
      tipoComprobante: this.tipoComprobante(),
      metodoPago: this.metodoPago(),
      detalle: this.items().map(i => ({
        idProducto: i.producto.idProducto,
        cantidad: i.cantidad,
        descuento: 0
      }))
    };

    this.ventaService.procesarVenta(request).subscribe({
      next: (venta) => {
        this.comprobante.set(venta);
        this.carritoService.limpiar();
        this.procesando.set(false);
      },
      error: (err) => {
        this.procesando.set(false);
        const msg = err.error?.mensaje ?? 'Error al procesar la compra';
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
      }
    });
  }

  volverAlCatalogo(): void {
    this.router.navigate(['/']);
  }

  // ── Utilidades ─────────────────────────────────────────────

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}