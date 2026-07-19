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
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { ProductoService, ProductoResponse } from '../../services/producto';
import { VentaService, VentaResponse } from '../../services/venta';
import { ClienteService, ClienteResponse } from '../../services/cliente';
import { Auth } from '../../services/auth';
import { ClienteModalComponent, ClienteModalData } from '../cliente-modal/cliente-modal';

export interface ItemCarrito {
  producto: ProductoResponse;
  cantidad: number;
  descuento: number;
  subtotal: number;
}

@Component({
  selector: 'app-punto-venta',
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
    MatDividerModule,
    MatTableModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './punto-venta.html',
  styleUrl: './punto-venta.css'
})
export class PuntoVentaComponent implements OnInit {

  // Catálogo
  catalogo = signal<ProductoResponse[]>([]);
  cargando = signal(true);
  terminoBusqueda = signal('');

  // Carrito
  carrito = signal<ItemCarrito[]>([]);

  // Cliente
  cliente = signal<ClienteResponse | null>(null);
  buscandoCliente = signal(false);
  documentoCliente = '';

  // Pago
  tipoComprobante = signal<'BOLETA' | 'FACTURA'>('BOLETA');
  metodoPago = signal<string>('EFECTIVO');
  metodosPago = ['EFECTIVO', 'TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA'];

  // Estado
  procesando = signal(false);
  ventaCompletada = signal<VentaResponse | null>(null);

  // Columnas de la tabla del carrito
  columnasCarrito = ['producto', 'cantidad', 'precio', 'descuento', 'subtotal', 'accion'];

  // Totales calculados reactivamente
  subtotal = computed(() =>
    this.carrito().reduce((acc, item) => acc + item.subtotal, 0)
  );

  igv = computed(() =>
    Math.round(this.subtotal() * 0.18 * 100) / 100
  );

  total = computed(() =>
    Math.round((this.subtotal() + this.igv()) * 100) / 100
  );

  catalogoFiltrado = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    if (!termino) return this.catalogo();
    return this.catalogo().filter(p =>
      p.nombre.toLowerCase().includes(termino) ||
      p.codigoBarra.toLowerCase().includes(termino) ||
      p.color.toLowerCase().includes(termino)
    );
  });

  nombreUsuario = '';

  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService,
    private clienteService: ClienteService,
    private auth: Auth,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = this.auth.getNombre() ?? 'Cajero';
    this.cargarCatalogo();
  }

  // ── Catálogo ───────────────────────────────────────────────────

  private cargarCatalogo(): void {
    this.cargando.set(true);
    this.productoService.getCatalogo().subscribe({
      next: (productos) => {
        this.catalogo.set(productos.filter(p => p.activo));
        this.cargando.set(false);
      },
      error: () => {
        this.snackBar.open('Error cargando catálogo', 'Cerrar',
          { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  // ── Carrito ────────────────────────────────────────────────────

  agregarAlCarrito(producto: ProductoResponse): void {
    if (producto.stockActual === 0) return;

    const carritoActual = this.carrito();
    const existente = carritoActual.find(
      i => i.producto.idProducto === producto.idProducto
    );

    if (existente) {
      if (existente.cantidad >= producto.stockActual) {
        this.snackBar.open(
          `Stock máximo disponible: ${producto.stockActual}`,
          'Cerrar', { duration: 2500 }
        );
        return;
      }
      this.carrito.update(items =>
        items.map(i =>
          i.producto.idProducto === producto.idProducto
            ? { ...i, cantidad: i.cantidad + 1,
                subtotal: this.calcularSubtotal(
                  i.cantidad + 1, producto.precioVenta, i.descuento) }
            : i
        )
      );
    } else {
      this.carrito.update(items => [...items, {
        producto,
        cantidad: 1,
        descuento: 0,
        subtotal: producto.precioVenta
      }]);
    }
  }

  actualizarCantidad(item: ItemCarrito, nuevaCantidad: number): void {
    if (nuevaCantidad < 1) { this.eliminarDelCarrito(item); return; }
    if (nuevaCantidad > item.producto.stockActual) {
      this.snackBar.open(
        `Stock disponible: ${item.producto.stockActual}`,
        'Cerrar', { duration: 2500 }
      );
      return;
    }
    this.carrito.update(items =>
      items.map(i =>
        i.producto.idProducto === item.producto.idProducto
          ? { ...i, cantidad: nuevaCantidad,
              subtotal: this.calcularSubtotal(
                nuevaCantidad, i.producto.precioVenta, i.descuento) }
          : i
      )
    );
  }

  actualizarDescuento(item: ItemCarrito, descuento: number): void {
    const desc = Math.min(Math.max(descuento, 0), 100);
    this.carrito.update(items =>
      items.map(i =>
        i.producto.idProducto === item.producto.idProducto
          ? { ...i, descuento: desc,
              subtotal: this.calcularSubtotal(
                i.cantidad, i.producto.precioVenta, desc) }
          : i
      )
    );
  }

  eliminarDelCarrito(item: ItemCarrito): void {
    this.carrito.update(items =>
      items.filter(i => i.producto.idProducto !== item.producto.idProducto)
    );
  }

  limpiarCarrito(): void {
    this.carrito.set([]);
    this.cliente.set(null);
    this.documentoCliente = '';
    this.ventaCompletada.set(null);
  }

  private calcularSubtotal(
    cantidad: number,
    precio: number,
    descuento: number
  ): number {
    const factor = 1 - descuento / 100;
    return Math.round(cantidad * precio * factor * 100) / 100;
  }

  // ── Cliente ────────────────────────────────────────────────────

  buscarCliente(): void {
    if (!this.documentoCliente.trim()) return;
    this.buscandoCliente.set(true);

    this.clienteService.buscarPorDocumento(this.documentoCliente).subscribe({
      next: (cliente) => {
        this.cliente.set(cliente);
        this.buscandoCliente.set(false);
        this.snackBar.open(
          `Cliente encontrado: ${cliente.numeroDocumento}`,
          'OK', { duration: 2000 }
        );
      },
      error: (err) => {
        this.buscandoCliente.set(false);

        if (err.status === 404) {
          // Cliente no existe: ofrecer crear uno nuevo
          this.snackBar.open(
            'Cliente no encontrado',
            'Registrar nuevo',
            { duration: 5000 }
          ).onAction().subscribe(() => {
            this.abrirModalNuevoCliente();
          });
        } else {
          this.snackBar.open(
            'Error al buscar el cliente',
            'Cerrar', { duration: 3000 }
          );
        }
      }
    });
  }

  abrirModalNuevoCliente(): void {
    const data: ClienteModalData = {
      numeroDocumentoPrevio: this.documentoCliente
    };

    const dialogRef = this.dialog.open(ClienteModalComponent, {
      data,
      disableClose: true,
      panelClass: 'gamarra-dialog'
    });

    dialogRef.afterClosed().subscribe((clienteCreado) => {
      if (clienteCreado) {
        this.cliente.set(clienteCreado);
        this.snackBar.open(
          `✓ Cliente ${clienteCreado.numeroDocumento} registrado`,
          'OK', { duration: 3000, panelClass: 'snack-success' }
        );
      }
    });
  }

  // ── Venta ──────────────────────────────────────────────────────

  puedeProcessr(): boolean {
    return this.carrito().length > 0 &&
           this.cliente() !== null &&
           !this.procesando();
  }

  procesarVenta(): void {
    if (!this.puedeProcessr()) return;

    this.procesando.set(true);

    const request = {
      idCliente: this.cliente()!.idCliente,
      tipoComprobante: this.tipoComprobante(),
      metodoPago: this.metodoPago(),
      detalle: this.carrito().map(item => ({
        idProducto: item.producto.idProducto,
        cantidad: item.cantidad,
        descuento: item.descuento
      }))
    };

    this.ventaService.procesarVenta(request).subscribe({
      next: (venta) => {
        this.ventaCompletada.set(venta);
        this.procesando.set(false);
        this.snackBar.open(
          `✓ Venta ${venta.numeroComprobante} registrada`,
          'OK', { duration: 4000, panelClass: 'snack-success' }
        );
      },
      error: (err) => {
        this.procesando.set(false);
        const mensaje = err.error?.mensaje ?? 'Error al procesar la venta';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
      }
    });
  }

  nuevaVenta(): void {
    this.limpiarCarrito();
    this.cargarCatalogo();
  }

  logout(): void {
    this.auth.logout();
  }
}