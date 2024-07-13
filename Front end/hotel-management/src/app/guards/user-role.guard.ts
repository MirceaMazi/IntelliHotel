import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { User, userRoles } from '../interfaces/user';

export const userRoleGuard: CanActivateFn = (
  route,
  state
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = localStorage.getItem('token')!;
  return authService.getUserProfile(token).pipe(
    map((user: User) => {
      if (user.role === userRoles.Admin) {
        return true;
      } else if (user.role === userRoles.Maid) {
        if (state.url.startsWith('/rooms')) {
          return true;
        } else {
          return router.createUrlTree(['/rooms']);
        }
      } else if (user.role === userRoles.Client) {
        if (state.url.startsWith('/rating')) {
          return true;
        } else {
          return router.createUrlTree(['/rating']);
        }
      } else {
        return router.createUrlTree(['/login']);
      }
    })
  );
};
