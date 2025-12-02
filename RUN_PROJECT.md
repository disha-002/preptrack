# 🚀 How to Run PrepTrack

## Quick Start (3 Steps)

### Step 1: Start the Backend Server
Open **Terminal 1** and run:
```bash
cd /Users/disha/Desktop/preptrack
node ./server/index.js
```

You should see:
```
Connected to MongoDB mongodb://localhost:27017 db: preptrack
PrepTrack server listening on 4000
```

✅ Backend is now running on **port 4000**

---

### Step 2: Start the Frontend Development Server
Open **Terminal 2** and run:
```bash
cd /Users/disha/Desktop/preptrack
npx react-scripts start
```

You should see:
```
Compiled successfully!
Local: http://localhost:3000
```

✅ Frontend is now running on **port 3000**

---

### Step 3: Open in Browser
Go to:
```
http://localhost:3000
```

You should see the PrepTrack Dashboard with 4 company patterns! 🎉

---

## What's Running

| Service | Port | Status |
|---------|------|--------|
| Frontend (React) | 3000 | ✅ Development Server |
| Backend (Node.js) | 4000 | ✅ API Server |
| MongoDB | 27017 | ✅ Database |

---

## Testing the System

### 1. Dashboard
- See all 4 company patterns
- Each shows: questions, sections, time limit

### 2. Start a Test
- Click "Start Test" on any company
- Timer and questions load from pattern

### 3. Try Each Company
- **TCS 2025**: 15Q (8 Apt + 5 Code + 2 Verb), 45 min
- **Accenture 2025**: 14Q (6 Apt + 6 Code + 2 Verb), 40 min
- **Infosys 2025**: 12Q (5 Apt + 5 Code + 2 Verb), 40 min
- **Wipro 2025**: 10Q (5 Apt + 5 Code), 30 min

---

## Useful Commands

### Build for Production
```bash
npm run build
```

### Run Backend Only
```bash
node ./server/index.js
```

### Run Frontend Only
```bash
npx react-scripts start
```

### Reseed Database
```bash
node scripts/seed.js
```

---

## Troubleshooting

### Backend won't start
- Make sure MongoDB is running: `mongod`
- Check if port 4000 is available

### Frontend won't start
- Delete `node_modules` and run `npm install` again
- Try: `npx react-scripts start` instead of `npm start`

### Port already in use
- Kill process: `lsof -ti:4000 | xargs kill -9`
- Or change port: `PORT=5000 npx react-scripts start`

---

**Both servers must be running for the app to work!** 🚀
