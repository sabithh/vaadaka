'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Box, CheckCircle2, XCircle } from 'lucide-react';

type Listing = {
  id: string;
  name: string;
  price_per_day: number;
  is_available: boolean;
  category: { name: string };
  shop: { name: string };
  created_at: string;
};

export default function AdminListingsPage() {
    const { accessToken } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken) loadListings();
    }, [accessToken]);

    const loadListings = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vaadakas/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await response.json();
            setListings(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to load listings', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo<ColumnDef<Listing>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                cell: info => <span className="text-xs text-gray-500 font-mono">{String(info.getValue()).substring(0,8)}...</span>,
            },
            {
                accessorKey: 'name',
                header: 'Item Name',
                cell: info => (
                    <div className="flex items-center gap-2">
                        <Box size={14} className="text-red-500" />
                        <span className="font-medium text-white">{info.getValue() as string}</span>
                    </div>
                ),
            },
            {
                accessorFn: row => row.category?.name || 'N/A',
                id: 'category',
                header: 'Category',
                cell: info => <span className="text-sm text-gray-400">{info.getValue() as string}</span>,
            },
            {
                accessorFn: row => row.shop?.name || 'N/A',
                id: 'shop',
                header: 'Shop',
            },
            {
                accessorKey: 'price_per_day',
                header: 'Price/Day',
                cell: info => <span className="font-medium text-white">₹{info.getValue() as number}</span>,
            },
            {
                accessorKey: 'is_available',
                header: 'Status',
                cell: info => {
                    const isAvailable = info.getValue() as boolean;
                    return isAvailable ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                            <CheckCircle2 size={14} /> Available
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-400">
                            <XCircle size={14} /> Rented / Hidden
                        </span>
                    );
                },
            },
            {
                accessorKey: 'created_at',
                header: 'Listed On',
                cell: info => {
                    const dateStr = info.getValue() as string;
                    if (!dateStr) return 'N/A';
                    const date = new Date(dateStr);
                    return <span className="text-xs text-gray-400">{date.toLocaleDateString()}</span>;
                },
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
                <h2 className="text-3xl font-bold mb-2 text-white">Listings Management</h2>
                <p className="text-gray-400">View and manage all active and inactive items listed for rent.</p>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center border border-neutral-800 rounded-xl bg-neutral-900">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <DataTable columns={columns} data={listings} searchKey="name" />
            )}
        </div>
    );
}
