import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../../core/models/profile.model';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="about-card will-fade-up" inView>
      <div class="header">
        <h2 class="title gradient-text">About Me</h2>
        <button class="edit" (click)="edit.emit()">✏️ <span class="hide-sm">Edit</span></button>
      </div>
      <div class="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <p class="bio" *ngIf="profile?.about; else emptyAbout">{{ profile?.about }}</p>
          <ng-template #emptyAbout>
            <p class="empty">Write a short bio to introduce yourself to the Setly community.</p>
            <div class="prompts">
              <div class="prompts-title">Try one of these prompts</div>
              <div class="prompt-list">
                <button class="prompt" (click)="edit.emit()">I’m a CS student who loves weekend coffee crawls ☕ and hiking 🥾.</button>
                <button class="prompt" (click)="edit.emit()">New to the city — into photography 📸, clean spaces, and morning runs.</button>
                <button class="prompt" (click)="edit.emit()">Night-owl developer 💻, respectful roommate, and big on quiet study vibes.</button>
              </div>
            </div>
          </ng-template>
          <div class="count" *ngIf="profile?.about">{{ profile?.about?.length || 0 }}/280</div>
          <div class="assistant-hint" *ngIf="!profile?.about">✨ Need inspiration? The Setly Assistant can suggest a friendly intro.</div>
        </div>
        <div class="meta-grid">
          <div class="field">
            <div class="label">Profession / Field of Study</div>
            <div class="value">{{ profile?.profession || 'Not set' }}</div>
          </div>
          <div class="field">
            <div class="label">Languages</div>
            <div class="value">{{ (profile?.languages || []).join(', ') || 'Not set' }}</div>
          </div>
          <div class="field">
            <div class="label">Interests</div>
            <div class="chips">
              <span *ngFor="let i of profile?.interests || []" class="chip">{{ i }}</span>
              <span *ngIf="!(profile?.interests?.length)" class="empty">Add interests</span>
            </div>
          </div>
          <div class="field">
            <div class="label">Social Links</div>
            <div class="socials">
              <a *ngIf="profile?.socials?.linkedin" [href]="profile?.socials?.linkedin" target="_blank" rel="noopener" class="social">LinkedIn</a>
              <a *ngIf="profile?.socials?.instagram" [href]="profile?.socials?.instagram" target="_blank" rel="noopener" class="social">Instagram</a>
              <a *ngIf="profile?.socials?.website" [href]="profile?.socials?.website" target="_blank" rel="noopener" class="social">Website</a>
              <a *ngIf="profile?.socials?.whatsapp" [href]="'https://wa.me/' + profile?.socials?.whatsapp" target="_blank" rel="noopener" class="social">WhatsApp</a>
              <span *ngIf="!profile?.socials" class="empty">No socials linked</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display:block; }
    .about-card { background:#fff; border:1px solid #e5e7eb; border-radius:1.25rem; padding:2rem; box-shadow:var(--shadow-soft); position:relative; overflow:hidden; }
    .about-card::after { content:''; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 85% 15%,rgba(157,132,255,0.15),transparent 60%); }
    .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; }
    .title { font-size:1.1rem; font-weight:600; letter-spacing:-0.01em; }
    .edit { font-size:0.75rem; font-weight:500; background:#f3f4f6; padding:0.5rem .85rem; border-radius:999px; display:inline-flex; align-items:center; gap:.35rem; color:#374151; transition:background .25s, transform .25s; }
    .edit:hover { background:#e5e7eb; transform:translateY(-1px); }
    .grid { }
    .bio { color:#374151; line-height:1.6; font-size:0.95rem; }
    .empty { color:#6b7280; font-size:0.9rem; }
    .count { font-size:0.65rem; letter-spacing:.05em; text-transform:uppercase; color:#9ca3af; margin-top:.75rem; font-weight:500; }
    .assistant-hint { margin-top:0.75rem; font-size:0.7rem; letter-spacing:.05em; text-transform:uppercase; color:#6366f1; background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .prompts { margin-top:0.75rem; }
  .prompts-title { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:#6b7280; margin-bottom:.35rem; }
  .prompt-list { display:flex; flex-direction:column; gap:.4rem; }
  .prompt { text-align:left; background:#f9fafb; border:1px dashed #e5e7eb; padding:.6rem .75rem; border-radius:.75rem; font-size:.8rem; color:#374151; transition:background .25s, border-color .25s, transform .25s; }
  .prompt:hover { background:#ffffff; border-color:#c7d2fe; transform:translateY(-1px); }
    .meta-grid { display:grid; gap:1.25rem; }
    .field { display:flex; flex-direction:column; gap:.25rem; }
    .label { font-size:0.65rem; text-transform:uppercase; letter-spacing:.08em; font-weight:600; color:#6b7280; }
    .value { font-size:0.85rem; color:#111827; font-weight:500; }
    .chips { display:flex; flex-wrap:wrap; gap:.5rem; }
    .chip { background:#f3f4f6; color:#374151; padding:.4rem .9rem; font-size:0.7rem; border-radius:999px; font-weight:500; letter-spacing:.02em; transition:background .25s; }
    .chip:hover { background:#e5e7eb; }
    .socials { display:flex; flex-wrap:wrap; gap:.75rem; }
    .social { position:relative; font-size:0.75rem; font-weight:500; color:#4f46e5; padding:.35rem .75rem; border-radius:.65rem; background:#f5f3ff; transition:background .25s, color .25s; }
    .social:hover { background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); color:#fff; }
    @media (max-width:640px){ .about-card { padding:1.25rem 1.25rem 1.5rem; } .grid { gap:2rem; } }
  `]
})
export class AboutMeComponent {
  @Input() profile?: UserProfile;
  @Output() edit = new EventEmitter<void>();
}
