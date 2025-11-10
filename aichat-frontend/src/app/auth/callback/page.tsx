"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";

export default function GoogleCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    const exchangeCode = async () => {
      try {
        const res = await fetch(`/api/auth/google/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", 
          body: JSON.stringify({ code, redirect_uri: window.location.origin + "/api/auth/google/callback" }),
        });

        if (res.ok) {
          await fetchUser();
          sessionStorage.removeItem("session_id");
          useChatStore.getState().clearMessages();
          router.push("/");
        } else {
          console.error("Failed to exchange Google code");
          router.push("/login");
        }
      } catch (err) {
        console.error("Error exchanging Google code:", err);
        router.push("/login");
      }
    };

    exchangeCode();
  }, [searchParams, fetchUser, router]);

  return <p>Signing you in with Google...</p>;
}
