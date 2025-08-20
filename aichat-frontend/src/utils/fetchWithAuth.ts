import { useAuthStore } from "@/stores/authStore";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {

  let res = await fetch(url, { ...options, credentials: "include" });

  if (res.status === 401) {
    const ok = await useAuthStore.getState().refreshAccessToken();
    if (!ok) {
      await useAuthStore.getState().logout();
      return res;
    }
    res = await fetch(url, { ...options, credentials: "include" });
  }

  return res;
}
