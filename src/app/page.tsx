"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";
import Image from "next/image";
import logo from "@/img/LogoASLP.png";
import { useAuth } from "@/components/AuthProvider";
import AthleteList from "@/components/AthleteList";
import AttemptsEditor from "@/components/AttemptsEditor";
import LiveController from "@/components/LiveController";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-sm">Verificando sesión...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col w-full">
      {/* Header */}
      <header className="bg-[#111113] border-b border-zinc-800/80 px-6 py-3">
        <div className="flex items-center justify-between font-mulish">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="ASLP Logo" width={36} height={36} className="rounded" />
            <div className="flex flex-col leading-none">
              <h1 className="text-sm font-black tracking-tight text-white">
                ASLP POWERLIFTING
              </h1>
              <span className="text-[10px] text-zinc-500 font-medium">
                Control Panel v4.0
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Radio className="w-3 h-3 text-emerald-500" />
              <span className="text-[11px] text-zinc-400">Realtime</span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
              <span className="text-[11px] text-zinc-500">{user.email}</span>
              <button
                onClick={async () => {
                  await signOut();
                  router.push("/login");
                }}
                className="btn btn-error"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout — Full width 3-column cards */}
      <main className="flex-1 p-4">
        <div className="w-full grid grid-cols-[minmax(0,280px)_1fr_minmax(0,520px)] gap-4 h-[calc(100vh-64px)]">
          {/* Card Izquierda: Lista de Atletas */}
          <div className="material-surface overflow-hidden flex flex-col w-full">
            <div className="p-4 flex-1 overflow-y-auto w-full flex flex-col justify-start">
              <AthleteList
                selectedId={selectedAthleteId}
                onSelect={setSelectedAthleteId}
              />
            </div>
          </div>

          {/* Card Central: Control de Estado en Vivo (PRINCIPAL) */}
          <div className="material-surface overflow-hidden flex flex-col w-full">
            <div className="p-4 flex-1 overflow-y-auto w-full flex flex-col justify-start">
              <LiveController />
            </div>
          </div>

          {/* Card Derecha: Editor de Intentos */}
          <div className="material-surface overflow-hidden flex flex-col w-full">
            <div className="p-4 flex-1 overflow-y-auto w-full flex flex-col justify-start">
              <AttemptsEditor athleteId={selectedAthleteId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
