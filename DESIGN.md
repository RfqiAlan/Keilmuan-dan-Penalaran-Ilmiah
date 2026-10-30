# Design Direction — SIMPAR UKM KPI

Sistem Informasi Manajemen & Penalaran Ilmiah (SIMPAR UKM KPI).

## 1. Identity & Personality
- **Karakter:** Akademis, terpercaya, terstruktur, modern, dan fungsional.
- **Audience:** Mahasiswa, pengurus UKM, dosen pembina, dan civitas akademika.
- **Prinsip:** Utamakan kejelasan data dan kemudahan navigasi dibanding dekorasi berlebih. Tanpa efek generik AI (tidak ada gradien ungu neon, tidak ada glassmorphism berlebihan yang mengorbankan keterbacaan).

## 2. Color Palette & Tokens (Bright / Cerah Palette)
Merujuk pada `client/src/index.css`:
- **Primary (Bright Azure / Cerulean Blue):**
  - `--color-primary-400`: `#38bdf8` (Bright sky highlight / focus glow)
  - `--color-primary-500`: `#0284c7` (Primary brand color — vivid, high-contrast, fresh)
  - `--color-primary-600`: `#0369a1` (Solid interactive hover & buttons)
  - `--color-primary-900`: `#082f49` (Deep background / solid dark accents)
- **Accent (Sunny Tangerine Orange):**
  - `--color-accent`: `#f97316` (Bright CTA, badges penting, active state)
  - `--color-accent-light`: `#fb923c`
  - `--color-accent-dark`: `#ea580c`
- **Surface & Background:**
  - Light mode base: `#f8fafc` (`--color-light`), cards: `#ffffff` (luminous, crisp, high-contrast)
  - Dark mode base: `#0f172a` (`--color-surface`), cards: `#1e293b` (`--color-surface-2`)
  - Border: `#334155` (`--color-border` / `border-slate-200` pada light mode)
  - Text: `#0f172a` (Light mode) / `#f8fafc` (Dark mode)
  - Text Muted: `#64748b` (`--color-text-muted`)

## 3. Typography & Spacing
- **Font Family:** `"Inter", system-ui, sans-serif`
- **Scale:**
  - H1 / Page Titles: `text-2xl font-bold tracking-tight`
  - H2 / Section Titles: `text-xl font-semibold`
  - Body: `text-sm` atau `text-base text-slate-800 dark:text-slate-200`
  - Meta/Caption: `text-xs text-slate-500 dark:text-text-muted`
- **Border Radius:** `rounded-xl` (`0.75rem`) untuk card dan modal.

## 4. Affordance & Human Factors (Antislop Guardrails)
- **Interactive Controls:** Semua elemen klik (`button`, dropdown, tab, link) wajib memiliki `cursor-pointer` dan visible hover/active state.
- **Focus States:** Selalu sediakan `focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2`.
- **Mobile Touch Targets:** Minimum 44×44px untuk touch target pada perangkat mobile.
- **Contrast:** Menjaga rasio kontras teks minimal 4.5:1 untuk normal text dan 3:1 untuk control borders (WCAG AA).

