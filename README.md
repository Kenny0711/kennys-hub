# Kenny's Hub

Kenny's Hub is my personal developer hub. It combines a portfolio homepage, project gallery, admin tools, and a LeetCode learning tracker in one Next.js app.

Live site:

```txt
https://vibe-leetcode.vercel.app
```

Repository:

```txt
https://github.com/Kenny0711/kennys-hub
```

---

## What This Site Does

### Home

The homepage introduces Kenny Yang and provides quick contact/actions:

- GitHub avatar and profile signal
- Email contact: `kenny103089@gmail.com`
- GitHub profile: `https://github.com/Kenny0711`
- Resume preview modal powered by a local PDF asset
- Dashboard entry point
- Featured project gallery
- Journey timeline

Resume asset:

```txt
public/resume/YangChangHao-resume.pdf
```

### Projects

The projects area showcases portfolio work such as learning tools, LeetCode tracking, and research-related projects.

Routes:

```txt
/projects
/admin/projects
/login
```

Admin features:

- Edit project title, description, URL, image, tags, and featured status
- Sync seed/mock projects into Supabase
- Protect writes through admin authentication and server actions

### LeetCode Tracker

The LeetCode tracker records accepted solutions and turns them into a searchable learning dashboard.

Routes:

```txt
/dashboard
/problems
/problems/[id]
```

Features:

- Problem list and detail pages
- Multiple solutions per problem
- Code display with syntax highlighting
- Proficiency tracking
- Activity heatmap
- Realtime or fallback refresh for solution updates

### Chrome Extension

The Chrome Extension captures LeetCode submissions and sends them to the app webhook.

Recent behavior:

- Captures the submitted code snapshot when the Submit button is pressed
- Syncs automatically after an Accepted result
- Avoids saving incomplete code snippets
- Supports manual capture, solved-problem import, and tag enrichment

Webhook:

```txt
/api/webhook
```

---

## Tech Stack

| Area | Stack |
|---|---|
| App framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS |
| Database | Supabase PostgreSQL |
| Auth | Admin cookie + server-side validation |
| Mutations | Server Actions |
| Extension | Chrome Extension Manifest V3 |
| Deployment | Vercel |

---

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build the Chrome Extension output:

```bash
npm run ext:build
```

Validate before pushing:

```bash
npm run lint
npm run build
```

---

## Environment Variables

Create `.env.local` from `.env.local.example`, then fill in the required values.

Common variables:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WEBHOOK_SECRET=
ADMIN_PASSWORD=
```

---

## Documentation

Architecture overview:

```txt
docs/Architecture.md
```

Development logs:

```txt
docs/log/README.md
docs/log/09_DevHub_作品集與後台.md
docs/log/10_首頁聯絡履歷與LeetCode同步.md
```

---

## Latest Update

2026-05-17:

- Added homepage contact links for Gmail and GitHub
- Added resume PDF preview modal
- Improved LeetCode accepted-submission auto sync
- Added realtime/fallback refresh for solution tabs
- Updated README and development logs
