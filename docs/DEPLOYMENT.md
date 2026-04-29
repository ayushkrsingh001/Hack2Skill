# Deployment Guide

## Quick Start (Development)
```bash
# Install Node.js if not already installed
# Then install server dependencies:
cd server && npm install

# Start the server (serves frontend + API):
npm start
# Open http://localhost:3000
```

## Google Services Setup

### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable "Maps JavaScript API"
3. Create an API key → restrict by HTTP referrer
4. Replace `YOUR_GOOGLE_MAPS_API_KEY` in `index.html`

### Firebase
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Anonymous Authentication
3. Create Firestore database
4. Copy config to `js/services/firebase.js`
5. Set Firestore security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quizScores/{doc} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

## Production Deployment (Firebase Hosting)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # Set public dir to "."
firebase deploy
```

## Environment Variables
Copy `server/.env.example` to `server/.env` and fill in your API keys.
