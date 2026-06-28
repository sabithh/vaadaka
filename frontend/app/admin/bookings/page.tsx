'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, CalendarClock, Clock, CheckCircle, XCircle } from 'lucide-react';

type Booking = {
  id: string;
  vaadaka: { name: string };
  user: { first_name: string; last_name: string };
  start_datetime: string;
  end_datetime: string;
  status: string;
  total_price: string;
};

export default function AdminBookingsPage() {
    const { accessToken } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken) loadBookings();
    }, [accessToken]);

    const loadBookings = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/bookings/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await response.json();
            setBookings(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to load bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo<ColumnDef<Booking>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'Booking ID',
                cell: info => <span className="text-xs text-gray-500 font-mono">{String(info.getValue()).substring(0,8)}...</span>,
            },
            {
                accessorKey: 'vaadaka.name',
                header: 'Item / Property',
                cell: info => <span className="font-medium text-white">{info.getValue() as string}</span>,
            },
            {
                accessorFn: row => row.user ? `${row.user.first_name} ${row.user.last_name}` : 'Unknown',
                id: 'customer',
                header: 'Customer',
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: info => {
                    const status = info.getValue() as string;
                    if (status === 'pending') return <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">Pending</span>;
                    if (status === 'confirmed') return <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">Confirmed</span>;
                    if (status === 'completed') return <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">Completed</span>;
                    if (status === 'cancelled') return <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded">Cancelled</span>;
                    return <span className="text-xs font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded">{status}</span>;
                },
            },
            {
                accessorKey: 'total_price',
                header: 'Total Value',
                cell: info => <span className="font-mono text-green-400">₹{info.getValue() as string}</span>,
            },
            {
                accessorFn: row => `${new Date(row.start_datetime).toLocaleDateString()} - ${new Date(row.end_datetime).toLocaleDateString()}`,
                id: 'dates',
                header: 'Rental Period',
                cell: info => <span className="text-xs text-gray-400 flex items-center gap-1"><CalendarClock size={12}/> {info.getValue() as string}</span>,
            },
            {
                id: 'actions',
                cell: () => (
                    <button className="p-2 hover:bg-neutral-800 rounded transition-colors text-gray-400 hover:text-white">
                        <MoreHorizontal size={16} />
                    </button>
                ),
            },
        ],
        []
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold mb-2 text-white">Platform Bookings</h2>
                <p className="text-gray-400">Monitor all rental transactions across the platform.</p>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center border border-neutral-800 rounded-xl bg-neutral-900">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <DataTable columns={columns} data={bookings} searchKey="vaadaka_name" />
            )}
        </div>
    );
}
