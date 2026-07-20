import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegistroRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  password: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  razonSocial?: string;
  telefono?: string;
  direccion?: string;
}

export interface RegistroResponse {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  rol: string;
  idCliente: number;
  mensaje: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'gamarra_token';
  private readonly ROL_KEY = 'gamarra_rol';
  private readonly NOMBRE_KEY = 'gamarra_nombre';

  constructor(private http: HttpClient) {}

  /**
   * Envía las credenciales al backend y almacena
   * el token JWT en localStorage al recibir respuesta exitosa.
   */
  login(credentials: { correo: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response?.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.ROL_KEY, response.rol);
          localStorage.setItem(this.NOMBRE_KEY, response.nombreCompleto);
        }
      })
    );
  }

  registro(request: RegistroRequest): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(
      `${this.apiUrl}/registro`, request
    );
  }

  /**
   * Elimina el token y datos de sesión del localStorage.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROL_KEY);
    localStorage.removeItem(this.NOMBRE_KEY);
  }

  /**
   * Retorna true si existe un token almacenado.
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Retorna el token JWT almacenado.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Retorna el rol del usuario autenticado.
   */
  getRol(): string | null {
    return localStorage.getItem(this.ROL_KEY);
  }

  /**
   * Retorna el nombre completo del usuario autenticado.
   */
  getNombre(): string | null {
    return localStorage.getItem(this.NOMBRE_KEY);
  }

  /**
   * Verifica si el usuario tiene un rol específico.
   */
  hasRol(rol: string): boolean {
    return this.getRol() === rol;
  }
}