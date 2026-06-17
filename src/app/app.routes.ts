import { Routes } from '@angular/router';
import { CatalogViewComponent } from './components/catalog-view/catalog-view';
import { LoginComponent } from './components/login/login';
import { AlmacenDashboardComponent } from './components/almacen-dashboard/almacen-dashboard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { authGuard, adminGuard, almacenGuard, noAuthGuard } from './services/auth.guard';

export const routes: Routes = [
  // Catálogo público — sin restricción
  {
    path: '',
    component: CatalogViewComponent
  },

  // Login — bloqueado si ya está autenticado
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard]
  },

  // Panel de almacén — solo ENCARGADO_ALMACEN o ADMINISTRADOR
  {
    path: 'almacen',
    component: AlmacenDashboardComponent,
    canActivate: [almacenGuard]
  },

  // Panel de administración — solo ADMINISTRADOR
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  },

  // Ruta 404 — redirige al catálogo
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];