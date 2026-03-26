import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Role } from '@fullstack-logistic-wrk/prisma';
import { AuthService } from '../auth.service';

export const roleGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = (route.data?.['roles'] as Role[] | undefined) ?? [];
  const currentUser = authService.currentUser();

  if (!currentUser) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        redirectTo: state.url,
      },
    });
  }

  if (requiredRoles.length === 0 || requiredRoles.includes(currentUser.role)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
