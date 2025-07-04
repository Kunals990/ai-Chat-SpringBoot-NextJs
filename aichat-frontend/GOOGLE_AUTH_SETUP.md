# Google Sign-In Setup Instructions

## Prerequisites
1. Create a Google Cloud Console project
2. Enable the Google+ API
3. Create OAuth 2.0 credentials

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen if prompted
6. For Application type, select "Web application"
7. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - Add your production domain when deploying

## Environment Variables Setup

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Backend Integration

The authentication flow generates a Google access token that you can send to your backend. Update the `sendTokenToBackend` function in `src/utils/auth.ts` with your backend endpoint:

```typescript
const response = await fetch('YOUR_BACKEND_URL/auth/google', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    token,
    user: userInfo,
  }),
});
```

## Authentication Flow

1. User clicks "Sign in with Google" on `/login`
2. User is redirected to Google OAuth
3. Google redirects back to `/auth/callback` with authorization code
4. The callback page exchanges the code for an access token
5. Token and user info are stored in localStorage
6. Token is sent to your backend for verification
7. User is redirected to the main app

## Running the Application

```bash
npm run dev
```

Navigate to `http://localhost:3000/login` to test the Google Sign-In flow.
