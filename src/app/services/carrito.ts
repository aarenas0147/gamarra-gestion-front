import { Injectable, signal, computed } from '@angular/core';
import { ProductoResponse } from './producto';

export interface ItemCarrito {
  producto: ProductoResponse;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private readonly STORAGE_KEY = 'gamarra_carrito';

  private _items = signal<ItemCarrito[]>(this.cargarDesdeStorage());

  // Señales públicas reactivas
  items = this._items.asReadonly();

  cantidadTotal = computed(() =>
    this._items().reduce((acc, i) => acc + i.cantidad, 0)
  );

  subtotal = computed(() =>
    this._items().reduce((acc, i) =>
      acc + i.producto.precioVenta * i.cantidad, 0)
  );

  igv = computed(() =>
    Math.round(this.subtotal() * 0.18 * 100) / 100
  );

  total = computed(() =>
    Math.round((this.subtotal() + this.igv()) * 100) / 100
  );

  // ── Operaciones ──────────────────────────────────────────────

  agregar(producto: ProductoResponse): void {
    const items = this._items();
    const existente = items.find(
      i => i.producto.idProducto === producto.idProducto
    );

    if (existente) {
      if (existente.cantidad >= producto.stockActual) return;
      this._items.update(list =>
        list.map(i =>
          i.producto.idProducto === producto.idProducto
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      );
    } else {
      this._items.update(list => [...list, { producto, cantidad: 1 }]);
    }

    this.guardarEnStorage();
  }

  actualizarCantidad(idProducto: number, cantidad: number): void {
    if (cantidad < 1) {
      this.eliminar(idProducto);
      return;
    }
    this._items.update(list =>
      list.map(i =>
        i.producto.idProducto === idProducto
          ? { ...i, cantidad: Math.min(cantidad, i.producto.stockActual) }
          : i
      )
    );
    this.guardarEnStorage();
  }

  eliminar(idProducto: number): void {
    this._items.update(list =>
      list.filter(i => i.producto.idProducto !== idProducto)
    );
    this.guardarEnStorage();
  }

  limpiar(): void {
    this._items.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  estaEnCarrito(idProducto: number): boolean {
    return this._items().some(i => i.producto.idProducto === idProducto);
  }

  getCantidadProducto(idProducto: number): number {
    return this._items().find(
      i => i.producto.idProducto === idProducto
    )?.cantidad ?? 0;
  }

  // ── Storage ──────────────────────────────────────────────────

  private guardarEnStorage(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this._items())
      );
    } catch { }
  }

  private cargarDesdeStorage(): ItemCarrito[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}