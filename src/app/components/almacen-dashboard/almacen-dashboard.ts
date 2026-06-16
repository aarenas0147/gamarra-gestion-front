import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ItemInventario {
  sku: string;
  nombre: string;
  material: string;
  talla: string;
  color: string;
  stock: number;
  stockMinimo: number;
}

@Component({
  selector: 'app-almacen-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './almacen-dashboard.html',
  styleUrls: ['./almacen-dashboard.css']
})
export class AlmacenDashboardComponent implements OnInit {
  
  // Variables de control de estado para KPIs de la MYPE
  public totalPrendas: number = 0;
  public prendasCriticas: number = 0;
  public listaInventario: ItemInventario[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.inicializarInventario();
  }

  /**
   * Carga de datos simulada simulando el comportamiento de las entidades de la BD PostgreSQL
   */
  public inicializarInventario(): void {
    this.listaInventario = [
      {
        sku: "POL-PIM-M-BLA",
        nombre: "Polo Algodón Pima Premium",
        material: "100% Algodón",
        talla: "M",
        color: "Blanco",
        stock: 120,
        stockMinimo: 20
      },
      {
        sku: "JNS-SLM-30-AZU",
        nombre: "Jeans Slim Fit Denim Stretch",
        material: "Denim",
        talla: "30",
        color: "Azul Indigo",
        stock: 12,
        stockMinimo: 15 // Provocará alerta de Stock Bajo
      },
      {
        sku: "POL-WIN-S-NEG",
        nombre: "Polera Winter Con Capucha",
        material: "Franela Reactiva",
        talla: "S",
        color: "Negro",
        stock: 0,
        stockMinimo: 10 // Provocará alerta de Agotado
      },
      {
        sku: "BLU-DEN-L-CEL",
        nombre: "Blusa Denim Confección Nacional",
        material: "Denim Ligero",
        talla: "L",
        color: "Celeste",
        stock: 45,
        stockMinimo: 12
      }
    ];

    this.calcularMetricas();
  }

  /**
   * Procesa la lógica de negocio requerida en las especificaciones funcionales
   */
  private calcularMetricas(): void {
    // Reduce clásico para sumar existencias
    this.totalPrendas = this.listaInventario.reduce((acc, item) => acc + item.stock, 0);
    
    // Filtrado de ítems por debajo del stock de seguridad
    this.prendasCriticas = this.listaInventario.filter(item => item.stock <= item.stockMinimo).length;
  }

  /**
   * Destruye de forma segura la sesión y regresa al login general
   */
  public logout(): void {
    console.log("Cerrando sesión de almacén. Removiendo estados...");
    this.router.navigate(['/login']);
  }
}