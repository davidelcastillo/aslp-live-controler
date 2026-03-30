"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Radio, Check, X, SkipForward, Play, Square, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Tables, Enums } from "@/types/supabase";

type Athlete = Tables<"athletes">;
type LiveState = Tables<"live_state">;
type MovementType = Enums<"movement_type">;

const MOVEMENTS: MovementType[] = ["SQ", "BP", "DL"];
const MOVEMENT_LABELS: Record<MovementType, string> = {
  SQ: "SQUAT",
  BP: "BENCH PRESS",
  DL: "DEADLIFT",
};

// IPF Weight Categories — imported from AthleteList constants
const CATEGORIAS = ["Sub-Junior", "Junior", "Open", "Master"] as const;

const PESOS_FEMENINO = [
  "-47kg",
  "-52kg",
  "-57kg",
  "-63kg",
  "-69kg",
  "-76kg",
  "-84kg",
  "84+kg",
] as const;

const PESOS_MASCULINO = [
  "-59kg",
  "-66kg",
  "-74kg",
  "-83kg",
  "-93kg",
  "-105kg",
  "-120kg",
  "120+kg",
] as const;

// Unified peso options with gender prefix for clarity
const ALL_PESO_OPTIONS: { label: string; value: number }[] = [
  ...PESOS_FEMENINO.map((p) => ({
    label: `F: ${p}`,
    value: parseFloat(p.replace(/[^0-9.]/g, "")) || 0,
  })),
  ...PESOS_MASCULINO.map((p) => ({
    label: `M: ${p}`,
    value: parseFloat(p.replace(/[^0-9.]/g, "")) || 0,
  })),
];

function getNextStep(
  currentMovement: MovementType | null,
  currentAttempt: number | null
): { movement: MovementType; attempt: number } | null {
  if (!currentMovement || !currentAttempt) {
    return { movement: "SQ", attempt: 1 };
  }
  const mIdx = MOVEMENTS.indexOf(currentMovement);
  if (currentAttempt < 3) {
    return { movement: currentMovement, attempt: currentAttempt + 1 };
  }
  if (mIdx < MOVEMENTS.length - 1) {
    return { movement: MOVEMENTS[mIdx + 1], attempt: 1 };
  }
  return null;
}

export default function LiveController() {
  const [liveState, setLiveState] = useState<LiveState | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  // Filtros unificados de atletas
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterPeso, setFilterPeso] = useState("");

  const fetchData = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;

    const [stateRes, athletesRes] = await Promise.all([
      supabase.from("live_state").select("*").eq("id", 1).single(),
      supabase
        .from("athletes")
        .select("*")
        .order("created_at", { ascending: true }),
    ]);

    if (stateRes.error) console.error("live_state error:", stateRes.error);
    if (athletesRes.error) console.error("athletes error:", athletesRes.error);

    if (stateRes.data) setLiveState(stateRes.data);
    if (athletesRes.data) setAthletes(athletesRes.data);
    setLoading(false);
    fetchedRef.current = true;
  }, []);

  useEffect(() => {
    fetchData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && !fetchedRef.current) {
        fetchData();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchData]);

  // Realtime subscription for live_state — solo para sync externo (overlay u otro tab)
  useEffect(() => {
    const channel = supabase
      .channel("live-state-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_state" },
        (payload) => {
          if (payload.new && "id" in payload.new) {
            setLiveState(payload.new as LiveState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /**
   * Actualiza estado LOCAL + Supabase simultáneamente.
   * La UI responde inmediatamente (optimistic update).
   */
  const updateState = async (update: Partial<LiveState>) => {
    // 1. Actualizar estado local INMEDIATAMENTE
    setLiveState((prev) => {
      if (!prev) return prev;
      return { ...prev, ...update };
    });

    // 2. Persistir en Supabase en background
    const { error } = await supabase
      .from("live_state")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (error) {
      console.error("Error al actualizar estado:", error);
      // Rollback: recargar desde Supabase
      fetchData();
    }
  };

  const handleGoLive = async () => {
    if (
      !liveState?.athlete_id ||
      !liveState.current_movement ||
      !liveState.current_attempt
    ) {
      alert("Seleccioná atleta, movimiento e intento primero");
      return;
    }

    const weight = liveState.current_weight ?? 0;

    // Mark attempt as CURRENT
    await supabase
      .from("attempts")
      .update({ status: "CURRENT", weight })
      .eq("athlete_id", liveState.athlete_id)
      .eq("movement", liveState.current_movement)
      .eq("attempt_number", liveState.current_attempt);

    await updateState({ is_live: true });
  };

  const handleEndLift = async () => {
    await updateState({ is_live: false });
  };

  const handleMarkResult = async (status: "GOOD" | "BAD") => {
    if (
      !liveState?.athlete_id ||
      !liveState.current_movement ||
      !liveState.current_attempt
    )
      return;

    // Mark current attempt
    await supabase
      .from("attempts")
      .update({ status })
      .eq("athlete_id", liveState.athlete_id)
      .eq("movement", liveState.current_movement)
      .eq("attempt_number", liveState.current_attempt);

    // Auto-advance
    const next = getNextStep(
      liveState.current_movement,
      liveState.current_attempt
    );
    if (next) {
      const { data: nextAttempt } = await supabase
        .from("attempts")
        .select("weight")
        .eq("athlete_id", liveState.athlete_id)
        .eq("movement", next.movement)
        .eq("attempt_number", next.attempt)
        .single();

      await updateState({
        current_movement: next.movement,
        current_attempt: next.attempt,
        current_weight: nextAttempt?.weight ?? 0,
        is_live: false,
      });
    } else {
      await updateState({ is_live: false });
    }
  };

  const handleNextAttempt = async () => {
    if (!liveState) return;

    const next = getNextStep(
      liveState.current_movement,
      liveState.current_attempt
    );
    if (!next) {
      alert("¡Evento completado! No hay más intentos.");
      return;
    }

    if (liveState.athlete_id) {
      const { data: nextAttempt } = await supabase
        .from("attempts")
        .select("weight")
        .eq("athlete_id", liveState.athlete_id)
        .eq("movement", next.movement)
        .eq("attempt_number", next.attempt)
        .single();

      await updateState({
        current_movement: next.movement,
        current_attempt: next.attempt,
        current_weight: nextAttempt?.weight ?? 0,
        is_live: false,
      });
    } else {
      await updateState({
        current_movement: next.movement,
        current_attempt: next.attempt,
        current_weight: 0,
        is_live: false,
      });
    }
  };

  const handleSelectAthlete = async (athleteId: string) => {
    if (!athleteId) {
      await updateState({ athlete_id: null });
      return;
    }

    // Auto-load first attempt weight
    const { data: firstAttempt } = await supabase
      .from("attempts")
      .select("weight")
      .eq("athlete_id", athleteId)
      .eq("movement", "SQ")
      .eq("attempt_number", 1)
      .single();

    await updateState({
      athlete_id: athleteId,
      current_movement: "SQ",
      current_attempt: 1,
      current_weight: firstAttempt?.weight ?? 0,
      is_live: false,
    });
  };

  const handleWeightChange = async (value: string) => {
    const weight = parseFloat(value) || 0;
    // Actualizar local inmediatamente para que el input no se "rebote"
    setLiveState((prev) => (prev ? { ...prev, current_weight: weight } : prev));
  };

  const handleWeightBlur = async () => {
    // Persistir en Supabase cuando el usuario sale del campo
    if (!liveState) return;
    await supabase
      .from("live_state")
      .update({
        current_weight: liveState.current_weight,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
  };

  // Filtrar atletas según categoría y peso (match exacto numérico)
  const filteredAthletes = athletes.filter((a) => {
    if (filterCategoria && a.categoria !== filterCategoria) return false;
    if (filterPeso) {
      const pesoFilterValue = parseFloat(filterPeso) || 0;
      if (a.cat_peso !== pesoFilterValue) return false;
    }
    return true;
  });

  const currentAthlete = athletes.find((a) => a.id === liveState?.athlete_id);

  if (loading) {
    return <div className="p-6 text-zinc-400">Cargando estado...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold tracking-tight text-white mb-4">Estado en Vivo</h2>

      {/* Card: Estado actual */}
      <div
        className={`mb-4 bg-[#252530] border border-zinc-700/50 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-all ${
          liveState?.is_live
            ? "!bg-emerald-950/50 !border-emerald-500/60 shadow-[0_4px_16px_rgba(16,185,129,0.2)]"
            : ""
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Radio
            className={`w-4 h-4 transition-colors ${
              liveState?.is_live ? "text-emerald-400 animate-pulse" : "text-zinc-600"
            }`}
          />
          <span className="text-sm font-bold text-white">
            {liveState?.is_live ? "EN VIVO" : "FUERA DE AIRE"}
          </span>
        </div>
        {currentAthlete && (
          <div className="text-white text-sm">
            <div className="font-bold">
              {currentAthlete.apellido.toUpperCase()}, {currentAthlete.nombre}
            </div>
            <div className="text-zinc-400 mt-0.5">
              {liveState?.current_movement
                ? MOVEMENT_LABELS[liveState.current_movement]
                : "—"}{" "}
              #{liveState?.current_attempt ?? "—"} —{" "}
              <span className="font-mono font-bold text-white">
                {liveState?.current_weight ?? 0}kg
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card: Controles */}
      <div className="bg-[#252530] border border-zinc-700/50 rounded-xl p-4 space-y-4 flex-1 overflow-y-auto shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
        {/* Selector de atleta con filtros */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Atleta
          </label>

          {/* Filtros unificados */}
          <div className="flex gap-2 mb-2">
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="flex-1 bg-zinc-900 border-2 border-zinc-700 text-zinc-400 text-xs px-2 py-1.5 rounded-xl hover:border-zinc-500 focus:outline-none focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] transition-all duration-200"
            >
              <option value="">Todas las cat.</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={filterPeso}
              onChange={(e) => setFilterPeso(e.target.value)}
              className="flex-1 bg-zinc-900 border-2 border-zinc-700 text-zinc-400 text-xs px-2 py-1.5 rounded-xl hover:border-zinc-500 focus:outline-none focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] transition-all duration-200"
            >
              <option value="">Todos los pesos</option>
              {ALL_PESO_OPTIONS.map((p) => (
                <option key={p.label} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown de atletas filtrados */}
          <select
            value={liveState?.athlete_id ?? ""}
            onChange={(e) => handleSelectAthlete(e.target.value)}
            className="w-full bg-zinc-900 text-white text-sm px-3 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none transition-all duration-200"
          >
            <option value="">— Seleccionar —</option>
            {filteredAthletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.apellido.toUpperCase()}, {a.nombre} ({a.genero} —{" "}
                {a.categoria || "—"})
              </option>
            ))}
          </select>
        </div>

        {/* Selector de movimiento */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
            Movimiento
          </label>
          <div className="flex gap-1.5">
            {MOVEMENTS.map((m) => (
              <button
                key={m}
                onClick={() => updateState({ current_movement: m })}
                className={`btn flex-1 text-xs font-bold py-2.5 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 border-none ${
                  liveState?.current_movement === m
                    ? "bg-[#c41e3a] text-white shadow-[0_3px_10px_rgba(196,30,58,0.4)]"
                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de intento */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1.5">
            Intento
          </label>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => updateState({ current_attempt: n })}
                className={`btn flex-1 text-sm font-bold py-2.5 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 border-none ${
                  liveState?.current_attempt === n
                    ? "bg-[#c41e3a] text-white shadow-[0_3px_10px_rgba(196,30,58,0.4)]"
                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                }`}
              >
                #{n}
              </button>
            ))}
          </div>
        </div>

        {/* Peso en barra — EDITABLE */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-2">
            Peso en Barra (kg)
          </label>
          <input
            type="number"
            step="2.5"
            min="0"
            value={liveState?.current_weight ?? ""}
            onChange={(e) => handleWeightChange(e.target.value)}
            onBlur={handleWeightBlur}
            className="text-center text-6xl w-full bg-[#1a1a1d] text-[#c41e3a] font-mono font-black px-6 py-5 rounded-2xl border-2 border-[#c41e3a]/40 hover:border-[#c41e3a]/70 focus:border-[#c41e3a] focus:shadow-[0_0_0_4px_rgba(196,30,58,0.2),0_0_20px_rgba(196,30,58,0.15)] focus:outline-none transition-all duration-200"
            placeholder="0"
          />
        </div>

        {/* Botones de acción */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleGoLive}
            disabled={liveState?.is_live === true}
            className="btn w-full bg-emerald-700 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-4 rounded-full text-base shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_6px_rgba(16,185,129,0.2)] transition-all duration-200 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-2 border-none"
          >
            <Play className="w-4 h-4" />
            GO LIVE
          </button>

          {liveState?.is_live && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleMarkResult("GOOD")}
                className="btn bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 rounded-full shadow-[0_3px_8px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_1px_4px_rgba(16,185,129,0.2)] transition-all duration-200 flex items-center justify-center gap-2 border-none"
              >
                <Check className="w-4 h-4" />
                VÁLIDO
              </button>
              <button
                onClick={() => handleMarkResult("BAD")}
                className="btn bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-full shadow-[0_3px_8px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_16px_rgba(220,38,38,0.4)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_1px_4px_rgba(220,38,38,0.2)] transition-all duration-200 flex items-center justify-center gap-2 border-none"
              >
                <X className="w-4 h-4" />
                NULO
              </button>
            </div>
          )}

          <button
            onClick={handleEndLift}
            disabled={liveState?.is_live === false}
            className="btn w-full bg-yellow-700 hover:bg-yellow-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-all duration-200 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-2 border-none"
          >
            <Square className="w-4 h-4" />
            END LIFT
          </button>

          <button
            onClick={handleNextAttempt}
            className="btn w-full bg-zinc-700/50 hover:bg-zinc-600 text-zinc-300 hover:text-white font-semibold py-3 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 text-sm flex items-center justify-center gap-2 border-none"
          >
            <SkipForward className="w-4 h-4" />
            SIGUIENTE INTENTO
          </button>
        </div>
      </div>
    </div>
  );
}
