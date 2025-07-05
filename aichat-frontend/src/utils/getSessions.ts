interface Session {
  id: string;
  sessionName: string;
  timestamp: [number, number, number, number, number, number, number];
}

export async function getSessions(): Promise<Session[] | null> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendUrl}/chat/getSession`, {
      method: 'POST',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch sessions:', response.statusText);
      return null;
    }

    const data: Session[] = await response.json();
    console.log(data);
    return data; // array of session objects
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return null;
  }
}
