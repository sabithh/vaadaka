'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Banknote, Briefcase } from 'lucide-react';

type ProviderFinance = {
  id: string;
  name: string;
  email: string;
  total_shops: number;
  total_bookings_handled: number;
  provider_revenue: number;
  platform_fees_paid: number;
  unpaid_dues: number;
};

export default function AdminProvidersFinancePage() {
    const { accessToken } = useAuth();
    const [providers, setProviders] = useState<ProviderFinance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken) loadProviders();
    }, [accessToken]);

    const loadProviders = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/providers-finance/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await response.json();
            setProviders(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to load providers', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo<ColumnDef<ProviderFinance>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Provider',
                cell: info => (
                    <div className="flex flex-col">
                        <span className="font-medium text-white">{info.getValue() as string}</span>
                        <span className="text-xs text-gray-500">{info.row.original.email}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'total_shops',
                header: 'Shops Owned',
                cell: info => (
                    <div className="flex items-center gap-1 text-sm text-gray-300">
                        <Briefcase size={14} className="text-gray-500" />
                        {info.getValue() as number}
                    </div>
                ),
            },
            {
                accessorKey: 'total_bookings_handled',
                header: 'Bookings Handled',
                cell: info => <span className="font-medium text-gray-300">{info.getValue() as number}</span>,
            },
            {
                accessorKey: 'provider_revenue',
                header: 'Provider Revenue',
                cell: info => (
                    <div className="flex items-center gap-1 font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded w-fit border border-green-500/20">
                        <Banknote size={14} />
                        ₹{Number(info.getValue()).toLocaleString('en-IN')}
                    </div>
                ),
            },
            {
                accessorKey: 'platform_fees_paid',
                header: 'Platform Fees Collected',
                cell: info => (
                    <div className="flex items-center gap-1 font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded w-fit border border-red-500/20">
                        <Banknote size={14} />
                        ₹{Number(info.getValue()).toLocaleString('en-IN')}
                    </div>
                ),
            },
            {
                accessorKey: 'unpaid_dues',
                header: 'Unpaid Dues',
                cell: info => (
                    <div className={`flex items-center gap-1 font-medium px-2 py-1 rounded w-fit border ${
                        (info.getValue() as number) > 0 
                            ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' 
                            : 'text-gray-400 bg-gray-800 border-gray-700'
                    }`}>
                        <Banknote size={14} />
                        ₹{Number(info.getValue()).toLocaleString('en-IN')}
                    </div>
                ),
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

    // Calculate aggregations for top cards
    const totalProviderRevenue = providers.reduce((sum, p) => sum + p.provider_revenue, 0);
    const totalPlatformFees = providers.reduce((sum, p) => sum + p.platform_fees_paid, 0);
    const totalUnpaidDues = providers.reduce((sum, p) => sum + p.unpaid_dues, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold mb-2 text-white">Provider Monetization</h2>
                <p className="text-gray-400">Track how much providers are earning, how much they have paid, and their pending dues (3% commission).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Total Provider Earnings (GMV)</h3>
                    <p className="text-3xl font-bold text-green-400">₹{totalProviderRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Banknote size={64} className="text-red-500" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Total Platform Fees Collected</h3>
                    <p className="text-3xl font-bold text-red-500">₹{totalPlatformFees.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Banknote size={64} className="text-yellow-500" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Total Unpaid Dues</h3>
                    <p className="text-3xl font-bold text-yellow-500">₹{totalUnpaidDues.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center border border-neutral-800 rounded-xl bg-neutral-900">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <DataTable columns={columns} data={providers} searchKey="name" />
            )}
        </div>
    );
}
