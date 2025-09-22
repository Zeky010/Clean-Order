import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild, CanMatch, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild, CanMatch {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.check();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.check();
  }

  canMatch(): Observable<boolean | UrlTree> {
    return this.check();
  }

  private check(): Observable<boolean | UrlTree> {
    return this.authService.checkAuth().pipe(
      map(ok => ok ? true : this.router.createUrlTree(['/login']))
    );
  }
}