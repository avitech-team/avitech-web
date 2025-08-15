"use client";
import { useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "../../../../lib/sweetalert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Login failed");
      showError('เข้าสู่ระบบไม่สำเร็จ', result.error || "Login failed");
    } else {
      // เก็บ accessToken ลง localStorage
      if (result.token) {
        localStorage.setItem("token", result.token);
      }
      showSuccess('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับกลับ!');
      router.push("/"); // หรือหน้า dashboard
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-12 bg-white shadow-lg rounded-lg p-8 flex flex-col gap-6"
    >
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Login</h2>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoComplete="email"
      />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoComplete="current-password"
      />
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors"
      >
        Login
      </button>
      <div className="text-right mt-2">
        <a
          href="/auth/forgot"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot password?
        </a>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-2 text-center">
          {error}
        </div>
      )}
    </form>
  );
}