import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Venta {
  private apiUrl = `${environment.apiUrl}/venta`;

  constructor(private http: HttpClient) {}

  getVentas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getVentaById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createVenta(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateVenta(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteVenta(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
