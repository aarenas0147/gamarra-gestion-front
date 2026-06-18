import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

/**
 * Guard genérico: verifica que el usuario esté autenticado.
 * Si no tiene token, redirige al login.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * Guard del carrito: si no está autenticado redirige al login
 * guardando la ruta de retorno para volver después del login.
 */
export const carritoGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], {
    queryParams: { returnUrl: '/carrito' }
  });
  return false;
};

/**
 * Guard exclusivo para el Administrador.
 * Si está autenticado pero no tiene el rol correcto,
 * redirige al catálogo con acceso denegado.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.hasRol('ADMINISTRADOR')) {
    return true;
  }

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Autenticado pero sin el rol correcto
  router.navigate(['/acceso-denegado']);
  return false;
};

/**
 * Guard para el Encargado de Almacén.
 * También permite acceso al Administrador.
 */
export const almacenGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const rolesPermitidos = ['ADMINISTRADOR', 'ENCARGADO_ALMACEN'];

  if (auth.isAuthenticated() && rolesPermitidos.includes(auth.getRol() ?? '')) {
    return true;
  }

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  router.navigate(['/acceso-denegado']);
  return false;
};

/**
 * Guard inverso: evita que un usuario ya autenticado
 * vuelva a acceder al login. Lo redirige a su panel.
 */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  // Ya está logueado, redirigir según su rol
  const rol = auth.getRol();
  if (rol === 'ADMINISTRADOR') {
    router.navigate(['/admin']);
  } else if (rol === 'ENCARGADO_ALMACEN') {
    router.navigate(['/almacen']);
  } else {
    router.navigate(['/']);
  }

  return false;
};