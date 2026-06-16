import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ProductoMock {
  id_producto: number;
  codigo_barra: string;
  nombre: string;
  categoria: string;
  talla: string;
  color: string;
  material: string;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.html',
  styleUrls: ['./inventario.css']
})
export class InventarioComponent implements OnInit {
  
  public listaProductos: ProductoMock[] = [
    {
      id_producto: 1,
      codigo_barra: "POL-001",
      nombre: "Polo Algodón Pima Premium",
      categoria: "Polos",
      talla: "M",
      color: "Negro",
      material: "100% Algodón",
      precio_venta: 35.00,
      stock_actual: 45,
      stock_minimo: 15
    },
    {
      id_producto: 2,
      codigo_barra: "JNS-024",
      nombre: "Jeans Slim Fit Stretch",
      categoria: "Jeans",
      talla: "30",
      color: "Azul",
      material: "Denim",
      precio_venta: 75.00,
      stock_actual: 3,
      stock_minimo: 10
    },
    {
      id_producto: 3,
      codigo_barra: "PLR-009",
      nombre: "Polera Winter Oversize",
      categoria: "Poleras",
      talla: "S",
      color: "Gris",
      material: "Franela reactiva",
      precio_venta: 60.00,
      stock_actual: 12,
      stock_minimo: 8
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  public filtrarProductos(event: Event): void {
    const filtro = (event.target as HTMLInputElement).value;
  }

  public abrirModal(): void {
    console.log("Desplegando formulario de inserción");
  }
}