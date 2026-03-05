import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppShell from '../../components/layout/AppShell';
import RoomCreateForm from '../../components/forms/RoomCreateForm';
import RoomPanel from '../../components/rooms/RoomPanel';
import { PageProps, Room } from '../../types';

interface Props extends PageProps {
    rooms: Room[];
}

export default function RoomsIndex({ rooms }: Props) {
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['rooms'] });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Rooms" />
            <AppShell title="Rooms" description="Room registry and bed management">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <RoomPanel rooms={rooms} onEdit={setEditingRoom} editingId={editingRoom?.id ?? null} />
                    </div>
                    <RoomCreateForm room={editingRoom} onDone={() => setEditingRoom(null)} />
                </div>
            </AppShell>
        </>
    );
}
