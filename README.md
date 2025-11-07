# GetStuffDone

A single-page productivity web app with three main features: Pomodoro timer, Kanban project board, and Weekly Big 3 focus tracking.

## Features

### 🍅 Pomodoro
- Customizable work/break intervals
- Task list with focus task selection
- Notes for each task
- Auto-start next interval option
- Mode switching (work → short break → long break)

### 📋 Projects (Kanban)
- Drag & drop cards across columns
- Customizable columns (add, rename, delete)
- Project details drawer with:
  - Title and description
  - Checklist with drag-to-reorder
  - Tags
  - Priority levels (Low/Med/High)
- Visual progress indicators

### 📅 Weekly Big 3
- Select up to 3 priority projects per week
- Week navigation (previous/next)
- Progress tracking from Kanban board
- Quick access to project details

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **localStorage** for data persistence

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Design

- **Dark mode** only (neutral-950 background)
- **Rounded corners** (rounded-2xl)
- **Hover effects** with subtle shadow lift
- **Accent colors**: Indigo, Blue, Purple, Fuchsia (switchable)
- **Keyboard-friendly** interactions

## Data Management

All data is stored in browser localStorage. You can:
- **Export** your data as JSON (Settings → Export)
- **Import** previously exported data (Settings → Import)
- **Clear** all data (Settings → Clear All Data)

## Project Structure

```
src/
  components/
    Header.tsx          # Navigation + accent picker
    Drawer.tsx          # Slide-in drawer component
    ConfirmDialog.tsx   # Confirmation dialogs
  pages/
    PomodoroPage.tsx    # Pomodoro timer + tasks
    ProjectsPage.tsx    # Kanban board
    WeeklyPage.tsx      # Weekly Big 3
  hooks/
    useLocalStorage.ts  # localStorage persistence
    useInterval.ts      # Timer interval hook
  lib/
    state.ts            # Type definitions + initial state
    time.ts             # Time formatting + week utilities
  App.tsx               # Main app component
  main.tsx              # Entry point
  index.css             # Global styles
```

## Keyboard Shortcuts

- **Escape**: Close drawers/modals
- **Enter**: Submit forms (task creation, etc.)

## License

MIT
