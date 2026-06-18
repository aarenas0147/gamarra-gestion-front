import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClienteResponse {
  idCliente: number;
  tipoDocumento: string;
  numeroDocumento: string;
  razonSocial: string;
  telefono: string;
  direccion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  buscarPorDocumento(numero: string): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(
      `${this.apiUrl}/documento/${numero}`
    );
  }
}