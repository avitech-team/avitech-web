"use client";
import { useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("0"); // 0=user, 1=admin
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Register failed");
    } else {
      alert("Register success!");
      router.push("/auth/login");
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Register</h2>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Register
      </button>
      {error && (
        <div className="text-red-600 text-center font-medium mt-2">{error}</div>
      )}
    </form>
  );
}