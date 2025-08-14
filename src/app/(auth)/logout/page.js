"use client";
import { useEffect } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    // ถ้ามีการจัดการ session/cookie ฝั่ง client ให้ลบที่นี่
    router.push("/auth/login");
  }, [router]);
  return <div>Logging out...</div>;
}