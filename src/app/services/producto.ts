import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductoResponse {
  idProducto: number;
  idCategoria: number;
  nombreCategoria: string;
  codigoBarra: string;
  nombre: string;
  modelo: string;
  talla: string;
  color: string;
  material: string;
  precioCosto: number;
  precioVenta: number;
  margen: number;
  stockActual: number;
  stockMinimo: number;
  enStockCritico: boolean;
  activo: boolean;
  fechaRegistro: string;
}

export interface CategoriaResponse {
  idCategoria: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;
  private categoriasUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el catálogo público de productos activos.
   */
  getCatalogo(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.apiUrl}/catalogo`);
  }

  /**
   * Filtra el catálogo por categoría, talla y color.
   */
  filtrarCatalogo(
    idCategoria?: number,
    talla?: string,
    color?: string
  ): Observable<ProductoResponse[]> {
    let params = new HttpParams();
    if (idCategoria) params = params.set('idCategoria', idCategoria);
    if (talla)       params = params.set('talla', talla);
    if (color)       params = params.set('color', color);
    return this.http.get<ProductoResponse[]>(
      `${this.apiUrl}/catalogo/filtrar`, { params }
    );
  }

  /**
   * Busca productos por término en nombre o modelo.
   */
  buscarPorTermino(termino: string): Observable<ProductoResponse[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<ProductoResponse[]>(
      `${this.apiUrl}/catalogo/buscar`, { params }
    );
  }

  /**
   * Obtiene todas las categorías activas.
   */
  getCategorias(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(this.categoriasUrl);
  }
}