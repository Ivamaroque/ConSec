import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isLoggedIn()) {
      // Verifica se a rota requer um cargo específico
      const requiredRole = route.data['role'];

      if (requiredRole) {
        const user = this.authService.getCurrentUser();
        if (user?.cargo !== requiredRole) {
          // Se não tiver o cargo necessário, redireciona para home
          this.router.navigate(['/']);
          return false;
        }
      }

      return true;
    }

    // Se não estiver logado, redireciona para login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

}
