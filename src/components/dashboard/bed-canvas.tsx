"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Bed as BedType, Patient } from "../../types";
import { bedStatusMeta, patientStatusMeta } from "../../lib/status";
import { api, withToast } from "../../lib/client-api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  BedDouble,
  NotebookPen,
  CheckCircle,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";
import toast from "react-hot-toast";
import BedDetailModal from "./bed-detail-modal";

type Props = {
  beds: BedType[];
  patients: Patient[];
};

type BedPosition = { posX: number; posY: number };

const bedStatusPaint: Record<
  BedType["status"],
  { gradient: string; halo: string; shadow: string; dot: string; label: string }
> = {
  available: {
    gradient: "from-emerald-500 via-emerald-400 to-teal-400",
    halo: "bg-emerald-300/30",
    shadow: "0 14px 40px rgba(16,185,129,0.25)",
    dot: "bg-emerald-400",
    label: "Available",
  },
  occupied: {
    gradient: "from-blue-500 via-sky-500 to-indigo-500",
    halo: "bg-sky-300/30",
    shadow: "0 14px 40px rgba(59,130,246,0.25)",
    dot: "bg-blue-500",
    label: "Occupied",
  },
  cleaning: {
    gradient: "from-amber-400 via-orange-400 to-yellow-400",
    halo: "bg-amber-300/30",
    shadow: "0 14px 40px rgba(251,191,36,0.28)",
    dot: "bg-amber-400",
    label: "Cleaning",
  },
  maintenance: {
    gradient: "from-rose-500 via-red-500 to-orange-500",
    halo: "bg-rose-300/30",
    shadow: "0 14px 40px rgba(244,63,94,0.28)",
    dot: "bg-rose-500",
    label: "Maintenance",
  },
};

export default function BedCanvas({ beds, patients }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [overrides, setOverrides] = useState<Record<string, BedPosition>>({});
  const [selectedBed, setSelectedBed] = useState<BedType | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BedType["status"] | "all">("all");
  const [expanded, setExpanded] = useState(false);
  const [canvasHeight, setCanvasHeight] = useState(520);
  const [arrangeBy, setArrangeBy] = useState<"name" | "patient" | "status">("name");
  const [arranging, setArranging] = useState(false);
  const didDrag = useRef(false);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = expanded ? "hidden" : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [expanded]);

  useEffect(() => {
    const updateHeight = () => {
      const headerAllowance = expanded ? 180 : 320; // leave space for top bars when expanded
      const next = Math.max(520, window.innerHeight - headerAllowance);
      setCanvasHeight(next);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [expanded]);

  const arrangeBeds = async (mode: "name" | "patient" | "status") => {
    if (arranging) return;
    setArranging(true);
    try {
      const order = beds
        .slice()
        .sort((a, b) => {
          if (mode === "name") return a.bedNumber.localeCompare(b.bedNumber, undefined, { numeric: true });
          if (mode === "patient") {
            const aName = a.patientId ? patientById[a.patientId]?.name ?? "" : "";
            const bName = b.patientId ? patientById[b.patientId]?.name ?? "" : "";
            return aName.localeCompare(bName);
          }
          // status / availability
          const rank: Record<BedType["status"], number> = {
            available: 0,
            occupied: 1,
            cleaning: 2,
            maintenance: 3,
          };
          const diff = rank[a.status] - rank[b.status];
          return diff !== 0 ? diff : a.bedNumber.localeCompare(b.bedNumber, undefined, { numeric: true });
        });

      const gap = 28;
      const cardW = 240;
      const cardH = 200;
      const cols =
        typeof window !== "undefined"
          ? Math.max(2, Math.min(4, Math.floor((window.innerWidth - 160) / (cardW + gap))))
          : 3;

      const newPositions: Record<string, BedPosition> = {};
      order.forEach((bed, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        newPositions[bed.id] = {
          posX: 24 + col * (cardW + gap),
          posY: 24 + row * (cardH + gap),
        };
      });

      setOverrides((curr) => ({ ...curr, ...newPositions }));

      // Persist positions
      await withToast(
        Promise.all(
          Object.entries(newPositions).map(([id, pos]) =>
            api.moveBed(id, pos).catch((err) => {
              toast.error(err.message);
              throw err;
            })
          )
        ),
        "Beds rearranged"
      );
    } finally {
      setArranging(false);
    }
  };

  const handleBedClick = useCallback((bed: BedType) => {
    if (!didDrag.current) {
      setSelectedBed(bed);
      setFlashId(bed.id);
      setTimeout(() => setFlashId((curr) => (curr === bed.id ? null : curr)), 650);
    }
    didDrag.current = false;
  }, []);

  const positions = useMemo(() => {
    const result: Record<string, BedPosition> = {};
    beds.forEach((b) => {
      result[b.id] = overrides[b.id] ?? { posX: b.posX || 40, posY: b.posY || 40 };
    });
    return result;
  }, [beds, overrides]);

  const patientById = useMemo(
    () => Object.fromEntries(patients.map((p) => [p.id, p])),
    [patients]
  );

  const filteredBeds = useMemo(
    () => (statusFilter === "all" ? beds : beds.filter((b) => b.status === statusFilter)),
    [beds, statusFilter]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    didDrag.current = true;
    const id = event.active.id as string;
    const prev = positions[id];
    if (!prev) return;
    const next = {
      posX: Math.max(0, prev.posX + event.delta.x),
      posY: Math.max(0, prev.posY + event.delta.y),
    };
    setOverrides((curr) => ({ ...curr, [id]: next }));
    withToast(api.moveBed(id, next), "Bed position saved").catch((err) =>
      toast.error(err.message)
    );
  };

  return (
    <>
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        />
      )}
      <div
        className={`card p-4 transition-all duration-300 ${
          expanded
            ? "fixed inset-3 sm:inset-6 lg:inset-10 z-50 w-auto max-w-none h-auto shadow-2xl"
            : ""
        }`}
        style={expanded ? { maxHeight: "calc(100vh - 2rem)" } : undefined}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-sm text-slate-500">Bed Layout</p>
            <p className="font-semibold text-slate-900">Drag to reposition beds</p>
            <p className="text-xs text-slate-500">Tap a bed for details / use filters to focus</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2 text-xs">
              {["all", "available", "occupied", "cleaning", "maintenance"].map((status) => {
                const meta =
                  status === "all"
                    ? { label: "All", dot: "bg-slate-300" }
                    : bedStatusPaint[status as BedType["status"]];
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as BedType["status"] | "all")}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 border text-slate-700 shadow-soft transition ${
                      statusFilter === status
                        ? "bg-white/90 border-primary-200 shadow-[0_10px_25px_rgba(15,127,224,0.18)]"
                        : "bg-white border-slate-200 hover:border-primary-100"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={arrangeBy}
                onChange={(e) => setArrangeBy(e.target.value as typeof arrangeBy)}
                className="text-xs border border-slate-200 rounded-full px-3 py-1.5 bg-white shadow-soft outline-none hover:border-primary-200 transition"
                aria-label="Arrange beds"
              >
                <option value="name">By bed name</option>
                <option value="patient">By patient name</option>
                <option value="status">By availability</option>
              </select>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  arrangeBeds(arrangeBy);
                }}
                disabled={arranging}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-soft hover:border-primary-200 transition disabled:opacity-60"
              >
                {arranging ? (
                  <span className="h-3 w-3 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                )}
                Arrange
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-soft hover:border-primary-200 transition"
              aria-pressed={expanded}
              title={expanded ? "Collapse view" : "Expand view"}
            >
              {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {expanded ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div
            className={`relative w-full rounded-2xl bg-gradient-to-br from-white via-primary-50/40 to-teal-50 border border-slate-100 overflow-auto shadow-[0_25px_80px_rgba(15,127,224,0.08)]`}
            style={{ height: canvasHeight }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,127,224,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(17,179,163,0.12),transparent_30%)]" />
            <Grid />
            {filteredBeds.map((bed) => (
              <DraggableBed
                key={bed.id}
                bed={bed}
                position={positions[bed.id] || { posX: 30, posY: 30 }}
                patient={bed.patientId ? patientById[bed.patientId] : undefined}
                onBedClick={handleBedClick}
                isSelected={flashId === bed.id}
              />
            ))}
          </div>
        </DndContext>
        <BedDetailModal
          bed={selectedBed}
          patient={selectedBed?.patientId ? patientById[selectedBed.patientId] : undefined}
          onClose={() => setSelectedBed(null)}
        />
      </div>
    </>
  );
}

function DraggableBed({
  bed,
  position,
  patient,
  onBedClick,
  isSelected,
}: {
  bed: BedType;
  position: BedPosition;
  patient?: Patient;
  onBedClick: (bed: BedType) => void;
  isSelected: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: bed.id,
  });

  const style = {
    left: position.posX,
    top: position.posY,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
  };

  const status = bedStatusMeta[bed.status];
  const patientStatus = patient ? patientStatusMeta[patient.status] : undefined;
  const paint = bedStatusPaint[bed.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute w-56 cursor-grab active:cursor-grabbing transition ${
        isDragging ? "z-20 scale-[1.02]" : "z-10"
      }`}
      {...listeners}
      {...attributes}
      onClick={() => onBedClick(bed)}
    >
      <motion.div
        className="relative rounded-xl border border-white/50 bg-white/95 p-3 shadow-soft overflow-hidden backdrop-blur"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          scale: isSelected ? 1.03 : 1,
          boxShadow: isDragging ? "0 20px 50px rgba(0,0,0,0.18)" : paint.shadow,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${paint.gradient}`} />
        <div className={`pointer-events-none absolute -right-8 -top-10 h-20 w-20 rounded-full blur-3xl ${paint.halo}`} />
        {isSelected && (
          <span className="pointer-events-none absolute inset-0 rounded-xl border-2 border-white/70 animate-ripple" />
        )}

        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${paint.gradient} text-white grid place-items-center`}>
              <BedDouble className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Bed {bed.bedNumber}</p>
              <p className="text-[11px] text-slate-500">Ward {bed.wardId} / Room {bed.room}</p>
            </div>
          </div>
          <span className={`badge ${status.bg} ${status.color} shadow-inner border border-white/60`}>
            {status.label}
          </span>
        </div>

        {patient ? (
          <div className="mt-3 rounded-lg bg-slate-50/80 p-2.5 border border-slate-100">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <p className="text-sm font-semibold text-slate-800">{patient.name}</p>
              {patientStatus && (
                <span className={`ml-auto inline-flex badge ${patientStatus.bg} ${patientStatus.color}`}>
                  {patientStatus.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <NotebookPen className="h-3.5 w-3.5" />
              <span className="truncate">{patient.diagnosis}</span>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>Ready for assignment</span>
          </div>
        )}

        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
          <Sparkles className="h-3 w-3 text-primary-500" />
          <span>Tap for full details</span>
        </div>
      </motion.div>
    </div>
  );
}

function Grid() {
  const lines = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0">
      {lines.map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 border-l border-dashed border-slate-100/80"
          style={{ left: `${(i / lines.length) * 100}%` }}
        />
      ))}
      {lines.map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 border-t border-dashed border-slate-100/80"
          style={{ top: `${(i / lines.length) * 100}%` }}
        />
      ))}
    </div>
  );
}
