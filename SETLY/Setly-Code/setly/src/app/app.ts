import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/ui/header.component';
import { FooterComponent } from './shared/ui/footer.component';
import { PresenceIndicatorComponent } from './shared/ui/presence-indicator.component';
import { ToastContainerComponent } from './shared/ui/toast-container.component';
import { BottomNavComponent } from './shared/ui/bottom-nav.component';
import { environment as env } from '../environments/environment';
import { UserStore } from './core/state/user.store';
import { AuthSyncService } from './core/services/auth-sync.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent, PresenceIndicatorComponent, BottomNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // Expose environment to template (e.g., for demo banner)
  readonly environment = env;

  private userStore = inject(UserStore);
  private authSync = inject(AuthSyncService);

  async ngOnInit() {
    // Initialize auth state listener (Firebase -> backend sync -> stores)
    this.authSync.init();
    // Attempt initial user refresh for SSR/cookie session fallback
    try { await this.userStore.refresh(); } catch {}
  }
}
