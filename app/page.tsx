"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Lock, User, ShieldCheck, ChevronRight, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      router.push("/dashboard");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister ? { name, email, password } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (!isRegister) {
          localStorage.setItem("user", JSON.stringify(data.user));
          toast.success("Successfully logged in!");
          router.push("/dashboard");
        } else {
          toast.success("Account created! Please sign in.");
          setIsRegister(false);
          setPassword("");
        }
      } else {
        const errorText = await response.text();
        toast.error(errorText || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <div className="animate-pulse" style={{ color: 'var(--primary)' }}>
          <BarChart3 size={48} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '48px', background: 'rgba(23, 23, 23, 0.7)', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(20px)', zIndex: 1, margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>LeadGrowth</h1>
          <p style={{ color: 'var(--text-muted)' }}>{isRegister ? "Create Account" : "Sign In"}</p>
        </div>
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isRegister && (
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
            {loading ? "Processing..." : (isRegister ? "Register" : "Login")}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
            {isRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

