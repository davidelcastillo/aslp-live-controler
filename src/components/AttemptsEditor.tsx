"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Tables, Enums } from "@/types/supabase";
import {
  Weight,
  Check,
  X,
  Circle,
  Loader,
  AlertTriangle,
  User,
} from "lucide-react";

type Attempt = Tables<"attempts">;
type Athlete = Tables<"athletes">;
type AttemptStatus = Enums<"attempt_status">;
type MovementType = Enums<"movement_type">;

interface AttemptsEditorProps {
  athleteId: string | null;
}

const MOVEMENTS: { key: MovementType; label: string; rackField: "altura_rack_sq" | "altura_rack_bp" | null }[] = [
  { key: "SQ", label: "SQUAT", rackField: "altura_rack_sq" },
  { key: "BP", label: "BENCH PRESS", rackField: "altura_rack_bp" },
  { key: "DL", label: "DEADLIFT", rackField: null },
];

const STATUS_CONFIG: Record<
  AttemptStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Pendiente",
    color: "text-zinc-400",
    bg: "bg-zinc-700",
    icon: Circle,
  },
  CURRENT: {
    label: "Actual",
    color: "text-black",
    bg: "bg-yellow-400",
    icon: Loader,
  },
  GOOD: {
    label: "Válido",
    color: "text-white",
    bg: "bg-emerald-600",
    icon: Check,
  },
  BAD: {
    label: "Fallo",
    color: "text-white",
    bg: "bg-red-600",
    icon: X,
  },
};

export default function AttemptsEditor({ athleteId }: AttemptsEditorProps) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!athleteId) {
      setAttempts([]);
      setAthlete(null);
      return;
    }
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setLoading(false);
      return;
    }

    const [athleteRes, attemptsRes] = await Promise.all([
      supabase.from("athletes").select("*").eq("id", athleteId).single(),
      supabase
        .from("attempts")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("movement", { ascending: true })
        .order("attempt_number", { ascending: true }),
    ]);

    if (athleteRes.data) setAthlete(athleteRes.data);
    if (attemptsRes.data) setAttempts(attemptsRes.data);
    setLoading(false);
  }, [athleteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!athleteId) return;

    const channel = supabase
      .channel(`attempts-${athleteId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attempts",
          filter: `athlete_id=eq.${athleteId}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [athleteId, fetchData]);

  const getAttempt = (movement: MovementType, num: number) =>
    attempts.find(
      (a) => a.movement === movement && a.attempt_number === num
    );

  const getValidation = (movement: MovementType, num: number, weight: number) => {
    const warnings: string[] = [];

    if (weight > 0 && weight % 2.5 !== 0) {
      warnings.push("El peso debe ser múltiplo de 2.5kg");
    }

    if (num > 1) {
      const prevAttempt = getAttempt(movement, num - 1);
      if (prevAttempt && weight > 0 && weight < prevAttempt.weight) {
        warnings.push(
          `No puede ser menor al intento anterior (${prevAttempt.weight}kg)`
        );
      }
    }

    return warnings;
  };

  const handleWeightChange = async (
    attemptId: string,
    movement: MovementType,
    num: number,
    newWeight: number
  ) => {
    const warnings = getValidation(movement, num, newWeight);
    if (warnings.length > 0) {
      console.warn("Validaciones:", warnings.join(", "));
    }

    const { error } = await supabase
      .from("attempts")
      .update({ weight: newWeight })
      .eq("id", attemptId);

    if (error) {
      alert("Error al actualizar peso: " + error.message);
    }
  };

  const handleStatusChange = async (
    attemptId: string,
    newStatus: AttemptStatus
  ) => {
    const { error } = await supabase
      .from("attempts")
      .update({ status: newStatus })
      .eq("id", attemptId);

    if (error) {
      alert("Error al actualizar estado: " + error.message);
    }
  };

  if (!athleteId) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Seleccioná un atleta para editar sus intentos
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        Cargando intentos...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header con info del atleta */}
      <div className="bg-[#252530] border border-zinc-700/50 rounded-xl p-4 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <User className="w-5 h-5 text-zinc-400" />
          {athlete?.apellido.toUpperCase()}, {athlete?.nombre}
        </h2>
        <div className="flex gap-3 text-xs text-zinc-400 mt-1">
          <span className="bg-zinc-800 border border-zinc-700/40 rounded-xl px-2 py-0.5">
            {athlete?.genero === "F" ? "Femenino" : "Masculino"}
          </span>
          <span className="bg-zinc-800 border border-zinc-700/40 rounded-xl px-2 py-0.5">
            {athlete?.categoria || "—"}
          </span>
          <span className="bg-zinc-800 border border-zinc-700/40 rounded-xl px-2 py-0.5">
            {(athlete?.cat_peso ?? 0) > 0 ? `${athlete?.cat_peso}kg` : "—"}
          </span>
          {(athlete?.altura_rack_sq || athlete?.altura_rack_bp) && (
            <>
              {athlete?.altura_rack_sq && (
                <span className="text-zinc-500">Rack SQ: {athlete.altura_rack_sq}</span>
              )}
              {athlete?.altura_rack_bp && (
                <span className="text-zinc-500">Rack BP: {athlete.altura_rack_bp}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Intentos por movimiento */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {MOVEMENTS.map(({ key, label }) => (
          <div key={key} className="bg-[#252530] border border-zinc-700/50 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            <h3 className="text-sm font-bold text-[#c41e3a] mb-2 uppercase tracking-wider flex items-center gap-2">
              <Weight className="w-4 h-4" />
              {label}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[1, 2, 3].map((num) => {
                const attempt = getAttempt(key, num);
                if (!attempt) return null;

                const warnings = getValidation(key, num, attempt.weight);

                return (
                  <div
                    key={attempt.id}
                    className="bg-transparent border border-white/5 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-zinc-500 w-8">
                        #{num}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="number"
                          step="2.5"
                          min="0"
                          value={attempt.weight || ""}
                          onChange={(e) =>
                            handleWeightChange(
                              attempt.id,
                              key,
                              num,
                              parseFloat(e.target.value) || 0
                            )
                          }
                           className="bg-zinc-900 text-white text-lg font-mono font-bold px-3 py-1.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none w-28 text-right transition-all duration-200"
                          placeholder="0"
                        />
                        <span className="text-zinc-500 text-sm">kg</span>
                      </div>
                    </div>

                    {/* Warnings */}
                    {warnings.length > 0 && (
                      <div className="mb-2">
                        {warnings.map((w, i) => (
                          <p key={i} className="text-yellow-500 text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {w}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Status buttons */}
                    <div className="flex gap-1">
                      {(
                        ["PENDING", "CURRENT", "GOOD", "BAD"] as AttemptStatus[]
                      ).map((status) => {
                        const StatusIcon = STATUS_CONFIG[status].icon;
                        return (
                          <button
                            key={status}
                            onClick={() =>
                              handleStatusChange(attempt.id, status)
                            }
                            className={`btn flex-1 text-xs font-semibold py-2 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-1 duration-200 border-none ${
                              attempt.status === status
                                ? `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].color} ring-2 ring-white/20 shadow-[0_3px_10px_rgba(0,0,0,0.4)]`
                                : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-600"
                            }`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {STATUS_CONFIG[status].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
