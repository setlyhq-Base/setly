# Setly Assistant V2

Premium, modular chat widget delivering guided playbooks for housing, rides, and settling in.

## Architecture Overview
- `assistant-widget.component.*`: Launcher FAB + modal shell, header, message list, input.
- `assistant.service.ts`: Reactive state (signals). Manages messages, playbooks, stepper flows, analytics hooks.
- `assistant-playbooks.ts`: Static playbook config array.
- `action-chips.component.ts`: Grid of interactive chips.
- `room-preview-card.component.ts`: Room card actions (view/save/message) fire analytics events.
- `ride-cta.component.ts`: Ride actions (SetlyRide request / Uber deep link).
- `typing-indicator.component.ts`: Animated 3-dot indicator with reduced-motion respect.

## Analytics Events
| Event | Payload |
|-------|---------|
| assistant_opened | - |
| assistant_closed | - |
| assistant_playbook_started | { key } |
| assistant_message_sent | - |
| assistant_message_received | { type } |
| assistant_card_interaction | { type, id? } |

## Feature Flags (environment.assistant)
- `enabled`: render widget.
- `playbooks`: list of active playbook keys.
- `maxHistory`: cap message history (perf + privacy).

## Playbook Flow (Housing MVP)
1. University selection (chips).
2. Budget (chips).
3. Room type (chips).
4. Emit demo room cards.
5. Option to restart.

## Accessibility
- Launcher and modal are keyboard navigable; ESC closes.
- `role="dialog"` on modal; messages area `aria-live="polite"`.
- Contrast meets ≥4.5:1 for text.

## Extending
- Replace `generateBotReply` with backend streaming.
- Add persistence by saving `_messages()` to localStorage on change; restore if not empty.
- Implement feedback (👍/👎) by emitting `assistant_card_interaction` with `type='feedback_up' | 'feedback_down'`.

## Testing Suggestions
- Unit: service chip flow transitions; typing indicator removal after timeout; analytics fire counts (spy console).
- E2E: open widget → start housing playbook → choose university/budget/type → verify 2+ room cards render.

## Future Enhancements
- Virtual scroll with `cdk-virtual-scroll-viewport` for long histories.
- i18n using `$localize` wrappers around strings.
- Dark mode theming using Tailwind `dark:` variants.

---
This MVP focuses on structure, modularity, and event instrumentation. Replace mock logic with real backend calls progressively.
