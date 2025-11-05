import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from './chat-widget.component';
import { ChatPanelComponent } from './chat-panel.component';
import { MessageListComponent } from './message-list.component';
import { MessageInputComponent } from './message-input.component';
import { SourceChipsComponent } from './source-chips.component';

@NgModule({
  imports: [
    CommonModule,
    ChatWidgetComponent,
    ChatPanelComponent,
    MessageListComponent,
    MessageInputComponent,
    SourceChipsComponent
  ],
  exports: [
    ChatWidgetComponent
  ]
})
export class AssistantModule { }
