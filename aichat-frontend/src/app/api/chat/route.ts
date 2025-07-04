import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // const router = useRouter();
    console.log('Chat API called')
    const { message, llm, history } = await request.json();
    console.log('Received data:', { message, llm })
    
    const token=request.cookies.get('access_token')?.value;

    if (!token) {
      console.log('No JWT cookie found');
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    if (!message || !llm) {
      console.log('Missing message or llm')
      return NextResponse.json(
        { error: 'Message and LLM selection are required' },
        { status: 400 }
      );
    }

    // Get backend URL from environment variables
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';
    console.log('Backend URL:', backendUrl)
    
    const requestBody = {
      message,
      role: "USER",
      LLM: llm
    };
    console.log('Sending to backend:', requestBody)
    
    // Send request to backend with the correct JSON format
    const response = await fetch(`${backendUrl}/chat/llm`, {
      method: 'POST',
      credentials:"include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Backend response status:', response.status)
    console.log('Backend response ok:', response.ok)

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error status:', response.status);
      console.error('Backend error data:', errorData);
      console.error('Full response headers:', Array.from(response.headers.entries()));
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${errorData || 'No error message'}` },
        { status: response.status }
      );
    }

    const data = await response.text(); // Backend returns plain string, not JSON
    console.log('Backend response data:', data)

    return NextResponse.json({
      response: data, // Use the plain string response directly
      llm: llm,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
