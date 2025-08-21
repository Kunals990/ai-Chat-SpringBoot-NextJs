import { useAuthStore } from "@/stores/authStore";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {

  let res = await fetch(url, { ...options, credentials: "include" });
  if (res.status === 403) {
    const ok = await useAuthStore.getState().refreshAccessToken();
    if (!ok) {
      await useAuthStore.getState().logout();
      return res;
    }
    res = await fetch(url, { ...options, credentials: "include" });
  }

  return res;
}
