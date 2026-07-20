import { Routes } from '@angular/router';
import { CatalogViewComponent } from './components/catalog-view/catalog-view';
import { LoginComponent } from './components/login/login';
import { AlmacenDashboardComponent } from './components/almacen-dashboard/almacen-dashboard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { authGuard, adminGuard, almacenGuard, carritoGuard, noAuthGuard } from './services/auth.guard';
import { PuntoVentaComponent } from './components/punto-venta/punto-venta';

export const routes: Routes = [
  // Catálogo público — sin restricción
  {
    path: '',
    component: CatalogViewComponent
  },

  {
    path: 'carrito',
    loadComponent: () =>
      import('./components/carrito/carrito').then(m => m.CarritoComponent),
    canActivate: [carritoGuard]
  },

  // Punto de venta — solo ENCARGADO_ALMACEN o ADMINISTRADOR
  {
    path: 'punto-venta',
    component: PuntoVentaComponent,
    canActivate: [almacenGuard]
  },

  // Login — bloqueado si ya está autenticado
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard]
  },

  // Registro — bloqueado si ya está autenticado
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/registro/registro')
        .then(m => m.RegistroComponent),
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