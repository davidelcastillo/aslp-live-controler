"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Título */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">
            ASLP POWERLIFTING
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Panel de Control — Iniciar sesión
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="material-surface p-6 space-y-4"
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 block mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 text-white text-sm px-3 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none transition-all duration-200"
              placeholder="operador@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 block mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 text-white text-sm px-3 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none transition-all duration-200"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn w-full bg-[#c41e3a] hover:bg-[#b01830] disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-2.5 rounded-full shadow-[0_3px_8px_rgba(196,30,58,0.35)] hover:shadow-[0_6px_16px_rgba(196,30,58,0.45)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_1px_4px_rgba(196,30,58,0.3)] transition-all duration-200 tracking-wide border-none"
          >
            {loading
              ? "Cargando..."
              : isSignUp
              ? "Crear cuenta"
              : "Iniciar sesión"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="btn btn-ghost text-[#c41e3a] hover:bg-[#c41e3a]/10 text-sm rounded-full px-3 py-1 transition-all duration-200 border-none"
            >
              {isSignUp
                ? "¿Ya tenés cuenta? Iniciar sesión"
                : "¿No tenés cuenta? Crear una"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
