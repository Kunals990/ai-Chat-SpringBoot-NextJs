"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export default function GoogleCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    const exchangeCode = async () => {
      try {
        const res = await fetch(`${backendUrl}/auth/google/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 🔑 this lets backend set httpOnly cookies
          body: JSON.stringify({ code }),
        });

        if (res.ok) {
          // Backend has set cookies, now fetch user profile
          await fetchUser();

          // Redirect to home (or dashboard)
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
