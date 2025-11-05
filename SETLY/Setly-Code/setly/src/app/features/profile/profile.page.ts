import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule],
  template: `
    <main class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-3xl font-bold mb-8">Profile</h1>

        <!-- Profile management -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Your Profile</h2>

          <form class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">First name</label>
              <input
                type="text"
                [(ngModel)]="profile.firstName"
                name="firstName"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="First name"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Last name</label>
              <input
                type="text"
                [(ngModel)]="profile.lastName"
                name="lastName"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Last name"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                [(ngModel)]="profile.email"
                name="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                [(ngModel)]="profile.phone"
                name="phone"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">University</label>
              <select
                [(ngModel)]="profile.university"
                name="university"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a university</option>
                <option value="harvard">Harvard University</option>
                <option value="stanford">Stanford University</option>
                <option value="mit">MIT</option>
                <option value="berkeley">UC Berkeley</option>
              </select>
            </div>

            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save
            </button>
          </form>
        </div>

        <!-- User Listings -->
        <div class="bg-white rounded-lg shadow-sm p-8 mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">My Listings</h2>
          <div class="text-center py-16">
            <p class="text-gray-600">No listings yet. <a routerLink="/post-room" class="text-blue-600 hover:text-blue-800">Post your first room</a></p>
          </div>
        </div>

        <!-- Logout -->
        <div class="mt-8">
          <button class="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
            Logout
          </button>
        </div>
      </div>
    </main>
  `
})
export class ProfilePage {
  profile = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: ''
  };
}
