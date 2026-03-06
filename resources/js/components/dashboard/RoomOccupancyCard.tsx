import { Link } from '@inertiajs/react';
import { Bed, Room } from '../../types';

interface Props {
    rooms: Room[];
    beds: Bed[];
}

export default function RoomOccupancyCard({ rooms, beds }: Props) {
    const roomData = rooms.slice(0, 5).map((room) => {
        const roomBeds = beds.filter((b) => b.room_id === room.id);
        const occupied = roomBeds.filter((b) => b.status === 'occupied').length;
        const total = roomBeds.length;
        const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
        return { ...room, occupied, total, pct };
    });

    return (
        <section className="card p-4">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Rooms</h3>
                    <p className="text-sm text-[var(--text-subtle)]">{rooms.length} configured rooms</p>
                </div>
                <Link href="/rooms" className="btn-link">Open</Link>
            </div>

            <ul className="space-y-3">
                {roomData.map((room) => (
                    <li key={room.id}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[var(--text-strong)]">{room.name}</span>
                            <span className="text-xs text-[var(--text-muted)]">
                                {room.occupied}/{room.total} beds
                            </span>
                        </div>
                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${room.pct}%`,
                                    background: room.pct >= 80
                                        ? 'var(--status-maintenance-fg)'
                                        : room.pct >= 50
                                            ? 'var(--status-cleaning-fg)'
                                            : 'var(--status-available-fg)',
                                }}
                            />
                        </div>
                        {room.facility && (
                            <p className="mt-0.5 text-xs text-[var(--text-subtle)]">{room.facility.name}</p>
                        )}
                    </li>
                ))}
                {roomData.length === 0 && (
                    <li className="text-sm text-[var(--text-subtle)]">No rooms configured.</li>
                )}
            </ul>
        </section>
    );
}
