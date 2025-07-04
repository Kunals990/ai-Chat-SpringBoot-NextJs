import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange authorization code for tokens
    const { tokens } = await client.getToken(code);
    
    if (!tokens.access_token) {
      return NextResponse.json(
        { error: 'Failed to get access token' },
        { status: 400 }
      );
    }

    // Verify the token and get user info
    client.setCredentials(tokens);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 400 }
      );
    }

    const userInfo = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    // Return the token and user info to send to your backend
    return NextResponse.json({
      success: true,
      token: tokens.access_token,
      id_token: tokens.id_token,
      user: userInfo,
      refresh_token:tokens.refresh_token
    });

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Generate the Google OAuth URL
    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });

    return NextResponse.json({
      authUrl,
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
