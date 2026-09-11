import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';

import { AuthService } from './core/auth/auth.service';
import { AuthenticatedUser } from './shared/models/auth.models';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly currentUser = signal<AuthenticatedUser | null>(null);
  protected readonly isAuthenticatedRoute = signal(false);
  protected readonly mobileNavigationOpen = signal(false);
  protected readonly isHandset = toSignal(
    this.breakpointObserver
      .observe('(max-width: 47.99rem)')
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );
  protected readonly showAuthenticatedShell = computed(
    () => this.isAuthenticatedRoute() && this.currentUser() !== null,
  );
  protected readonly isSupervisor = computed(
    () => this.currentUser()?.role === 'SUPERVISOR',
  );

  constructor() {
    this.syncShell(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.mobileNavigationOpen.set(false);
        this.syncShell(event.urlAfterRedirects);
      });
  }

  protected closeMobileNavigation(): void {
    if (this.isHandset()) {
      this.mobileNavigationOpen.set(false);
    }
  }

  protected onNavigationOpenedChange(open: boolean): void {
    if (this.isHandset()) {
      this.mobileNavigationOpen.set(open);
    }
  }

  protected logout(): void {
    this.authService.logout();
    this.currentUser.set(null);
    this.mobileNavigationOpen.set(false);
    void this.router.navigate(['/login']);
  }

  private syncShell(url: string): void {
    this.isAuthenticatedRoute.set(
      /^\/(?:shipments|dashboard|register)(?:\/|$)/.test(url),
    );
    this.currentUser.set(this.authService.getCurrentUser());
  }
}
