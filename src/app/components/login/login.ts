import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
} as any)
export class LoginComponent {
  
  public credentials = {
    username: '',
    password: ''
  };

  public errorMessage: string | null = null;

  constructor(private router: Router) {}

  public onSubmit(): void {
    this.errorMessage = null; // Limpiar errores previos

    // Simulación académica de control de accesos basado en roles directos
    if (this.credentials.username.trim() === 'admin' && this.credentials.password === 'admin123') {
      console.log('Acceso concedido: Rol Administrador');
      this.router.navigate(['/admin']); // Redirecciona a la ruta de analítica y reportes
    } 
    else if (this.credentials.username.trim() === 'almacen' && this.credentials.password === 'almacen123') {
      console.log('Acceso concedido: Rol Encargado de Almacén');
      this.router.navigate(['/almacen']); // Redirecciona a la ruta de control de stock y Kardex
    } 
    else {
      // Si las credenciales no coinciden con los roles de simulación de la rúbrica
      this.errorMessage = "Credenciales incorrectas para el entorno de evaluación. Use 'admin/admin123' o 'almacen/almacen123'.";
    }
  }
}