"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSent(false);
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setSent(true);
    } else {
      const result = await res.json();
      setError(result.error || "Failed to send reset email");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-8 flex flex-col gap-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Forgot Password</h2>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
      >
        Send reset link
      </button>
      {sent && (
        <div className="text-green-600 text-center text-sm">
          If this email exists, a reset link will be sent.
        </div>
      )}
      {error && (
        <div className="text-red-600 text-center text-sm">
          {error}
        </div>
      )}
    </form>
  );
} 