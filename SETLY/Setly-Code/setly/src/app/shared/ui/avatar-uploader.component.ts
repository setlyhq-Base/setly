import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-avatar-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <div class="flex items-center gap-3">
  <input type="file" accept="image/*,.heic,.heif" (change)="onFile($event)" />
        <button class="btn" [disabled]="!imageLoaded()" (click)="upload()">Save Avatar</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" *ngIf="imageLoaded()">
        <div class="space-y-2">
          <div class="text-sm text-gray-600">Adjust</div>
          <div class="w-64 h-64 border rounded-xl overflow-hidden bg-gray-100 relative select-none"
               (pointerdown)="startPan($event)" (pointermove)="onPan($event)" (pointerup)="endPan()" (pointerleave)="endPan()">
            <canvas #canvas width="256" height="256" style="width:256px;height:256px"></canvas>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-600">Zoom</label>
            <input type="range" min="1" max="3" step="0.01" [value]="scale()" (input)="setScale($any($event.target).value)" />
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-sm text-gray-600">Preview</div>
          <img [src]="previewUrl()" alt="preview" class="w-24 h-24 rounded-full object-cover border" />
        </div>
      </div>

      <p *ngIf="error()" class="text-sm text-red-600">{{ error() }}</p>
      <p *ngIf="success()" class="text-sm text-green-600">Avatar updated!</p>
    </div>
  `
})
export class AvatarUploaderComponent {
  @Output() updated = new EventEmitter<string>();

  private file?: File;
  private img = new Image();
  private ctx?: CanvasRenderingContext2D;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  scale = signal(1);
  offsetX = signal(0);
  offsetY = signal(0);
  imageLoaded = signal(false);
  previewUrl = signal('');
  error = signal('');
  success = signal(false);

  constructor(private http: HttpClient) {}

  async onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const original = input.files[0];
    // Convert HEIC/HEIF before preview if needed
    const { ensureDisplayableImage } = await import('../../core/utils/heic');
    this.file = await ensureDisplayableImage(original);
    const reader = new FileReader();
    reader.onload = () => {
      this.img.onload = () => {
        this.imageLoaded.set(true);
        this.setupCanvas();
        this.render();
      };
      this.img.src = String(reader.result);
    };
    reader.readAsDataURL(this.file);
  }

  setScale(val: number) {
    const v = Number(val);
    this.scale.set(v);
    this.render();
  }

  startPan(ev: PointerEvent) {
    this.dragging = true;
    this.lastX = ev.clientX;
    this.lastY = ev.clientY;
  }
  onPan(ev: PointerEvent) {
    if (!this.dragging) return;
    const dx = ev.clientX - this.lastX;
    const dy = ev.clientY - this.lastY;
    this.lastX = ev.clientX;
    this.lastY = ev.clientY;
    this.offsetX.set(this.offsetX() + dx);
    this.offsetY.set(this.offsetY() + dy);
    this.render();
  }
  endPan() {
    this.dragging = false;
  }

  private setupCanvas() {
    const canvas = (document.querySelector('canvas') as HTMLCanvasElement);
    this.ctx = canvas.getContext('2d')!;
  }

  private render() {
    if (!this.ctx || !this.img) return;
    const size = 256;
    const ctx = this.ctx;
    ctx.clearRect(0,0,size,size);
    // Fill background
    ctx.fillStyle = '#eee';
    ctx.fillRect(0,0,size,size);

    const s = this.scale();
    const iw = this.img.width * s;
    const ih = this.img.height * s;
    const x = (size - iw) / 2 + this.offsetX();
    const y = (size - ih) / 2 + this.offsetY();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0,0,size,size);
    ctx.clip();
    ctx.drawImage(this.img, x, y, iw, ih);
    ctx.restore();

    this.previewUrl.set((document.querySelector('canvas') as HTMLCanvasElement).toDataURL('image/png'));
  }

  async upload() {
    try {
      this.error.set(''); this.success.set(false);
      if (!this.file) throw new Error('No file selected');
      // Export PNG from canvas
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));

      // Presign avatar
      const ext = 'png';
      const presign: any = await this.http.post('/api/uploads/presign', { type: 'avatar', ext }).toPromise();

      // Build form data per S3 POST policy
      const fd = new FormData();
      Object.entries(presign.fields).forEach(([k,v]: any) => fd.append(k, v));
      fd.append('Content-Type', presign.contentType);
      fd.append('file', blob);

      const uploadRes = await fetch(presign.url, { method: 'POST', body: fd });
      if (!uploadRes.ok) throw new Error('Upload failed');

      // Update user profile photoUrl
      const publicUrl = presign.publicUrl;
      await this.http.put('/api/users/me', { photoUrl: publicUrl }).toPromise();

      this.success.set(true);
      this.updated.emit(publicUrl);
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Avatar updated' } }));
    } catch (e: any) {
      console.error('Avatar upload error', e);
      this.error.set(e?.message || 'Upload failed');
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Avatar upload failed' } }));
    }
  }
}
