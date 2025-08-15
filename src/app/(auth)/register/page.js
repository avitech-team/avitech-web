"use client";
import { useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "../../../../lib/sweetalert";

export default function RegisterPage() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!first_name || !last_name || !email || !password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      showError('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name, last_name, email, password, phone }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Register failed");
      showError('ลงทะเบียนไม่สำเร็จ', result.error || "Register failed");
    } else {
      showSuccess('ลงทะเบียนสำเร็จ', 'คุณได้ลงทะเบียนเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ');
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
        value={first_name}
        onChange={e => setFirstName(e.target.value)}
        placeholder="ชื่อ"
        type="text"
        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <input
        value={last_name}
        onChange={e => setLastName(e.target.value)}
        placeholder="นามสกุล"
        type="text"
        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <input
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="เบอร์โทร (ไม่บังคับ)"
        type="tel"
        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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