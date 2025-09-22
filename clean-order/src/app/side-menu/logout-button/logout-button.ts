import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [],
  templateUrl: './logout-button.html',
  styleUrl: './logout-button.css'
})
export class LogoutButton {
  private auth = inject(AuthService);
  private router = inject(Router);
  loading = false;

  logout() {
    if (this.loading) return;
    this.loading = true;
    this.auth.logout().subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      }
    });
  }

}
