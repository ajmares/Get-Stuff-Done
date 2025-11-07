# Deployment Guide for GetStuffDone

## Current Setup: localStorage (Browser-Based)

Your app currently saves all data to the browser's localStorage. This means:
- ✅ Data persists on your device
- ✅ Works offline
- ✅ No backend needed
- ❌ Data is per-device (not synced across devices)

## Quick Start (Local Development)

```bash
npm run dev
```

Open http://localhost:5173 - your data saves automatically!

## Deploy to Render (Static Site)

### Step 1: Build the app
```bash
npm run build
```

### Step 2: Deploy to Render
1. Go to [Render.com](https://render.com)
2. Create new "Static Site"
3. Connect your GitHub repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy!

**Note:** Each device will have separate localStorage. Data won't sync between devices.

## Deploy to Vercel (Alternative)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel auto-detects Vite projects.

## Backup Your Data

**Before deploying or making major changes:**

1. Go to Settings (gear icon)
2. Click "Export Data (JSON)"
3. Save the file somewhere safe

**To restore:**
1. Go to Settings
2. Click "Import Data (JSON)"
3. Select your backup file

## Future: Multi-Device Sync

If you want true sync across devices, you'll need:
- Backend API (Node.js, Python, etc.)
- Database (PostgreSQL, MongoDB, etc.)
- Authentication (optional)

Popular options:
- **Supabase** - Firebase alternative with PostgreSQL
- **Firebase** - Google's backend-as-a-service
- **Railway/Render** - Host your own backend

## Best Practices

### For Daily Single-Device Use:
✅ Keep it local
✅ Export backups weekly
✅ Bookmark localhost:5173

### For Multi-Device Access:
✅ Deploy to Render/Vercel
✅ Use Export/Import to sync manually
⚠️ Remember: Each device has separate data

### For True Sync:
✅ Add backend + database
✅ Replace localStorage with API calls
✅ Implement user authentication (optional)

