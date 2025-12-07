import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, Params } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

import { RoomStoreService } from '../../core/services/room-store.service';
import { UniversityService, University } from '../../core/services/university.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from '../../core/services/messaging.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { RidesService } from '../../core/services/rides.service';
import { Room } from '../../core/models/room.model';
import { CurrencyCompactPipe } from '../../shared/pipes/currency-compact.pipe';
import { SkeletonCardComponent } from '../../shared/ui/skeleton-card.component';

import { SearchHeroComponent } from '../../shared/ui/search-hero/search-hero.component';
import { RideRequestModalComponent } from '../../shared/ui/ride-request-modal.component';
import { HeaderComponent } from '../../shared/ui/header.component';
import { ProfileNudgeBannerComponent } from '../../shared/ui/profile-nudge-banner.component';

interface SearchParams {
  query?: string;
  city?: string;
  roomType?: 'shared' | 'Private';
  checkIn?: string;
  checkOut?: string;
  studentVerifiedOnly?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SearchHeroComponent,
    RideRequestModalComponent,
    ProfileNudgeBannerComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#FAFBFF] via-white to-[#F8FAFF] text-gray-900 app-shell page-transition">
      <!-- Debug marker -->
      <div class="sr-only" data-testid="home-debug">home-component-mounted</div>
      
      <!-- Floating Particles Background -->
      <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-[10%] w-2 h-2 rounded-full bg-blue-400/20 animate-float"></div>
        <div class="absolute top-40 right-[15%] w-3 h-3 rounded-full bg-indigo-400/20 animate-float-delayed"></div>
        <div class="absolute top-[60%] left-[20%] w-2.5 h-2.5 rounded-full bg-purple-400/20 animate-float"></div>
        <div class="absolute bottom-40 right-[25%] w-2 h-2 rounded-full bg-pink-400/20 animate-float-delayed"></div>
      </div>

      <!-- Profile completion nudge banner -->
      <section class="container mx-auto px-4 pt-4 max-w-7xl">
        <app-profile-nudge-banner></app-profile-nudge-banner>
      </section>

      <!-- 🌟 PREMIUM HERO SECTION -->
      <section class="relative isolate overflow-hidden pt-16 md:pt-24 pb-20 md:pb-32" data-testid="hero-section">
        <!-- Animated gradient orbs -->
        <div class="absolute top-[-8rem] left-1/2 -translate-x-1/2 w-[70rem] h-[70rem] rounded-full bg-gradient-to-tr from-[#4E7BFD]/20 via-[#7B9EFD]/10 to-transparent blur-3xl animate-pulse-slow"></div>
        <div class="absolute bottom-[-6rem] right-[-4rem] w-[50rem] h-[50rem] rounded-full bg-gradient-to-tl from-[#F5C75D]/15 via-[#FDD97D]/5 to-transparent blur-3xl animate-pulse-slower"></div>
        
        <div class="container mx-auto px-4 max-w-7xl">
          <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            <!-- 📱 LEFT: Content Column -->
            <div class="flex-1 w-full space-y-8 animate-fade-in-up">
              <!-- Badge -->
              <div class="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all group cursor-default">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span class="text-xs md:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Live in 500+ Universities
                </span>
              </div>

              <!-- Hero Title -->
              <div class="space-y-6">
                <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                  <span class="block text-gray-900 mb-2">Your next</span>
                  <span class="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                    move starts here
                  </span>
                </h1>
                <p class="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
                  Discover trusted <span class="font-semibold text-gray-900">student housing</span>, instant <span class="font-semibold text-gray-900">rides</span>, and connect with your community — all in one place.
                </p>
              </div>

              <!-- CTA Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  (click)="navigateToBrowse()" 
                  class="group relative inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold text-white overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 ripple" 
                  data-testid="hero-search-button">
                  <span class="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-transform group-hover:scale-110"></span>
                  <span class="relative flex items-center gap-3">
                    <svg class="w-5 h-5 animate-bounce-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explore Rooms
                    <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                
                <button 
                  (click)="scrollToRides()" 
                  class="group inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold text-gray-900 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300 backdrop-blur-sm transition-all hover:scale-105 active:scale-95" 
                  data-testid="hero-ride-button">
                  <svg class="w-5 h-5 mr-3 text-gray-900 group-hover:animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Find a Ride
                </button>
              </div>

              <!-- Trust Metrics -->
              <div class="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
                <div class="space-y-2 group cursor-default hover:scale-105 transition-transform">
                  <div class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    10k+
                  </div>
                  <div class="text-xs md:text-sm text-gray-600 font-medium">Active Students</div>
                </div>
                <div class="space-y-2 group cursor-default hover:scale-105 transition-transform">
                  <div class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    500+
                  </div>
                  <div class="text-xs md:text-sm text-gray-600 font-medium">Universities</div>
                </div>
                <div class="space-y-2 group cursor-default hover:scale-105 transition-transform">
                  <div class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    95%
                  </div>
                  <div class="text-xs md:text-sm text-gray-600 font-medium">Satisfaction</div>
                </div>
              </div>
            </div>

            <!-- 🎨 RIGHT: Interactive Search Card -->
            <div class="flex-1 w-full max-w-xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-200">
              <div class="relative group">
                <!-- Glow effect -->
                <div class="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
                
                <!-- Main card -->
                <div class="relative rounded-3xl border-2 border-white/60 bg-white/90 backdrop-blur-2xl shadow-2xl overflow-hidden transform transition-all duration-300 group-hover:scale-[1.02]">
                  <!-- Gradient header -->
                  <div class="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                  
                  <app-search-hero
                    [initialQuery]="searchParams().query || ''"
                    [initialCity]="searchParams().city || ''"
                    [initialRoomType]="searchParams().roomType || ''"
                    [initialCheckIn]="searchParams().checkIn || null"
                    [initialCheckOut]="searchParams().checkOut || null"
                    [initialStudentVerifiedOnly]="searchParams().studentVerifiedOnly || false"
                    (searchChange)="onSearchChange($event)"
                    data-testid="search-hero"
                  ></app-search-hero>
                </div>
              </div>
              
              <!-- Trust badges -->
              <div class="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="font-medium">Verified Profiles</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <span class="font-medium">Instant Messaging</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 🎯 QUICK ACTION CATEGORIES -->
      <section class="container mx-auto px-4 py-20" data-testid="quick-categories">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-12 space-y-4">
            <h2 class="text-3xl md:text-4xl font-bold">
              <span class="text-gray-900">Everything you need,</span>
              <span class="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">all in one place</span>
            </h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              From finding your perfect room to getting a ride — SETLY has you covered
            </p>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Rooms -->
            <div (click)="navigateToBrowse()" class="group relative p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 hover:border-blue-300 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <div class="absolute top-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <div class="space-y-3 mt-20">
                <h3 class="text-xl font-bold text-gray-900">Browse Rooms</h3>
                <p class="text-sm text-gray-600 leading-relaxed">Find verified student housing near your university</p>
                <div class="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all">
                  Explore <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </div>
              </div>
            </div>

            <!-- Rides -->
            <div (click)="scrollToRides()" class="group relative p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 hover:border-purple-300 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <div class="absolute top-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <rect x="5" y="10" width="14" height="6" rx="2"/>
                  <path d="M7 10l2-3h6l2 3" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="8" cy="17" r="2"/>
                  <circle cx="16" cy="17" r="2"/>
                </svg>
              </div>
              <div class="space-y-3 mt-20">
                <h3 class="text-xl font-bold text-gray-900">Book Rides</h3>
                <p class="text-sm text-gray-600 leading-relaxed">Carpool with trusted students or get an Uber</p>
                <div class="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 group-hover:gap-3 transition-all">
                  Get a ride <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </div>
              </div>
            </div>

            <!-- People -->
            <div (click)="navigateToPeople()" class="group relative p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100 hover:border-amber-300 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <div class="absolute top-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div class="space-y-3 mt-20">
                <h3 class="text-xl font-bold text-gray-900">Meet People</h3>
                <p class="text-sm text-gray-600 leading-relaxed">Connect with students at your university</p>
                <div class="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 group-hover:gap-3 transition-all">
                  Discover <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </div>
              </div>
            </div>

            <!-- Marketplace -->
            <div (click)="navigateToMarketplace()" class="group relative p-8 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 hover:border-green-300 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <div class="absolute top-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
              </div>
              <div class="space-y-3 mt-20">
                <h3 class="text-xl font-bold text-gray-900">Marketplace</h3>
                <p class="text-sm text-gray-600 leading-relaxed">Buy and sell textbooks, furniture, & more</p>
                <div class="inline-flex items-center gap-2 text-sm font-semibold text-green-600 group-hover:gap-3 transition-all">
                  Shop now <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 🏠 FEATURED ROOMS -->
      <section class="container mx-auto px-4 py-20 bg-gradient-to-b from-white to-gray-50" data-testid="featured-rooms">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-end justify-between mb-12">
            <div class="space-y-3">
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Featured Rooms</h2>
              <p class="text-lg text-gray-600">Handpicked homes from verified student hosts</p>
            </div>
            <button (click)="navigateToBrowse()" class="hidden md:inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl bg-gray-900 text-white hover:bg-black hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl transition-all">
              View all
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </button>
          </div>

          <!-- Loading state -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" *ngIf="loadingFeatured()">
            <div *ngFor="let item of skeletonArray" class="group">
              <div class="rounded-3xl border-2 border-gray-100 bg-white shadow-lg overflow-hidden">
                <div class="loading-shimmer w-full h-56 md:h-64"></div>
                <div class="p-6 space-y-4">
                  <div class="loading-shimmer h-6 w-3/4 rounded-lg"></div>
                  <div class="loading-shimmer h-4 w-full rounded"></div>
                  <div class="loading-shimmer h-4 w-5/6 rounded"></div>
                  <div class="flex justify-between items-center pt-2">
                    <div class="loading-shimmer h-10 w-10 rounded-full"></div>
                    <div class="loading-shimmer h-9 w-24 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loaded rooms -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" *ngIf="!loadingFeatured()">
            <div
              *ngFor="let room of featuredRooms(); trackBy: trackById"
              (click)="onRoomClick(room)"
              class="group cursor-pointer animate-fade-in-up"
              [attr.data-testid]="'room-card-' + room.id"
            >
              <div class="relative rounded-3xl border-2 border-gray-100 bg-white shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <!-- Image -->
                <div class="relative overflow-hidden h-56 md:h-64">
                  <img
                    [src]="room.photos[0] || '/assets/placeholder-room.jpg'"
                    [alt]="room.title"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    width="400"
                    height="256"
                  >
                  <!-- Verified badge -->
                  <div class="absolute top-4 left-4">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm text-gray-900 shadow-lg">
                      <svg class="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      Verified
                    </span>
                  </div>
                  <!-- Price tag -->
                  <div class="absolute top-4 right-4">
                    <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gray-900/90 backdrop-blur-sm text-white shadow-xl">
                      $\{{room.price}}<span class="text-xs font-medium opacity-90">/mo</span>
                    </span>
                  </div>
                </div>

                <!-- Content -->
                <div class="p-6 space-y-4">
                  <div>
                    <h3 class="font-bold text-lg md:text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {{ room.title }}
                    </h3>
                    <p class="text-sm text-gray-600 line-clamp-2 leading-relaxed">{{ room.title }}</p>
                  </div>

                  <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <span class="text-white text-sm font-bold">{{ room.hostId.charAt(0).toUpperCase() }}</span>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500">Hosted by</div>
                        <div class="text-sm font-semibold text-gray-900">{{ room.hostId }}</div>
                      </div>
                    </div>

                    <button 
                      (click)="onConnectClick(room, $event)" 
                      class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-xl transition-all hover:scale-105 active:scale-95" 
                      [attr.data-testid]="'connect-button-' + room.id">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                      </svg>
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile CTA -->
          <div class="mt-12 text-center md:hidden">
            <button (click)="navigateToBrowse()" class="inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-2xl bg-gray-900 text-white hover:bg-black shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
              View all rooms
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </button>
          </div>
        </div>
      </section>

      <!-- 🚗 SETLY RIDE & UBER CARDS -->
      <section class="container mx-auto px-4 py-20" data-testid="ride-services">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-12 space-y-4">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Get where you need to go</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted student carpools or instant Uber rides — your choice
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <!-- SetlyRide Card -->
            <div class="group relative p-10 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 text-white overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50">
              <!-- Decorative circles -->
              <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl"></div>
              
              <div class="relative z-10 text-center space-y-6">
                <div class="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:rotate-6 transition-transform">
                  <svg class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="5" y="10" width="14" height="6" rx="2"/>
                    <path d="M7 10l2-3h6l2 3" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="8" cy="17" r="2"/>
                    <circle cx="16" cy="17" r="2"/>
                  </svg>
                </div>
                <div class="space-y-3">
                  <h3 class="text-2xl font-bold">SetlyRide</h3>
                  <p class="text-white/90 text-base">Carpool with verified students from your university</p>
                </div>
                <div class="flex items-center justify-center gap-4 text-sm">
                  <div class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    <span class="text-white/90">Verified</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
                    <span class="text-white/90">Save 70%</span>
                  </div>
                </div>
                <button
                  (click)="openRideModal()"
                  class="w-full bg-white text-indigo-600 font-bold rounded-2xl px-8 py-4 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-xl"
                  data-testid="setlyride-button"
                >
                  Request SetlyRide
                </button>
              </div>
            </div>

            <!-- Uber Card -->
            <div class="group relative p-10 rounded-3xl bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-gray-900/50">
              <!-- Decorative pattern -->
              <div class="absolute inset-0 opacity-5">
                <div class="absolute top-0 left-0 w-full h-full" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 20px 20px;"></div>
              </div>
              
              <div class="relative z-10 text-center space-y-6">
                <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg group-hover:rotate-6 transition-transform">
                  <span class="text-black text-3xl font-black">U</span>
                </div>
                <div class="space-y-3">
                  <h3 class="text-2xl font-bold">Uber</h3>
                  <p class="text-white/80 text-base">Quick ride anytime, anywhere you need to go</p>
                </div>
                <div class="flex items-center justify-center gap-4 text-sm">
                  <div class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    <span class="text-white/80">Fast</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                    <span class="text-white/80">24/7</span>
                  </div>
                </div>
                <button
                  (click)="openUber()"
                  class="w-full bg-white text-black font-bold rounded-2xl px-8 py-4 hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-xl"
                  data-testid="uber-button"
                >
                  Open Uber
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Ride Request Modal -->
      <app-ride-request-modal
        [isOpen]="rideModalOpen"
        (rideSubmitted)="onRideSubmitted($event)"
        (closed)="rideModalOpen.set(false)"
        data-testid="ride-modal">
      </app-ride-request-modal>
    </div>
  `,
  styles: [`
    details summary::marker {
      display: none;
    }
    details summary {
      list-style: none;
    }
    details summary::-webkit-details-marker {
      display: none;
    }
  `]
})
export class HomePage implements OnInit {
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);
  private universityService = inject(UniversityService);
  private roomStore = inject(RoomStoreService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private analytics = inject(AnalyticsService);
  private ridesService = inject(RidesService);

  // Signals
  loadingFeatured = signal(true);
  searchParams = signal<SearchParams>({
    query: '',
    city: '',
    roomType: undefined,
    checkIn: undefined,
    checkOut: undefined,
    studentVerifiedOnly: false
  });
  rideModalOpen = signal(false);

  // Computed
  featuredRooms = computed(() => {
    return this.roomStore.featuredRooms() ?? [];
  });

  searchActive = computed(() => {
    const params = this.searchParams();
    return !!(params.query || params.city || params.roomType || 
             params.checkIn || params.checkOut || params.studentVerifiedOnly);
  });

  skeletonArray = Array(6).fill(0);

  ngOnInit(): void {
    // Set page title and meta
    this.title.setTitle('Setly - Find Your next Room');
    this.meta.updateTag({ name: 'description', content: 'Find rooms near your university with filters that match your life.' });

    // Load featured rooms
    setTimeout(() => {
      this.loadingFeatured.set(false);
    }, 1000);

    // Subscribe to route query params
    this.route.queryParams.subscribe(params => {
      this.searchParams.set({
        query: params['q'] || '',
        city: params['city'] || '',
        roomType: params['roomType'] as 'shared' | 'Private' || undefined,
        checkIn: params['checkIn'] || undefined,
        checkOut: params['checkOut'] || undefined,
        studentVerifiedOnly: params['studentVerified'] === 'true'
      });
    });

    // Analytics
    this.analytics.trackPageView('homepage');
  }

  onSearchChange(params: SearchParams): void {
    this.searchParams.set(params);
  }

  openRideModal(): void {
    this.rideModalOpen.set(true);
    this.analytics.trackEvent('open_ride_modal', { source: 'homepage' });
  }

  openUber(): void {
    // Fallback destination - the app can supply more context in the future
    const destination = this.searchParams().city || 'campus';
    const link = this.ridesService.getUberDeepLink(destination);
    window.open(link, '_blank');
    this.analytics.trackRideRequest('uber', { destination });
  }

  onRideSubmitted(payload: any): void {
    // Quick analytics and UX hook
    this.analytics.trackRideRequest('setly', { pickup: payload.pickup, drop: payload.drop });
    // Close modal
    this.rideModalOpen.set(false);
  }

  navigateToBrowse(): void {
    const params = this.searchParams();
    const queryParams: Params = {};

    if (params.query) queryParams['q'] = params.query;
    if (params.city) queryParams['city'] = params.city;
    if (params.roomType) queryParams['roomType'] = params.roomType;
    if (params.checkIn) queryParams['checkIn'] = params.checkIn;
    if (params.checkOut) queryParams['checkOut'] = params.checkOut;
    if (params.studentVerifiedOnly) queryParams['studentVerified'] = true;

    // Analytics
    this.analytics.trackSearch(params.query || '', params);

    this.router.navigate(['/browse'], { queryParams });
  }

  onRoomClick(room: Room): void {
    this.analytics.trackRoomClick(room.id);
    this.router.navigate(['/browse'], { queryParams: { highlight: room.id } });
  }

  onConnectClick(room: Room, event: Event): void {
    event.stopPropagation();
    this.analytics.trackEvent('connect_clicked', { room_id: room.id });

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/messages' } });
      return;
    }

    // Create or get thread for this room
    const thread = this.messageService.getThreadByRoomAndUser(room.id, currentUser.id);
    if (thread) {
      this.router.navigate(['/messages'], { queryParams: { threadId: thread.id } });
    } else {
      const newThread = this.messageService.createThread(room.id, [currentUser.id, room.hostId]);
      this.router.navigate(['/messages'], { queryParams: { threadId: newThread.id } });
    }
  }

  scrollToRides(): void {
    const element = document.querySelector('[data-testid="ride-services"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  navigateToPeople(): void {
    this.router.navigate(['/people']);
    this.analytics.trackEvent('navigate_to_people', { source: 'homepage_categories' });
  }

  navigateToMarketplace(): void {
    this.router.navigate(['/marketplace']);
    this.analytics.trackEvent('navigate_to_marketplace', { source: 'homepage_categories' });
  }

  trackById(index: number, item: any): string {
    return item.id;
  }
}
