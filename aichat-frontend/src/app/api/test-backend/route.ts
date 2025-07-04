import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get backend URL from environment variables
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';
    console.log('Testing backend connectivity to:', backendUrl)
    
    // Test basic connectivity to backend
    const response = await fetch(`${backendUrl}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend health check status:', response.status)

    return NextResponse.json({
      backendUrl,
      status: response.status,
      accessible: response.ok
    });

  } catch (error) {
    console.error('Backend connectivity test failed:', error);
    return NextResponse.json({
      error: 'Backend not accessible',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
