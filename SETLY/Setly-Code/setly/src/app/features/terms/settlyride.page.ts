import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settlyride-terms-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-6">SetlyRide Terms</h1>

          <div class="prose prose-gray max-w-none">
            <h2>What is SettlyRide?</h2>
            <p>
              SettlyRide helps you coordinate rides with peers you know (classmates, colleagues, community). It's not a transportation company and doesn't process payments. Any ride is strictly between participants. Follow local laws and campus rules, use good judgment, and share your trip with someone you trust. In emergencies, call 911.
            </p>

            <h2>Important Disclaimers</h2>
            <ul>
              <li><strong>Not for hire:</strong> Setly does not arrange rides or accept payment. This is a peer coordination tool only.</li>
              <li><strong>No liability:</strong> Setly is not responsible for any rides coordinated through this feature.</li>
              <li><strong>Safety first:</strong> Always verify the identity of your ride partner and share your trip details with someone you trust.</li>
              <li><strong>Legal compliance:</strong> Ensure all activities comply with local laws and regulations.</li>
            </ul>

            <h2>How it Works</h2>
            <p>
              SettlyRide allows you to post ride requests to your contacts, university community, or specific peers. Other users can respond to coordinate rides directly with you. All communication and arrangements happen between participants.
            </p>

            <h2>Privacy</h2>
            <p>
              Ride requests are shared according to your selected audience. Contact information is only shared when you explicitly provide it and choose to share it.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettlyrideTermsPage {}
