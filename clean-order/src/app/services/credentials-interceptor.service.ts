import { HttpInterceptorFn } from '@angular/common/http';

const API_ORIGIN = 'https://localhost:7226/';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(API_ORIGIN)) {
    req = req.clone({ withCredentials: true });
  }
  return next(req);
};