# Prepogy React — Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Firebase Setup (REQUIRED)
1. Go to https://console.firebase.google.com
2. Create a new project (or use existing)
3. Add a **Web App**
4. Copy the config keys into `src/firebase.js`
5. Enable **Authentication** → Sign-in methods → **Email/Password** + **Google**
6. Create **Firestore Database** (production mode)
7. Paste the security rules from `src/firebase.js` comments into Firestore Rules

## 3. Run Dev Server
```bash
npm run dev
```

## 4. Build for Production
```bash
npm run build
```
Output goes to `/dist` folder.

## 5. Deploy

### Netlify
- Connect GitHub repo
- Build command: `npm run build`
- Publish directory: `dist`
- The `public/_redirects` file handles SPA routing

### Vercel
- Connect GitHub repo
- Framework: Vite
- The `vercel.json` handles SPA routing

### GitHub Pages
- Use `gh-pages` package or GitHub Actions
- The `public/CNAME` file is already set to `prepogy.in`

## 6. SEO Notes
- Each page has full meta tags via `react-helmet-async`
- `public/sitemap.xml` is ready — submit to Google Search Console
- `public/robots.txt` is configured
- Blog posts at `/blog/*.html` are static files with their own SEO baked in
- For **best SEO**, consider adding prerendering with `vite-plugin-prerender`

## File Structure
```
src/
  App.jsx            # Routes + Providers
  firebase.js        # 🔑 Add your Firebase config here
  components/        # Shared UI components
  context/           # Auth context
  pages/             # One file per route
  data/              # All bm*.js question data (ES modules)
  hooks/             # Click burst hook
public/
  prep.png           # Logo
  favicon*.png       # Favicons
  blog/*.html        # Static blog posts (SEO optimized)
  sitemap.xml        # Submit to Google Search Console
  _redirects         # Netlify SPA routing
vercel.json          # Vercel SPA routing
```

---

## V4 Additions

### 1. Quiz Player Enhancements
- **No auto-scroll**: When navigating questions, the view stays stable (no more jumping to top)
- **Improved swipe**: Horizontal-only swipe (skips if vertical scroll dominates, skips scrollable tables)
- **Left/right animations**: Next question slides from right, prev from left
- **PYQ mode**: All 9 PYQ data files (Papers 5-12, 17) included as ES modules. Access via `?mode=pyq`
- **SJC mode**: Now uses `?mode=sjc` param — no separate route needed
- **Report button**: Every question has an orange "Report" flag button. Users suggest correct answers → saved to `reports` Firestore collection.

### 2. Admin Dashboard — Role-Based Access

**To make a user admin:**
1. Firebase Console → Firestore → Create document at `users/{uid}` with field `role: "admin"`

**Admin routes (all protected):**
- `/admin` — Dashboard with stats + recent reports
- `/admin/reports` — All answer reports, grouped by question, with vote tallies
- `/admin/quizzes` — Add/edit/delete quiz questions (stored in `quizOverrides/` Firestore)
- `/admin/blog` — Manage blog posts (Firestore-backed `blog/` collection)
- `/admin/notifications` — Compose & send notifications shown to all users in the bell menu

**Firestore collections added:**
- `reports/{id}` — Answer reports from users
- `blog/{id}` — Dynamic blog posts
- `notifications/{id}` — Notifications shown in header bell
- `quizOverrides/{paperId}/sets/{setName}/questions/{id}` — Admin-managed quiz questions

**Firestore Security Rules (add to existing rules):**
```
match /reports/{reportId} {
  allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow create: if request.auth != null;
  allow update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
match /blog/{postId} {
  allow read: if true;
  allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
match /notifications/{notifId} {
  allow read: if true;
  allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
match /quizOverrides/{paperId}/sets/{setName}/questions/{questionId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // Only set via Firebase Console
}
```
