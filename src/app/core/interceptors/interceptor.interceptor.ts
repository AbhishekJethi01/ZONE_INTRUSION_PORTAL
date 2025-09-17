import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const isLoggingRequest = req.url.includes('/login');
  const router = inject(Router);
  if (isLoggingRequest) {
    return next(req);
  }

  const token = authService.getToken();

  if (!token) {
    authService.deleteToken();
    router.navigate(['/Zone/login']);
    return next(req);
  }
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authService.getToken()}`
    }
  })
  return next(authReq);
};
