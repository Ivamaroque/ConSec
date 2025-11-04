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
          // Se for gestor tentando acessar rota de funcionário, redireciona para dashboard
          if (user?.cargo === 'gestor') {
            this.router.navigate(['/dashboard']);
            return false;
          }
          // Se for funcionário tentando acessar rota de gestor, redireciona para meus-custos
          if (user?.cargo === 'funcionario') {
            this.router.navigate(['/meus-custos']);
            return false;
          }
        }
      }

      return true;
    }

    // Se não estiver logado, redireciona para login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

}
