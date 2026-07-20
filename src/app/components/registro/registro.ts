import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Auth, RegistroRequest } from '../../services/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent {

  tiposDocumento = ['DNI', 'RUC', 'CE'];

  form: RegistroRequest = {
    nombres: '',
    apellidos: '',
    correo: '',
    password: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    razonSocial: '',
    telefono: '',
    direccion: ''
  };

  confirmarPassword = '';
  mostrarPassword = false;
  mostrarConfirmar = false;

  cargando = signal(false);
  errorMessage = signal<string | null>(null);
  exitoso = signal(false);
  mensajeExito = signal('');

  // Pasos del formulario
  pasoActual = signal<1 | 2>(1);

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  // ── Validaciones ───────────────────────────────────────────

  puedeSiguiente(): boolean {
    return !!this.form.nombres.trim() &&
           !!this.form.apellidos.trim() &&
           !!this.form.correo.trim() &&
           this.form.correo.includes('@') &&
           this.form.password.length >= 8 &&
           this.form.password === this.confirmarPassword;
  }

  puedeRegistrar(): boolean {
    return this.puedeSiguiente() && !this.cargando();
  }

  passwordsCoinciden(): boolean {
    return !this.confirmarPassword ||
           this.form.password === this.confirmarPassword;
  }

  // ── Navegación por pasos ───────────────────────────────────

  irPaso2(): void {
    if (this.puedeSiguiente()) this.pasoActual.set(2);
  }

  irPaso1(): void {
    this.pasoActual.set(1);
  }

  // ── Registro ───────────────────────────────────────────────

  onSubmit(): void {
    if (!this.puedeRegistrar()) return;
    this.cargando.set(true);
    this.errorMessage.set(null);

    // Limpiar campos opcionales vacíos
    const request: RegistroRequest = {
      ...this.form,
      numeroDocumento: this.form.numeroDocumento?.trim() || undefined,
      razonSocial: this.form.razonSocial?.trim() || undefined,
      telefono: this.form.telefono?.trim() || undefined,
      direccion: this.form.direccion?.trim() || undefined,
    };

    this.authService.registro(request).subscribe({
      next: (response) => {
        this.cargando.set(false);
        this.exitoso.set(true);
        this.mensajeExito.set(response.mensaje);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 400) {
          this.errorMessage.set(
            err.error?.mensaje ?? 'Datos inválidos. Revisa el formulario.'
          );
        } else if (err.status === 0) {
          this.errorMessage.set(
            'No se pudo conectar al servidor.'
          );
        } else {
          this.errorMessage.set(
            err.error?.mensaje ?? 'Error inesperado. Intenta nuevamente.'
          );
        }
      }
    });
  }

  irAlLogin(): void {
    this.router.navigate(['/login']);
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleConfirmar(): void {
    this.mostrarConfirmar = !this.mostrarConfirmar;
  }
}