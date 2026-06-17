import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap } from 'rxjs';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  ProductoService,
  ProductoResponse,
  CategoriaResponse
} from '../../services/producto';

@Component({
  selector: 'app-catalog-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './catalog-view.html',
  styleUrl: './catalog-view.css'
})
export class CatalogViewComponent implements OnInit, OnDestroy {

  // Estado
  cargando = signal(true);
  error = signal<string | null>(null);

  // Datos
  catalogo = signal<ProductoResponse[]>([]);
  categorias = signal<CategoriaResponse[]>([]);
  tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Filtros activos
  terminoBusqueda = signal('');
  tallaSeleccionada = signal<string | null>(null);
  categoriaSeleccionada = signal<number | null>(null);

  // Carrito
  carrito = signal<ProductoResponse[]>([]);
  cantidadCarrito = computed(() => this.carrito().length);

  // Catálogo filtrado reactivamente (filtrado local tras la carga)
  catalogoFiltrado = computed(() => {
    let resultado = this.catalogo();

    const termino = this.terminoBusqueda().toLowerCase().trim();
    if (termino) {
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.modelo.toLowerCase().includes(termino) ||
        p.color.toLowerCase().includes(termino)
      );
    }

    const talla = this.tallaSeleccionada();
    if (talla) {
      resultado = resultado.filter(p => p.talla === talla);
    }

    const catId = this.categoriaSeleccionada();
    if (catId) {
      resultado = resultado.filter(p => p.idCategoria === catId);
    }

    return resultado;
  });

  private destroy$ = new Subject<void>();
  private busqueda$ = new Subject<string>();

  constructor(
    private productoService: ProductoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarCatalogo();
    this.cargarCategorias();
    this.configurarBusqueda();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carga inicial ──────────────────────────────────────────────

  private cargarCatalogo(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.productoService.getCatalogo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (productos) => {
          this.catalogo.set(productos);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error cargando catálogo:', err);
          this.error.set('No se pudo cargar el catálogo. Intenta nuevamente.');
          this.cargando.set(false);
        }
      });
  }

  private cargarCategorias(): void {
    this.productoService.getCategorias()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cats) => this.categorias.set(cats),
        error: (err) => console.error('Error cargando categorías:', err)
      });
  }

  // Debounce de 400ms en la búsqueda para no hacer petición por cada tecla
  private configurarBusqueda(): void {
    this.busqueda$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(termino => {
        this.terminoBusqueda.set(termino);
      });
  }

  // ── Eventos de UI ──────────────────────────────────────────────

  onBusqueda(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.busqueda$.next(valor);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda.set('');
    this.busqueda$.next('');
  }

  seleccionarTalla(talla: string): void {
    this.tallaSeleccionada.set(
      this.tallaSeleccionada() === talla ? null : talla
    );
  }

  seleccionarCategoria(idCategoria: number): void {
    this.categoriaSeleccionada.set(
      this.categoriaSeleccionada() === idCategoria ? null : idCategoria
    );
  }

  limpiarFiltros(): void {
    this.terminoBusqueda.set('');
    this.tallaSeleccionada.set(null);
    this.categoriaSeleccionada.set(null);
    this.busqueda$.next('');
  }

  agregarAlCarrito(producto: ProductoResponse): void {
    if (producto.stockActual === 0) return;
    this.carrito.update(c => [...c, producto]);
    this.snackBar.open(
      `✓ ${producto.nombre} agregado al carrito`,
      'Ver carrito',
      { duration: 3000, panelClass: 'snack-success' }
    );
  }

  reintentarCarga(): void {
    this.cargarCatalogo();
  }

  esBajoStock(producto: ProductoResponse): boolean {
    return producto.stockActual > 0 && producto.stockActual <= 5;
  }

  getNombreCategoria(idCategoria: number): string {
    return this.categorias().find(c => c.idCategoria === idCategoria)?.nombre ?? '';
  }
}