"use client";

import { useEffect, useState, useCallback } from "react";
import { UserPlus, Trash2, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert, Enums } from "@/types/supabase";

type Athlete = Tables<"athletes">;
type Genero = Enums<"genero_type">;

interface AthleteListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// IPF Weight Categories
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

export default function AthleteList({ selectedId, onSelect }: AthleteListProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Filtros
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterPeso, setFilterPeso] = useState("");

  // Form state
  const [form, setForm] = useState<TablesInsert<"athletes">>({
    nombre: "",
    apellido: "",
    club: "",
    categoria: "",
    cat_peso: 0,
    genero: "M",
    altura_rack_sq: "",
    altura_rack_bp: "",
  });

  // Openers (1ros intentos)
  const [openers, setOpeners] = useState<{ sq: number; bp: number; dl: number }>({
    sq: 0,
    bp: 0,
    dl: 0,
  });

  const fetchAthletes = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;

    const { data, error } = await supabase
      .from("athletes")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching athletes:", error);
      return;
    }
    setAthletes(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAthletes();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        fetchAthletes();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAthletes]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("athletes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "athletes" },
        () => {
          fetchAthletes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAthletes]);

  const resetForm = () => {
    setForm({
      nombre: "",
      apellido: "",
      club: "",
      categoria: "",
      cat_peso: 0,
      genero: "M",
      altura_rack_sq: "",
      altura_rack_bp: "",
    });
    setOpeners({ sq: 0, bp: 0, dl: 0 });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido) return;

    // Crear atleta
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .insert(form)
      .select()
      .single();

    if (athleteError || !athlete) {
      alert("Error al crear atleta: " + athleteError?.message);
      return;
    }

    // Crear 9 intentos: 1ros con openers, 2dos y 3ros vacíos
    const attempts: TablesInsert<"attempts">[] = [];
    const movements = ["SQ", "BP", "DL"] as const;
    const openerValues = [openers.sq, openers.bp, openers.dl];

    for (let mi = 0; mi < movements.length; mi++) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        attempts.push({
          athlete_id: athlete.id,
          movement: movements[mi],
          attempt_number: attempt,
          weight: attempt === 1 ? openerValues[mi] : 0,
          status: "PENDING",
        });
      }
    }

    const { error: attemptsError } = await supabase
      .from("attempts")
      .insert(attempts);

    if (attemptsError) {
      alert("Error al crear intentos: " + attemptsError.message);
      return;
    }

    resetForm();
    setShowForm(false);
    onSelect(athlete.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este atleta y todos sus intentos?")) return;
    const { error } = await supabase.from("athletes").delete().eq("id", id);
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    if (selectedId === id) {
      onSelect("");
    }
  };

  // Obtener opciones de peso según género
  const pesoOptions =
    form.genero === "F" ? PESOS_FEMENINO : PESOS_MASCULINO;

  // Convertir string de peso (ej "-83kg") a número
  const parsePeso = (pesoStr: string): number => {
    return parseFloat(pesoStr.replace(/[^0-9.]/g, "")) || 0;
  };

  // Filtrar atletas
  const filteredAthletes = athletes.filter((a) => {
    if (filterCategoria && a.categoria !== filterCategoria) return false;
    if (filterPeso) {
      const pesoStr = `${a.cat_peso <= 0 ? "" : a.cat_peso}`;
      if (!pesoStr.includes(filterPeso.replace(/[^0-9]/g, ""))) return false;
    }
    return true;
  });

  // Obtener opciones de peso para el filtro (ambos géneros)
  const allPesoOptions = [...PESOS_FEMENINO, ...PESOS_MASCULINO]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort();

  if (loading) {
    return <div className="p-4 text-zinc-400">Cargando atletas...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Atletas</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
          className="btn btn-sm bg-[#c41e3a] hover:bg-[#d4223f] text-white px-5 py-2 rounded-full font-bold inline-flex items-center gap-2 shadow-[0_3px_8px_rgba(196,30,58,0.35)] hover:shadow-[0_6px_16px_rgba(196,30,58,0.45)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_1px_4px_rgba(196,30,58,0.3)] transition-all duration-200 tracking-wide border-none"
        >
          <UserPlus size={14} />
          {showForm ? "Cancelar" : "Nuevo"}
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-[#252530] border border-zinc-700/50 rounded-xl p-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 flex items-center gap-1.5 flex-wrap">
            <SlidersHorizontal size={13} className="text-zinc-500 shrink-0" />
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="flex-1 bg-zinc-900 text-zinc-400 text-xs px-2 py-1.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:outline-none focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] transition-all duration-200"
            >
              <option value="">Todas las cat.</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <select
            value={filterPeso}
            onChange={(e) => setFilterPeso(e.target.value)}
            className="flex-1 bg-zinc-900 text-zinc-400 text-xs px-2 py-1.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:outline-none focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] transition-all duration-200"
          >
            <option value="">Todos los pesos</option>
            {allPesoOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de atletas */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {filteredAthletes.length === 0 && (
          <p className="text-zinc-500 text-sm px-1">
            {athletes.length === 0
              ? "No hay atletas registrados."
              : "Ningún atleta coincide con los filtros."}
          </p>
        )}
        {filteredAthletes.map((a) => (
          <div
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`rounded-xl cursor-pointer flex justify-between items-center p-4 transition-all duration-200 ${
              selectedId === a.id
                ? "bg-red-900/30 border border-[#c41e3a]/40 shadow-lg shadow-red-900/20"
                : "bg-[#1e1e24] border border-zinc-700/30 hover:border-zinc-600/60 athlete-item"
            }`}
          >
            <div>
              <div className="font-semibold text-white text-sm">
                {a.apellido.toUpperCase()}, {a.nombre}
              </div>
              <div className="text-xs text-zinc-400 flex gap-2 mt-0.5">
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    a.genero === "F"
                      ? "bg-pink-900/40 text-pink-400"
                      : "bg-blue-900/40 text-blue-400"
                  }`}
                >
                  {a.genero === "F" ? "F" : "M"}
                </span>
                <span>{a.categoria || "—"}</span>
                <span>{a.cat_peso > 0 ? `${a.cat_peso}kg` : "—"}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(a.id);
              }}
              className="btn btn-ghost btn-sm text-zinc-600 hover:text-red-500 hover:bg-red-500/10 active:scale-90 transition-all p-1.5 rounded-full border-none"
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Formulario agregar atleta */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-[#252530] border border-zinc-700/50 rounded-2xl p-5 mt-2 space-y-3 shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
        >
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Nuevo Atleta
          </h3>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full bg-zinc-900 text-white text-sm px-3 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                Apellido
              </label>
              <input
                type="text"
                placeholder="Apellido"
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                className="w-full bg-zinc-900 text-white text-sm px-3 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Club */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
              Club / Equipo
            </label>
            <input
              type="text"
              placeholder="Club / Equipo"
              value={form.club}
              onChange={(e) => setForm({ ...form, club: e.target.value })}
              className="w-full bg-zinc-900 text-white text-sm px-3 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Género */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
              Género
            </label>
            <div className="flex gap-2">
              {(["M", "F"] as Genero[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() =>
                    setForm({ ...form, genero: g, cat_peso: 0 })
                  }
                  className={`btn flex-1 text-sm font-bold py-2.5 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 border-none ${
                    form.genero === g
                      ? g === "M"
                        ? "bg-blue-800 text-white shadow-[0_3px_10px_rgba(30,64,175,0.4)]"
                        : "bg-pink-800 text-white shadow-[0_3px_10px_rgba(190,24,93,0.4)]"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {g === "M" ? "Masculino" : "Femenino"}
                </button>
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
              Categoría
            </label>
            <div className="grid grid-cols-4 gap-1">
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, categoria: c })}
                  className={`btn text-xs font-semibold py-2 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 border-none ${
                    form.categoria === c
                      ? "bg-[#c41e3a] text-white shadow-[0_3px_10px_rgba(196,30,58,0.4)]"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {c.replace("Sub-Junior", "Sub-Jr")}
                </button>
              ))}
            </div>
          </div>

          {/* Peso Corporal (IPF) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
              Categoría de Peso ({form.genero === "F" ? "Femenino" : "Masculino"} — IPF)
            </label>
            <select
              value={
                (form.cat_peso ?? 0) > 0
                  ? pesoOptions.find(
                      (p) => parsePeso(p) === (form.cat_peso ?? 0)
                    ) ?? ""
                  : ""
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  cat_peso: parsePeso(e.target.value),
                })
              }
              className="w-full bg-zinc-900 text-white text-sm px-3 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none transition-all duration-200"
            >
              <option value="">— Seleccionar —</option>
              {pesoOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Alturas de Rack */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                Rack Sentadilla
              </label>
              <input
                type="text"
                placeholder="Ej: 14"
                value={form.altura_rack_sq}
                onChange={(e) =>
                  setForm({ ...form, altura_rack_sq: e.target.value })
                }
                className="w-full bg-zinc-900 text-white text-sm px-3 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                Rack Banco
              </label>
              <input
                type="text"
                placeholder="Ej: 5"
                value={form.altura_rack_bp}
                onChange={(e) =>
                  setForm({ ...form, altura_rack_bp: e.target.value })
                }
                className="w-full bg-zinc-900 text-white text-sm px-3 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Openers (1ros Intentos) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
              Openers (1ros Intentos) — kg
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5">SQ</span>
                <input
                  type="number"
                  step="2.5"
                  min="0"
                  value={openers.sq || ""}
                  onChange={(e) =>
                    setOpeners({
                      ...openers,
                      sq: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-zinc-900 text-white text-sm px-2 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none text-right font-mono transition-all duration-200"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5">BP</span>
                <input
                  type="number"
                  step="2.5"
                  min="0"
                  value={openers.bp || ""}
                  onChange={(e) =>
                    setOpeners({
                      ...openers,
                      bp: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-zinc-900 text-white text-sm px-2 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none text-right font-mono transition-all duration-200"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5">DL</span>
                <input
                  type="number"
                  step="2.5"
                  min="0"
                  value={openers.dl || ""}
                  onChange={(e) =>
                    setOpeners({
                      ...openers,
                      dl: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-zinc-900 text-white text-sm px-2 py-2.5 rounded-xl border-2 border-zinc-700 hover:border-zinc-500 focus:border-[#c41e3a] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.15)] focus:outline-none text-right font-mono transition-all duration-200"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn bg-[#c41e3a] hover:bg-[#b01830] text-white text-sm font-bold py-2.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 tracking-wide w-full border-none"
          >
            Crear Atleta
          </button>
        </form>
      )}
    </div>
  );
}
