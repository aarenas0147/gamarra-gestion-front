import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductoSector {
  id_producto: number;
  codigo_barra: string;
  nombre: string;
  talla: string;
  color: string;
  precio_venta: number;
  stock_actual: number;
}

interface ItemCarrito {
  producto: ProductoSector;
  cantidad: number;
}

@Component({
  selector: 'app-punto-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './punto-venta.html',
  styleUrls: ['./punto-venta.css']
})
export class PuntoVentaComponent {
  public tipoDocumento: string = 'BOLETA';
  public metodoPago: string = 'EFECTIVO';
  public carrito: ItemCarrito[] = [];

  public productosRapidos: ProductoSector[] = [
    { id_producto: 1, codigo_barra: "POL-001", nombre: "Polo Algodón Pima", talla: "M", color: "Negro", precio_venta: 35.00, stock_actual: 45 },
    { id_producto: 2, codigo_barra: "JNS-024", nombre: "Jeans Slim Fit Stretch", talla: "30", color: "Azul", precio_venta: 75.00, stock_actual: 3 },
    { id_producto: 3, codigo_barra: "PLR-009", nombre: "Polera Winter Oversize", talla: "S", color: "Gris", precio_venta: 60.00, stock_actual: 12 },
    { id_producto: 4, codigo_barra: "CSC-102", nombre: "Casaca Denim Premium", talla: "L", color: "Azul", precio_venta: 110.00, stock_actual: 20 }
  ];

  public agregarAlCarrito(producto: ProductoSector): void {
    if (producto.stock_actual <= 0) return;

    const itemExistente = this.carrito.find(item => item.producto.id_producto === producto.id_producto);

    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock_actual) {
        itemExistente.cantidad++;
      }
    } else {
      this.carrito.push({ producto, cantidad: 1 });
    }
  }

  public modificarCantidad(item: ItemCarrito, cambio: number): void {
    item.cantidad += cambio;
    if (item.cantidad <= 0) {
      this.carrito = this.carrito.filter(c => c.producto.id_producto !== item.producto.id_producto);
    } else if (item.cantidad > item.producto.stock_actual) {
      item.cantidad = item.producto.stock_actual;
    }
  }

  public buscarPorSku(sku: string): void {
    const prod = this.productosRapidos.find(p => p.codigo_barra.toLowerCase() === sku.toLowerCase());
    if (prod) this.agregarAlCarrito(prod);
  }

  public calcularTotal(): number {
    return this.carrito.reduce((sum, item) => sum + (item.producto.precio_venta * item.cantidad), 0);
  }

  public calcularSubtotal(): number {
    return this.calcularTotal() / 1.18;
  }

  public calcularIgv(): number {
    return this.calcularTotal() - this.calcularSubtotal();
  }

  public procesarTransaccion(): void {
    console.log("Enviando payload JSON al VentaService del Backend", {
      tipo: this.tipoDocumento,
      metodo: this.metodoPago,
      items: this.carrito,
      total: this.calcularTotal()
    });
    alert("¡Venta procesada con éxito! Comprobante enviado a la cola de impresión.");
    this.carrito = [];
  }
}