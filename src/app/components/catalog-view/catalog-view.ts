import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface PrendaVitrina {
  id_producto: number;
  nombre: string;
  nombre_corto: string;
  talla: string;
  material: string;
  precio_venta: number;
  stock_actual: number;
}

@Component({
  selector: 'app-catalog-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalog-view.html',
  styleUrl: './catalog-view.css',
})
export class CatalogViewComponent {
  public cantidadCarrito: number = 0;

  public catalogo: PrendaVitrina[] = [
    {
      id_producto: 1,
      nombre: "Polo Algodón Pima Estampado",
      nombre_corto: "Polo Pima",
      talla: "M",
      material: "100% Algodón",
      precio_venta: 35.00,
      stock_actual: 45
    },
    {
      id_producto: 2,
      nombre: "Jeans Slim Fit Denim Stretch",
      nombre_corto: "Jeans Slim",
      talla: "30",
      material: "Denim",
      precio_venta: 75.00,
      stock_actual: 3
    },
    {
      id_producto: 3,
      nombre: "Polera Winter Con Capucha",
      nombre_corto: "Polera Winter",
      talla: "S",
      material: "Franela reactiva",
      precio_venta: 60.00,
      stock_actual: 0
    }
  ];

  public agregarAlCarrito(): void {
    this.cantidadCarrito++;
  }
}
