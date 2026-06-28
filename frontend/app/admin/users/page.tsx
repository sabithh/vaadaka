'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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

const UserActionsCell = ({ user, onActionSuccess }: { user: User, onActionSuccess: () => void }) => {
    const { accessToken } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const toggleActive = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user.id}/toggle_active/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            onActionSuccess();
        } catch (e) {
            console.error(e);
        }
    };

    const deleteUser = async () => {
        if (!confirm('Are you sure you want to permanently delete this user?')) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user.id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            onActionSuccess();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-neutral-800 rounded transition-colors text-gray-400 hover:text-white">
                <MoreHorizontal size={16} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-32 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 z-50 overflow-hidden">
                        <button onClick={() => { toggleActive(); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-neutral-700">
                            {user.is_active ? 'Ban User' : 'Unban User'}
                        </button>
                        {!user.is_staff && (
                            <button onClick={() => { deleteUser(); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
                                Delete
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default function AdminUsersPage() {
    const { accessToken } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken) loadUsers();
    }, [accessToken]);

    const loadUsers = useCallback(async () => {
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
    }, [accessToken]);

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
                        <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded w-fit border border-red-500/20">
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
                cell: ({ row }) => <UserActionsCell user={row.original} onActionSuccess={loadUsers} />,
            },
        ],
        [loadUsers]
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold mb-2 text-white">User Management</h2>
                <p className="text-gray-400">View and manage all registered accounts on the platform.</p>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center border border-neutral-800 rounded-xl bg-neutral-900">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <DataTable columns={columns} data={users} searchKey="name" />
            )}
        </div>
    );
}
