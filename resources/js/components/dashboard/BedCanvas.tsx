import { DndContext, DragEndEvent, PointerSensor, useDraggable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Maximize2, Minimize2, BedDouble, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Bed, Patient, Ward, Document } from '../../types';
import { bedStatusMeta, patientStatusMeta } from '../../lib/status';
import BedDetailModal from './BedDetailModal';

type BedPosition = { pos_x: number; pos_y: number };

interface Props {
    beds: Bed[];
    patients: Patient[];
    wards: Ward[];
    documents: Document[];
}

const CARD_WIDTH = 224;
const CARD_HEIGHT = 174;
const GAP = 18;
const PADDING = 16;

function getCsrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export default function BedCanvas({ beds, patients, wards, documents }: Props) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const [overrides, setOverrides] = useState<Record<number, BedPosition>>({});
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
    const [statusFilter, setStatusFilter] = useState<Bed['status'] | 'all'>('all');
    const [floorFilter, setFloorFilter] = useState<string>('all');
    const [expanded, setExpanded] = useState(false);

    const patientById = useMemo(
        () => Object.fromEntries(patients.map((patient) => [patient.id, patient])),
        [patients],
    );
    const wardById = useMemo(
        () => Object.fromEntries(wards.map((ward) => [ward.id, ward])),
        [wards],
    );

    const floorOptions = useMemo(() => {
        const unique = new Set<string>();
        wards.forEach((ward) => unique.add(ward.floor?.trim() || 'Unassigned'));
        return Array.from(unique).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }, [wards]);

    const filteredBeds = useMemo(() => {
        return beds.filter((bed) => {
            const statusMatch = statusFilter === 'all' || bed.status === statusFilter;
            const wardFloor = wardById[bed.ward_id]?.floor?.trim() || 'Unassigned';
            const floorMatch = floorFilter === 'all' || wardFloor === floorFilter;
            return statusMatch && floorMatch;
        });
    }, [beds, statusFilter, floorFilter, wardById]);

    const getBounds = useCallback(() => {
        const width = canvasRef.current?.clientWidth ?? 980;
        const height = canvasRef.current?.clientHeight ?? 620;
        return {
            maxX: Math.max(PADDING, width - CARD_WIDTH - PADDING),
            maxY: Math.max(PADDING, height - CARD_HEIGHT - PADDING),
        };
    }, []);

    const positions = useMemo(() => {
        const bounds = getBounds();
        const map: Record<number, BedPosition> = {};
        for (const bed of beds) {
            const raw = overrides[bed.id] ?? { pos_x: bed.pos_x || PADDING, pos_y: bed.pos_y || PADDING };
            map[bed.id] = {
                pos_x: clamp(raw.pos_x, PADDING, bounds.maxX),
                pos_y: clamp(raw.pos_y, PADDING, bounds.maxY),
            };
        }
        return map;
    }, [beds, overrides, getBounds]);

    const fitBedsInCanvas = useCallback(() => {
        if (!canvasRef.current) return;
        const width = canvasRef.current.clientWidth;
        const maxCols = Math.max(1, Math.floor((width - PADDING * 2 + GAP) / (CARD_WIDTH + GAP)));
        const next: Record<number, BedPosition> = {};
        filteredBeds.forEach((bed, index) => {
            next[bed.id] = {
                pos_x: PADDING + (index % maxCols) * (CARD_WIDTH + GAP),
                pos_y: PADDING + Math.floor(index / maxCols) * (CARD_HEIGHT + GAP),
            };
        });
        setOverrides((current) => ({ ...current, ...next }));
    }, [filteredBeds]);

    useEffect(() => {
        fitBedsInCanvas();
    }, [fitBedsInCanvas, floorFilter, statusFilter]);

    useEffect(() => {
        const onResize = () => fitBedsInCanvas();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [fitBedsInCanvas]);

    useEffect(() => {
        const original = document.body.style.overflow;
        if (expanded) document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = original;
        };
    }, [expanded]);

    const handleDragEnd = (event: DragEndEvent) => {
        const id = Number(event.active.id);
        const previous = positions[id];
        if (!previous) return;

        const bounds = getBounds();
        const next = {
            pos_x: clamp(previous.pos_x + event.delta.x, PADDING, bounds.maxX),
            pos_y: clamp(previous.pos_y + event.delta.y, PADDING, bounds.maxY),
        };

        setOverrides((current) => ({ ...current, [id]: next }));

        fetch(`/api/beds/${id}/position`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            body: JSON.stringify(next),
        }).catch(() => toast.error('Could not persist bed position.'));
    };

    return (
        <>
            {expanded && <div className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-sm" />}
            <section className={`card p-4 ${expanded ? 'fixed inset-4 z-50 lg:inset-8' : ''}`}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="pulse-dot" aria-hidden />
                            <h3 className="text-lg font-bold">Bed Layout</h3>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>Single-box floor map with live refresh</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={fitBedsInCanvas} className="btn-secondary !px-3 !py-1.5 !text-xs">
                            Auto-fit
                        </button>
                        <button
                            type="button"
                            onClick={() => setExpanded((value) => !value)}
                            className="btn-secondary !px-3 !py-1.5 !text-xs"
                        >
                            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                            <span className="ml-1">{expanded ? 'Collapse' : 'Expand'}</span>
                        </button>
                    </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setFloorFilter('all')}
                        className={floorFilter === 'all' ? 'btn-primary !px-3 !py-1.5 !text-xs' : 'btn-secondary !px-3 !py-1.5 !text-xs'}
                    >
                        All floors
                    </button>
                    {floorOptions.map((floor) => (
                        <button
                            key={floor}
                            type="button"
                            onClick={() => setFloorFilter(floor)}
                            className={floorFilter === floor ? 'btn-primary !px-3 !py-1.5 !text-xs' : 'btn-secondary !px-3 !py-1.5 !text-xs'}
                        >
                            Floor {floor}
                        </button>
                    ))}
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                    {(['all', 'available', 'occupied', 'cleaning', 'maintenance'] as const).map((status) => {
                        const isActive = statusFilter === status;
                        const label = status === 'all' ? 'All status' : bedStatusMeta[status].label;
                        return (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setStatusFilter(status)}
                                className={isActive ? 'btn-primary !px-3 !py-1.5 !text-xs' : 'btn-secondary !px-3 !py-1.5 !text-xs'}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div
                ref={canvasRef}
                className={`bed-canvas ${expanded ? 'h-[calc(100vh-260px)]' : 'h-[620px]'}`}
            >
                {filteredBeds.map((bed) => (
                    <DraggableBed
                        key={bed.id}
                                bed={bed}
                                ward={wardById[bed.ward_id]}
                                position={positions[bed.id]}
                                patient={bed.patient_id ? patientById[bed.patient_id] : undefined}
                                onSelect={setSelectedBed}
                            />
                        ))}
                    </div>
                </DndContext>
            </section>

            <BedDetailModal
                bed={selectedBed}
                ward={selectedBed ? wardById[selectedBed.ward_id] : undefined}
                patient={selectedBed?.patient_id ? patientById[selectedBed.patient_id] : undefined}
                wards={wards}
                documents={selectedBed ? documents.filter((doc) => doc.bed_id === selectedBed.id) : []}
                onClose={() => setSelectedBed(null)}
            />
        </>
    );
}

function DraggableBed({
    bed,
    ward,
    position,
    patient,
    onSelect,
}: {
    bed: Bed;
    ward?: Ward;
    position: BedPosition;
    patient?: Patient;
    onSelect: (bed: Bed) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: bed.id });
    const status = bedStatusMeta[bed.status];
    const patientStatus = patient ? patientStatusMeta[patient.status] : null;
    const floorLabel = ward?.floor?.trim() || 'Unassigned';
    const nodeRef = useRef<HTMLButtonElement | null>(null);

    const setRefs = (el: HTMLButtonElement | null) => {
        setNodeRef(el);
        nodeRef.current = el;
    };

    return (
        <button
            ref={setRefs}
            type="button"
            style={{
                left: position?.pos_x ?? PADDING,
                top: position?.pos_y ?? PADDING,
                transform: transform ? CSS.Translate.toString(transform) : undefined,
            }}
            className={`absolute w-56 bed-card status-border-${bed.status} ${isDragging ? 'z-20 opacity-90' : 'z-10'}`}
            {...listeners}
            {...attributes}
            onClick={() => onSelect(bed)}
            onDoubleClick={() => nodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span
                        className="rounded-lg p-1.5"
                        style={{ background: 'color-mix(in srgb, var(--status-occupied-bg) 70%, transparent)', color: 'var(--status-occupied-fg)' }}
                    >
                        <BedDouble className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="text-sm font-bold text-[color:var(--text-strong)]">Bed {bed.bed_number}</p>
                        <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                            Floor {floorLabel} · Room {bed.room}
                        </p>
                    </div>
                </div>
                <span className={`badge border-transparent ${status.bg} ${status.color}`}>{status.label}</span>
            </div>

            {patient ? (
                <div className="mt-3 rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-2">
                    <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
                        <User className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                        {patient.name}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-subtle)' }}>{patient.diagnosis}</p>
                    {patientStatus && (
                        <span className={`badge mt-2 border-transparent ${patientStatus.bg} ${patientStatus.color}`}>
                            {patientStatus.label}
                        </span>
                    )}
                </div>
            ) : (
                <p className="mt-3 text-xs" style={{ color: 'var(--text-subtle)' }}>No patient assigned</p>
            )}
        </button>
    );
}
