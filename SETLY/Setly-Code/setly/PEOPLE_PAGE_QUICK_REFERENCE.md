# People Page - Quick Reference Guide

## 🚀 Quick Start

The People Page is accessible at `/people` route.

---

## 📋 Page Sections

### 1. Discovery Carousels (Top Section)
```
✨ Recommended For You    → Smart recommendations
🎓 From Your University   → Same institution students
🏙️ New in Your City      → Recently joined nearby
```

### 2. Three-Column Layout

#### LEFT: Filters
- Search users
- Filter by role (Student, Professional, Alumni)
- University/Company tags
- Location (City, State, Country)
- Verifications (Email, Phone, .edu)
- Interests tags
- Online only toggle
- Sort options

#### MIDDLE: People Cards
Each card shows:
- Profile picture with online status
- Name + Organization + Location
- Role badges (Host, Driver, Trader, Guide, Senior, Student)
- Mutual interests
- Trust score (0-100%)
- Verification badges
- Action buttons (Connect, Message, Save)
- Micro-interactions (Wave, Appreciate, Ask)

#### RIGHT: Interactive Map
- Search on map
- Settings button
- Pin count
- Map placeholder (ready for integration)
- Legend

---

## 🎯 User Actions

### Primary Actions
```typescript
connect(user)      → Send connection request
message(user)      → Open chat/messaging
toggleSave(user)   → Bookmark user
```

### Micro-interactions
```typescript
wave(user)         → Send friendly wave notification
appreciate(user)   → Show appreciation
askQuestion(user)  → Pre-filled message prompt
```

---

## 🎨 Role Badges

| Role | Icon | Color | Description |
|------|------|-------|-------------|
| Host | 🏠 | Blue | Has/offers rooms |
| Driver | 🚗 | Green | Offers rides |
| Trader | 📦 | Purple | Marketplace seller |
| Guide | 🗺️ | Yellow | Campus/city guide |
| Senior | 🎓 | Gray | Senior student/mentor |
| Student | 📚 | Indigo | Current student |

---

## 📊 Trust Score Breakdown

| Verification | Points | Total |
|-------------|--------|-------|
| Email ✉️ | +25% | 25% |
| Phone 📱 | +25% | 50% |
| University 🎓 | +30% | 80% |
| Photo 📸 | +20% | 100% |

---

## 🔍 Filter Options

### Role Filters
- [ ] Student
- [ ] Working Professional
- [ ] Alumni

### Verification Filters
- [ ] ✉️ Verified Email
- [ ] 📱 Verified Phone
- [ ] 🎓 University Email (.edu)

### Sort Options
- Recently Joined (default)
- Most Active
- Nearby
- Recommended
- Same University
- Shared Interests

---

## 🗺️ Map Features (Placeholder)

Current state:
- Search bar for locations
- Settings button for preferences
- Pin counter display
- Legend (Online, Active, Offline)
- Re-center button

**Future:**
- Real map integration (Google Maps/Mapbox)
- Custom pins with user avatars
- Pin clusters
- Interactive pin click → profile preview

---

## 🎭 Online Status Indicators

| Status | Indicator | Condition |
|--------|-----------|-----------|
| Online | 🟢 Green glow | Active < 5 min ago |
| Active | 🔵 Blue | Active < 1 hour ago |
| Offline | ⚪ Gray | Active > 1 hour ago |

---

## ⌨️ Keyboard Shortcuts (Future)

```
Enter      → Quick connect to focused card
S          → Toggle save/bookmark
M          → Open message
/          → Focus search filter
Esc        → Clear filters
```

---

## 📱 Mobile Experience

### Current (Desktop-first)
- 3-column layout on large screens
- 2-column on tablets (filters collapse)
- 1-column on mobile (filters in drawer)

### Future Enhancements
- Bottom sheet filters
- Full-screen map swipe
- Touch gestures
- Pull to refresh

---

## 🔧 Developer Quick Actions

### Add New Role
```typescript
// people.page.ts
getUserRoles(user: DirectoryUser): string[] {
  const roles: string[] = [];
  if (user.hasRoom) roles.push('Host');
  if (user.offersRides) roles.push('Driver');
  // Add your role logic
  return roles;
}
```

### Customize Trust Score
```typescript
getTrustScore(user: DirectoryUser): number {
  let score = 0;
  if (user.badges?.email) score += 25;
  if (user.badges?.phone) score += 25;
  if (user.badges?.university) score += 30;
  if (user.badges?.photo) score += 20;
  // Add custom scoring
  return score;
}
```

### Add Filter Option
```typescript
// 1. Update interface
export interface PeopleFilters {
  // ... existing
  myNewFilter: boolean;
}

// 2. Add to template
<label>
  <input type="checkbox" [(ngModel)]="state.myNewFilter" (change)="emit()"/>
  My Filter
</label>

// 3. Apply in filtered() computed
if (f.myNewFilter) {
  out = out.filter(u => /* your logic */);
}
```

---

## 🐛 Troubleshooting

### Filters not working?
- Check `filtered()` computed signal logic
- Verify filter state updates
- Console log filter values

### Cards not showing?
- Check `PeopleDirectoryService.list()` response
- Verify API endpoint `/api/users`
- Check authentication state

### Styles not applying?
- Verify Tailwind classes in `tailwind.config.js`
- Check global styles in `styles.css`
- Ensure component is imported

### Online status not updating?
- Check `PresenceService.fetchOnline()` interval
- Verify WebSocket/polling implementation
- Check backend presence endpoint

---

## 📦 Dependencies

```json
{
  "angular": "^17.x",
  "tailwindcss": "^3.x",
  "@angular/common": "^17.x",
  "@angular/forms": "^17.x",
  "@angular/router": "^17.x"
}
```

---

## 🎯 Performance Tips

1. **Virtual Scrolling** (for 1000+ users)
```typescript
// Future: Add CDK Virtual Scroll
import { ScrollingModule } from '@angular/cdk/scrolling';
```

2. **Lazy Loading Images**
```html
<img loading="lazy" [src]="user.avatarUrl" />
```

3. **Debounce Search**
```typescript
searchInput$.pipe(debounceTime(300))
```

4. **Pagination**
```typescript
// Already implemented via nextCursor
loadMore() { /* ... */ }
```

---

## 🔒 Security Notes

- Never expose user email/phone in cards
- Validate all user inputs (search, filters)
- Sanitize user-generated content
- Check permissions before actions (connect, message)
- Rate limit actions (wave, appreciate)

---

## 🎨 Customization Guide

### Change Brand Colors
Update in `tailwind.config.js`:
```javascript
colors: {
  brand: {
    primary: '#YourColor',
    accent: '#YourAccent'
  }
}
```

### Adjust Card Layout
Modify grid in `people.page.ts`:
```html
<!-- 2 columns -->
<div class="grid gap-4 sm:grid-cols-2">

<!-- 3 columns -->
<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

### Change Animation Speed
```css
.hover-lift {
  transition: all 0.3s; /* Change duration */
}
```

---

## 📞 Need Help?

1. Check `PEOPLE_PAGE_IMPLEMENTATION.md` for full details
2. Review inline code comments
3. Check `STYLE_GUIDE.md` for design tokens
4. Search existing issues/docs

---

**Happy Coding! 🚀**
