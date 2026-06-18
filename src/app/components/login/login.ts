import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
} as any)
export class LoginComponent {
  
  public credentials = {
    correo: '',
    password: ''
  };

  public errorMessage: string | null = null;
  public isLoading: boolean = false;

  constructor(private router: Router, private authService: Auth) {}

  public onSubmit(): void {
    this.errorMessage = null;
    this.isLoading = true;

    if (!this.credentials.correo || !this.credentials.password) {
      this.errorMessage = 'Por favor ingresa el correo y la contraseña';
      this.isLoading = false;
      return;
    }

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Autenticación exitosa:', response);
        // El Auth service ya guarda token y datos en localStorage
        if (response.usuario) {
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
        }
        // Redirecciona según el rol
        if (response.rol === 'ADMINISTRADOR') {
          this.router.navigate(['/admin']);
        } else if (response.rol === 'ENCARGADO_ALMACEN') {
          this.router.navigate(['/almacen']);
        } else {
          this.router.navigate(['/']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage = error.error?.mensaje || 'Correo o contraseña incorrectos';
        this.isLoading = false;
      }
    });
  }
}