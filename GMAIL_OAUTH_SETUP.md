# Gmail OAuth Setup Guide

This guide will help you set up Gmail authentication using Google OAuth 2.0 for your movie watchlist application.

## Prerequisites

- A Google Cloud Project
- Google OAuth 2.0 credentials (Client ID and Client Secret)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top left
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "Movie Watchlist")
5. Click "CREATE"
6. Wait for the project to be created and select it

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on "Google+ API"
4. Click "ENABLE"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" for User Type
   - Fill in required fields (App name, User support email, Developer contact info)
   - Click "Save and Continue"
   - On scopes, add "email" and "profile" (Vite handles this automatically)
   - Add yourself as a test user
   - Click "Save and Continue"
4. Back on the credentials page, select "Web application" as the application type
5. Name it "Movie Watchlist" (or your preference)
6. Under "Authorized redirect URIs", add:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Click "Create"
8. Copy the Client ID and Client Secret (you'll need these)

## Step 4: Configure Environment Variables

### Backend (.env)

Add the following variables to your backend `.env` file:

```
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Session
SESSION_SECRET=your_random_session_secret_here

# Frontend URL (for OAuth callback redirect)
FRONTEND_URL=http://localhost:5173

# Backend URL (for Google OAuth callback)
BACKEND_URL=http://localhost:5000
```

### Frontend (.env)

Add the following variable to your frontend `.env` file:

```
VITE_API_BASE_URL=http://localhost:5000
```

## Step 5: How It Works

### Login Flow

1. User clicks "Login with Gmail" button on the login page
2. User is redirected to: `{BACKEND_URL}/api/auth/google`
3. Google OAuth screen appears (if not already logged in)
4. User authorizes the application
5. Google redirects back to: `{BACKEND_URL}/api/auth/google/callback`
6. Backend:
   - Validates the authorization code
   - Fetches user profile from Google
   - Creates or updates user in database
   - Generates JWT token
   - Redirects to: `{FRONTEND_URL}/login?token={JWT_TOKEN}`
7. Frontend extracts token from URL query parameters
8. Token is stored in localStorage
9. User is logged in and redirected to `/watchlist`

### Register Flow

The register flow is identical to the login flow. When a new Gmail account signs up:
- If no account exists with that email, a new user is created
- If an account exists with that email, it's linked to the Google account
- Google accounts are automatically verified (no email verification needed)

## Step 6: Test the Implementation

1. Start your backend: `npm run dev` (in the backend folder)
2. Start your frontend: `npm run dev` (in the frontend folder)
3. Navigate to http://localhost:5173/login
4. Click "Login with Gmail"
5. Follow the Google authentication flow
6. You should be logged in and redirected to your watchlist

## Troubleshooting

### "Redirect URI mismatch" error

- Make sure the redirect URI in Google Cloud Console exactly matches your backend callback URL
- Use `http://localhost:5000` for development, not `127.0.0.1:5000`

### OAuth button not working

- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your backend .env
- Check that FRONTEND_URL and BACKEND_URL are configured correctly
- Check browser console for CORS errors

### User not getting created

- Check MongoDB is running and connected
- Check backend logs for any user creation errors
- Ensure the User model changes have been applied

### "SESSION_SECRET is not configured" error

- Add a SESSION_SECRET to your backend .env file (can be any random string)

## Notes

- Google OAuth users have `authMethod` set to 'google' and don't need password verification
- Google accounts are automatically marked as verified
- Users can link their Google account to an existing email account
- Sessions persist for 24 hours by default

## Production Deployment

For production:

1. Update the redirect URIs in Google Cloud Console to your production domain:
   - `https://yourdomain.com/api/auth/google/callback`

2. Update environment variables:
   ```
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=https://yourdomain.com/api
   SESSION_SECRET=a-very-strong-random-secret
   NODE_ENV=production
   ```

3. Use HTTPS for all connections

4. Configure secure cookies in production by setting `NODE_ENV=production`
