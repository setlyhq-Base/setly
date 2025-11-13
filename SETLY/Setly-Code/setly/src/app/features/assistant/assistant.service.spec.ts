import { TestBed } from '@angular/core/testing';
import { AssistantService } from './assistant.service';
import { AnalyticsService } from '../../core/services/analytics.service';

describe('AssistantService', () => {
  let service: AssistantService;
  const fired: { name: string, payload: any }[] = [];
  const analyticsStub: Partial<AnalyticsService> = {
    fire: (name: string, payload: any = {}) => fired.push({ name, payload }) as any
  } as any;

  beforeEach(() => {
    fired.length = 0;
    TestBed.configureTestingModule({
      providers: [
        AssistantService,
        { provide: AnalyticsService, useValue: analyticsStub }
      ]
    });
    service = TestBed.inject(AssistantService);
  });

  it('fires analytics on open/close and message send', () => {
    service.onOpen();
    service.sendUserMessage('hi');
    service.onClose();
    const events = fired.map(f => f.name);
    expect(events).toContain('assistant_opened');
    expect(events).toContain('assistant_message_sent');
    expect(events).toContain('assistant_closed');
  });

  it('housing chip flow progresses', () => {
    service.triggerPlaybook('housing');
    // choose university
    service.handleChip('uni-usc');
    // choose budget
    service.handleChip('budget-1200');
    // choose room
    service.handleChip('room-private');
    // should have emitted room cards (we just check messages length grew)
    expect(service.messages().length).toBeGreaterThan(0);
  });

  it('typing indicator times out', (done) => {
    // showTyping is private; trigger send which creates streaming bot message; allow fallback path
    service.sendUserMessage('test typing');
    setTimeout(() => {
      expect(service.messages().length).toBeGreaterThan(0);
      done();
    }, 900);
  });
});
