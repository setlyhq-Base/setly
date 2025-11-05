# Setly — Your Next Move

> **Start. Evolve. Thrive. Live — Your Way.**  
> Setly is a modern relocation and housing platform designed for students and professionals to find rooms, roommates, and real connections anywhere.

---

## What is Setly?

Setly simplifies your *next move* by connecting people to verified rooms, like-minded roommates, and culturally familiar communities.  
It’s not just about finding a place — it’s about finding where you belong.

Whether you’re an international student landing in a new country or a professional relocating for work, Setly helps you:
- **Find rooms** near universities or workplaces  
- **Connect with roommates** who share your lifestyle  
- **Explore communities** that feel like home  

---

## Key Features (MVP-1)

| Category | Feature | Description |
|-----------|----------|-------------|
| **Search** | University-based listings | Find rooms near your university or city |
| **Discovery** | Smart filters | Vegetarian, Non-smoking, Pets OK, Budget, Furnished, etc. |
| **Messaging** | In-app chat (mock) | Connect safely with listers and roommates |
| **Listing Flow** | Multi-step “Post a Room” | Add photos, rules, and preferences |
| **Trust Layer** | Verification & privacy | Hide personal info until both parties connect |
| **Persistence** | Local storage + mock API | Smooth UX during MVP testing |
| **Design** | Minimal dark theme | Built with Tailwind + Angular Signals |

---

## Tech Stack

**Frontend:**  
- [Angular 17](https://angular.dev) (Standalone Components + Signals)  
- [TailwindCSS](https://tailwindcss.com)  
- [TypeScript](https://www.typescriptlang.org)  

**Backend (Planned for MVP-2):**  
- Node.js + Express or NestJS  
- MongoDB / Firebase (cloud-hosted data layer)  

**Other Tools:**  
- Stripe (for reservation payments — Beta)  
- AWS / Vercel (deployment)  
- Figma (UI design)  

---

## Project Structure
src/
┣ app/
┃ ┣ core/              # models, services, stores
┃ ┣ pages/             # home, browse, post, messages, profile
┃ ┣ shared/            # reusable UI components
┃ ┗ layout/            # navbar, footer, global layout
┣ assets/branding/     # logo + icons
┗ environments/

---

## Roadmap

### MVP-1 (Now)
- Landing page (Hero + search + filters)
- Browse + filters + mock data
- Post a Room (multi-step form)
- Auth mock + local persistence

### MVP-2 (Next)
- Real database + API integration  
- Live chat with notifications  
- Reservation flow with Stripe integration  
- Recommendation engine (match roommates)

### MVP-3 (Future)
- Move-in services (Wi-Fi, utilities, movers)  
- Partner onboarding (universities, housing networks)  
- Global expansion for student relocation  

---

## Contributing

Setly is at an early stage (MVP-1).  
If you’re a developer, designer, or student who wants to be part of the journey — feel free to:
1. Fork the repo  
2. Create a feature branch  
3. Submit a pull request  

We believe in community-driven growth — just like our users. 🌱  

---

## Vision

> “To make relocation effortless — helping people *start, evolve, and thrive* wherever life takes them.”

Setly isn’t about *settling down*.  
It’s about empowering individuals to live their next chapter — confidently and connected.  

---

## About the Name

**S**tart · **E**volve · **T**hrive · **L**ive · **Y**our way.  
Each letter in **Setly** represents progress — from the moment you start a new journey to building the life you dream of.  

---

## Live Preview (coming soon)
> 🔗 [setly.in](https://setly.in) &nbsp;&nbsp;|&nbsp;&nbsp; [setly.net](https://setly.net)

---

## Screenshots

| Landing | Browse | Post a Room | Messages |
|----------|---------|--------------|-----------|
| ![Landing](assets/screenshots/landing.png) | ![Browse](assets/screenshots/browse.png) | ![Post](assets/screenshots/post.png) | ![Messages](assets/screenshots/messages.png) |

---

## 👨‍💻 Built by
**Kiran Revally**  
Founder, **Setly HQ**  
🌐 [LinkedIn](https://www.linkedin.com/company/setlyhq/) · [GitHub](https://github.com/setlyhq)

---

## License
© 2025 Setly HQ. All rights reserved.  
This project is licensed under the [MIT License](LICENSE).

---

### TL;DR
Setly helps you **find where you belong** — one move at a time.  
*Your Next Move Starts Here.*
