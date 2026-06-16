import { Routes } from '@angular/router';
import { CatalogViewComponent } from './components/catalog-view/catalog-view';
import { LoginComponent } from './components/login/login';
import { AlmacenDashboardComponent } from './components/almacen-dashboard/almacen-dashboard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  // Ruta pública por defecto: El catálogo textil para los clientes de Gamarra
  { path: '', component: CatalogViewComponent },
  
  // Ruta para el inicio de sesión cifrado (Cajeros, Almaceneros, Administrador)
  { path: 'login', component: LoginComponent },
  
  // Panel privado para el Encargado de Almacén (Kardex, Entradas, Ajustes)
  { path: 'almacen', component: AlmacenDashboardComponent },
  
  // Panel privado de toma de decisiones para el Administrador (Reportes y Gráficos)
  { path: 'admin', component: AdminDashboardComponent },
  
  // Redirección por si el usuario escribe cualquier ruta inexistente
  { path: '**', redirectTo: '', pathMatch: 'full' }
];