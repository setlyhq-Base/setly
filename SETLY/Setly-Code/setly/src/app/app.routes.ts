import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { ProfileGuard } from './core/guards/profile.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.page').then(m => m.HomePage),
    title: 'Setly - Find your next room'
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.page').then(m => m.AuthPage),
    title: 'Authentication - Setly',
    children: [
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
      },
      {
        path: 'sign-in',
        loadComponent: () => import('./features/auth/auth.page').then(m => m.AuthPage),
        title: 'Sign In - Setly'
      },
      {
        path: 'phone',
        loadComponent: () => import('./features/auth/verify-code.component').then(m => m.VerifyCodeComponent),
        title: 'Phone Verification - Setly'
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/auth/profile-wizard.component').then(m => m.ProfileWizardComponent),
        title: 'Complete Profile - Setly'
      }
    ]
  },
  {
    path: 'browse',
    loadComponent: () => import('./features/browse/browse.page').then(m => m.BrowsePage),
    title: 'Browse Rooms - Setly',
    canActivate: [AuthGuard, ProfileGuard]
  },
  {
    path: 'listing/:id',
    loadComponent: () => import('./features/listing-detail/listing-detail.page').then(m => m.ListingDetailPage),
    title: 'Room Details - Setly',
    canActivate: [AuthGuard, ProfileGuard]
  },
  {
    path: 'post-room',
    loadComponent: () => import('./features/post-room/post-room.page').then(m => m.PostRoomPage),
    title: 'Post a Room - Setly',
    canActivate: [AuthGuard, ProfileGuard]
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/messages/messages.page').then(m => m.MessagesPage),
    title: 'Messages - Setly',
    canActivate: [AuthGuard, ProfileGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage),
    title: 'Profile - Setly',
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/browse/browse.page').then(m => m.BrowsePage),
    title: 'Dashboard - Setly',
    canActivate: [AuthGuard, ProfileGuard]
  },
  {
    path: 'ride',
    loadComponent: () => import('./features/ride/ride.page').then(m => m.RidePage),
    title: 'SetlyRide - Setly',
    canActivate: [AuthGuard, ProfileGuard]
  },
  {
    path: 'terms/settlyride',
    loadComponent: () => import('./features/terms/settlyride.page').then(m => m.SettlyrideTermsPage),
    title: 'SetlyRide Terms - Setly'
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.page').then(m => m.SettingsPage),
    title: 'Settings - Setly',
    canActivate: [AuthGuard]
  },
  // Legacy redirects
  {
    path: 'sign-in',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
  {
    path: 'sign-up',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
  {
    path: 'verify',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
