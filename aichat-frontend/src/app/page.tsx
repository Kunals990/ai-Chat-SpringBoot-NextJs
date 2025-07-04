import Chat from "@/components/Chat";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    </main>
  );
}
