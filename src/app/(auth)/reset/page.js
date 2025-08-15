"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { showSuccess, showError } from "../../../../lib/sweetalert";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Reset failed");
      showError('รีเซ็ตรหัสผ่านไม่สำเร็จ', result.error || "Reset failed");
    } else {
      setSuccess(true);
      showSuccess('รีเซ็ตรหัสผ่านสำเร็จ', 'รหัสผ่านใหม่ถูกตั้งค่าเรียบร้อยแล้ว กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...');
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  };

  if (!token) return <div>Invalid or missing token.</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="New Password" />
      <button type="submit">Set new password</button>
      {error && <div style={{color:"red"}}>{error}</div>}
      {success && <div>Password reset successful! Redirecting to login...</div>}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
} 