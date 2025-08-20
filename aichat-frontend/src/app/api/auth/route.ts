import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export async function GET() {
  try {
    // Generate Google OAuth URL
    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      prompt: "consent", // ensures refresh_token on first login
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
        { error: "Failed to generate auth URL" },
        { status: 500 }
    );
  }
}
