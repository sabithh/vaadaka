'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
};

export default function AdminUsersPage() {
    const { accessToken } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken) loadUsers();
    }, [accessToken]);

    const loadUsers = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                cell: info => <span className="text-xs text-gray-500 font-mono">{String(info.getValue()).substring(0,8)}...</span>,
            },
            {
                accessorFn: row => `${row.first_name} ${row.last_name}`,
                id: 'name',
                header: 'Full Name',
                cell: info => <span className="font-medium text-white">{info.getValue() as string}</span>,
            },
            {
                accessorKey: 'email',
                header: 'Email',
            },
            {
                accessorKey: 'is_staff',
                header: 'Role',
                cell: info => {
                    const isStaff = info.getValue() as boolean;
                    return isStaff ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded w-fit">
                            <ShieldAlert size={12} /> Admin
                        </span>
                    ) : (
                        <span className="text-xs font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded w-fit">
                            Customer
                        </span>
                    );
                },
            },
            {
                accessorKey: 'is_active',
                header: 'Status',
                cell: info => {
                    const isActive = info.getValue() as boolean;
                    return isActive ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                            <CheckCircle2 size={14} /> Active
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-400">
                            <XCircle size={14} /> Banned
                        </span>
                    );
                },
            },
            {
                accessorKey: 'date_joined',
                header: 'Joined',
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
                <h2 className="text-3xl font-bold mb-2 text-white">User Management</h2>
                <p className="text-gray-400">View and manage all registered accounts on the platform.</p>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center border border-neutral-800 rounded-xl bg-neutral-900">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <DataTable columns={columns} data={users} searchKey="name" />
            )}
        </div>
    );
}
