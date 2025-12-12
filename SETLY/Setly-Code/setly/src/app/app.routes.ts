import { Routes } from '@angular/router';
import { PostLandingPage } from './features/post/post.page';
import { AuthGuard } from './core/guards/auth.guard';
import { ProfileGuard } from './core/guards/profile.guard';
import { TrustedActionGuard } from './core/guards/trusted-action.guard';
import { DevOnlyGuard } from './core/guards/dev-only.guard';
import { AUTH_FLAGS } from '../environments/auth.flags';
import { environment } from '../environments/environment';

// Helper to conditionally apply guards
const when = (cond: boolean, guards: any[]) => (cond ? guards : []);

export const routes: Routes = [
  {
    path: 'u/:username',
    loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage),
    title: 'Profile - Setly'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/search/search.page').then(m => m.SearchPage),
    title: 'Home - Setly',
    canActivate: []
  },
  // Backward compatibility: redirect old /search to /home
  { path: 'search', redirectTo: 'home', pathMatch: 'full' },
  // Redirect legacy connect/people to new People page
  { path: 'connect/people', redirectTo: 'people', pathMatch: 'full' },
  {
    path: 'explore',
    loadComponent: () => import('./features/events/explore.page').then(m => m.ExplorePageComponent),
    title: 'Explore - Setly'
  },
  {
    path: 'explore/:id',
    loadComponent: () => import('./features/events/explore-detail.page').then(m => m.ExploreDetailPageComponent),
    title: 'Details - Setly'
  },
  {
    path: 'people',
    loadComponent: () => import('./features/people/people.page').then(m => m.PeoplePage),
    title: 'People - Setly'
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/explore.page').then(m => m.ExplorePageComponent),
    title: 'Explore - Setly'
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./features/events/event-detail.page').then(m => m.EventDetailPage),
    title: 'Event Detail - Setly'
  },
  // Default landing page: Redirect root to Explore
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  // Keep home page accessible at /home for backward compatibility
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.page').then(m => m.HomePage),
    title: 'Setly - Find Your next Room'
  },
  {
    path: 'auth',
    title: 'Authentication - Setly',
    children: [
      { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
      {
        path: 'sign-in',
        loadComponent: () => import('./features/auth/pages/sign-in.page').then(m => m.SignInPage),
        title: 'Sign in - Setly'
      },
      {
        path: 'sign-up',
        loadComponent: () => import('./features/auth/pages/sign-up.page').then(m => m.SignUpPage),
        title: 'Create account - Setly'
      },
      {
        path: 'sign-out',
        loadComponent: () => import('./features/auth/pages/sign-out.page').then(m => m.SignOutPage),
        title: 'Signed out - Setly'
      },
      // Back-compat phone verification page (will be replaced by modal flow)
      {
        path: 'phone',
        loadComponent: () => import('./features/auth/verify-code.component').then(m => m.VerifyCodeComponent),
        title: 'Phone Verification - Setly'
      }
    ]
  },
  {
    path: 'profile/wizard',
    loadComponent: () => import('./features/auth/profile-wizard.component').then(m => m.ProfileWizardComponent),
    title: 'Complete Profile - Setly',
    canActivate: [AuthGuard]
  },
  {
    path: 'browse',
    loadComponent: () => import('./features/browse/browse.page').then(m => m.BrowsePage),
    title: 'Browse - Setly',
    // Publicly accessible; login required only for actions like posting or booking
    canActivate: []
  },
  {
    path: 'listing/:id',
    loadComponent: () => import('./features/listing-detail/listing-detail.page').then(m => m.ListingDetailPage),
    title: 'Room Details - Setly',
    // Publicly accessible; login required only for actions like contacting or booking
    canActivate: []
  },
  {
    path: 'post-room',
    loadComponent: () => import('./features/post-room/post-room.page').then(m => m.PostRoomPage),
    title: 'Post a Room - Setly',
    canActivate: [AuthGuard]
  },
  {
    path: 'open-room',
    loadComponent: () => import('./features/post-room/post-room.page').then(m => m.PostRoomPage),
    title: 'Post a Room - Setly',
    canActivate: [AuthGuard]
  },
  {
    path: 'post',
    loadComponent: () => Promise.resolve(PostLandingPage),
    title: 'Create a new post - Setly',
    canActivate: [AuthGuard]
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/messages/messages.page').then(m => m.MessagesPage),
    title: 'Messages - Setly',
    canActivate: [AuthGuard, TrustedActionGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile-v2.page').then(m => m.ProfileV2Page),
    title: 'Profile - Setly',
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/browse/browse.page').then(m => m.BrowsePage),
    title: 'Dashboard - Setly',
    // Keep dashboard public (mirrors browse)
    canActivate: []
  },
  {
    path: 'ride',
    loadComponent: () => import('./features/post-ride/post-ride.page').then(m => m.PostRidePage),
    title: 'Post a Ride - Setly',
    canActivate: [AuthGuard, TrustedActionGuard]
  },
  // Connect page temporarily hidden - Will be enabled when messaging/connections are fully implemented
  // {
  //   path: 'connect',
  //   loadComponent: () => import('./features/connect/connect.page').then(m => m.ConnectPage),
  //   title: 'Connect - Setly'
  // },
  // {
  //   path: 'connect/rooms',
  //   loadComponent: () => import('./features/connect/connect.page').then(m => m.ConnectPage),
  //   title: 'Connect - Rooms - Setly'
  // },
  // {
  //   path: 'connect/people',
  //   loadComponent: () => import('./features/connect/connect.page').then(m => m.ConnectPage),
  //   title: 'Connect - People - Setly'
  // },
  // {
  //   path: 'connect/rides',
  //   loadComponent: () => import('./features/connect/connect.page').then(m => m.ConnectPage),
  //   title: 'Connect - Rides - Setly'
  // },
  // {
  //   path: 'connect/marketplace',
  //   loadComponent: () => import('./features/connect/connect.page').then(m => m.ConnectPage),
  //   title: 'Connect - Marketplace - Setly'
  // },
  // {
  //   path: 'connect/topics',
  //   loadComponent: () => import('./features/connect/connect.page').then(m => m.ConnectPage),
  //   title: 'Connect - Topics - Setly'
  // },
  {
    path: 'profile/:id',
    loadComponent: () => import('./features/user-profile/user-profile.page').then(m => m.UserProfilePage),
    title: 'Profile - Setly'
  },
  {
    path: 'connect/map',
    loadComponent: () => import('./features/connect/connect-map.page').then(m => m.ConnectMapPage),
    title: 'Connect Map - Setly'
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
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/admin-users.page').then(m => m.AdminUsersPage),
    title: 'Admin · Users - Setly',
    canActivate: [AuthGuard]
  },
  // Hidden dev-only utilities (never accessible in production)
  {
    path: 'dev-tools',
    loadComponent: () => import('./features/dev-tools/dev-tools.page').then(m => m.DevToolsPage),
    title: 'Dev Tools - Setly',
    canActivate: [DevOnlyGuard]
  },
  // Legacy redirects
  {
    path: 'sign-in',
    redirectTo: '/auth/sign-in',
    pathMatch: 'full'
  },
  {
    path: 'sign-up',
    redirectTo: '/auth/sign-up',
    pathMatch: 'full'
  },
  {
    path: 'verify',
    redirectTo: '/auth/phone',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
