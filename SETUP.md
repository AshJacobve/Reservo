# Setup Instructions

## Prerequisites
- Node.js installed
- Firebase project created
- Firebase Admin SDK service account key

## Local Development Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get your Firebase Service Account:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the downloaded JSON file as `firebase/service_account.json`

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Production Deployment (Vercel/Netlify/etc.)

### Vercel Deployment

1. **Don't upload `service_account.json` - it's already in `.gitignore`**

2. **Add environment variable in Vercel:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Copy the ENTIRE contents of your `service_account.json` file as a single line:
     ```
     {"type":"service_account","project_id":"your-project",...}
     ```
   - Apply to: Production, Preview, and Development

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Netlify Deployment

1. **Add environment variable in Netlify:**
   - Site Settings > Environment Variables
   - Add: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the entire JSON contents as one line

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

## Security Notes

⚠️ **NEVER commit the following files:**
- `.env.local`
- `firebase/service_account.json`

These files contain sensitive credentials and are already included in `.gitignore`.

## How It Works

- **Local:** Uses `service_account.json` file via `GOOGLE_APPLICATION_CREDENTIALS`
- **Production:** Uses JSON string from `FIREBASE_SERVICE_ACCOUNT` environment variable
- The `firebase/config.js` automatically detects which method to use
