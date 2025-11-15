import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-post-room-popover',
	standalone: true,
	imports: [CommonModule],
	template: `
		<!-- Placeholder popover to satisfy imports; real FAB popover is defined in fab.component.ts -->
		<div class="sr-only">Post room popover</div>
	`
})
export class PostRoomPopoverComponent {}

