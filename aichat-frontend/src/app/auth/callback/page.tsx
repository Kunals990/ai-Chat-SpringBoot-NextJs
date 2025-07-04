"use client"
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sendTokenToBackend } from '@/utils/auth'
import Cookies from 'js-cookie';

const CallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('Authentication failed');
        console.error('OAuth error:', error);
        return;
      }

      if (!code) {
        setStatus('No authorization code received');
        return;
      }

      try {
        // Send the authorization code to our API
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate');
        }

        const data = await response.json();
        
        if (data.success) {
          // Store the token and user info
          localStorage.setItem('access_token', data.token);
          localStorage.setItem('id_token', data.id_token);
          localStorage.setItem('user_info', JSON.stringify(data.user));
          
          
          setStatus('Authentication successful! Sending to backend...');
          
          // Send the ID token to your backend (not the access token)
          try {
            await sendTokenToBackend(data.id_token, data.user);
            setStatus('Successfully authenticated! Redirecting...');
          } catch (backendError) {
            console.error('Backend authentication failed:', backendError);
            setStatus('Frontend auth successful, but backend connection failed');
          }
          console.log("before router");
          router.push("/");
          console.log("after router");
        } else {
          setStatus('Authentication failed');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <h2 className="text-2xl font-bold text-gray-900">{status}</h2>
      </div>
    </div>
  );
};

export default CallbackPage;
