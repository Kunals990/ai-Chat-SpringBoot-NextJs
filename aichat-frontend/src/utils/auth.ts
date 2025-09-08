// Utility functions for handling authentication tokens

export const sendTokenToBackend = async (idToken: string) => {
  try {
    // Use environment variable for backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    // console.log("ID token is "+ idToken);
    const response = await fetch(`/api/auth/google`, {
      method: 'POST',
      credentials:"include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: idToken
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send token to backend');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending token to backend:', error);
    throw error;
  }
};

export const logout = async()=>{
  if (typeof window !== 'undefined'){
    try{
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`/api/auth/logout`, {
      method: 'POST',
      credentials:"include",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if(!response.ok){
      throw new Error("Failed to logout");
    }

    }catch(error){
      console.log("Error logging out:",error);
      throw error;
    }
  }
}

export const getStoredAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const getStoredIdToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('id_token');
  }
  return null;
};

// Legacy function for backward compatibility
export const getStoredToken = () => {
  return getStoredAccessToken();
};

