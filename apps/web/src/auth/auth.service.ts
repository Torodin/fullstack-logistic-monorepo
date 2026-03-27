import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { map, tap } from 'rxjs';
import type { AuthenticatedUser } from './models/authenticated-user.model';
import type { AuthResponse } from './models/auth-response.model';
import type { LoginPayload } from './models/login-payload.model';
import type { RegisterPayload } from './models/register-payload.model';

interface JwtPayload {
  sub: number;
  email: string;
  role: AuthenticatedUser['role'];
  exp?: number;
  iat?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorageKey = 'auth.access_token';

  private readonly tokenState = signal<string | null>(this.readTokenFromStorage());
  private readonly userState = signal<AuthenticatedUser | null>(
    this.decodeUserFromToken(this.tokenState())
  );

  readonly token = this.tokenState.asReadonly();
  readonly currentUser = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>('api/auth/login', payload).pipe(
      tap(({ access_token }) => this.setToken(access_token)),
      map(() => this.currentUser())
    );
  }

  register(payload: RegisterPayload) {
    return this.http.post('api/auth/register', payload);
  }

  logout(): void {
    this.setToken(null);
  }

  getToken(): string | null {
    return this.tokenState();
  }

  private setToken(token: string | null): void {
    this.tokenState.set(token);

    if (token) {
      localStorage.setItem(this.tokenStorageKey, token);
    } else {
      localStorage.removeItem(this.tokenStorageKey);
    }

    this.userState.set(this.decodeUserFromToken(token));
  }

  private readTokenFromStorage(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  private decodeUserFromToken(token: string | null): AuthenticatedUser | null {
    if (!token) {
      return null;
    }

    try {
      const payloadBase64Url = token.split('.')[1];
      if (!payloadBase64Url) {
        return null;
      }

      const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(payloadBase64);
      const payload = JSON.parse(decodedPayload) as JwtPayload;

      if (!payload.sub || !payload.email || !payload.role) {
        return null;
      }

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return null;
      }

      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return null;
    }
  }
}
