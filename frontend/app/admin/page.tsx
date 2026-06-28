'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Wrench, Calendar, IndianRupee, Activity, Box } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import AdminChart from '@/components/admin/AdminChart';

export default function AdminDashboard() {
    const { accessToken } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accessToken) {
            loadStats();
        }
    }, [accessToken]);

    const loadStats = async () => {
        try {
            const data = await api.getAdminStats(accessToken!);
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    // Mock data for charts until we build the real backend endpoints for it
    const revenueData = [
        { name: 'Jan', value: 1200 },
        { name: 'Feb', value: 2100 },
        { name: 'Mar', value: 800 },
        { name: 'Apr', value: 1600 },
        { name: 'May', value: 2400 },
        { name: 'Jun', value: 3200 },
        { name: 'Jul', value: stats?.total_revenue || 3500 },
    ];

    const bookingsData = [
        { name: 'Mon', value: 12 },
        { name: 'Tue', value: 19 },
        { name: 'Wed', value: 15 },
        { name: 'Thu', value: 22 },
        { name: 'Fri', value: 28 },
        { name: 'Sat', value: 35 },
        { name: 'Sun', value: stats?.total_bookings || 40 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold mb-2 text-white">Command Center</h2>
                <p className="text-gray-400">System overview and performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    title="Platform Users" 
                    value={stats?.total_users || 0} 
                    icon={Users} 
                    color="blue" 
                    trend={`+${stats?.recent_activity?.new_users || 0} recent`} 
                />
                <StatCard 
                    title="Active Listings" 
                    value={stats?.total_vaadakas || 0} 
                    icon={Box} 
                    color="purple" 
                    trend="Ready to rent" 
                    trendUp={false}
                />
                <StatCard 
                    title="Total Bookings" 
                    value={stats?.total_bookings || 0} 
                    icon={Calendar} 
                    color="green" 
                    trend={`+${stats?.recent_activity?.new_bookings || 0} recent`} 
                />
                <StatCard 
                    title="Gross Revenue (2% Comm)" 
                    value={`₹${stats?.total_revenue || 0}`} 
                    icon={IndianRupee} 
                    color="yellow" 
                    trend="Lifetime" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdminChart 
                    title="Revenue Trend (Last 7 Months)" 
                    data={revenueData} 
                    type="area" 
                    color="#eab308" // yellow-500
                />
                <AdminChart 
                    title="Booking Volume (Last 7 Days)" 
                    data={bookingsData} 
                    type="line" 
                    color="#3b82f6" // blue-500
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Recent Security Logs</h3>
                        <button className="text-blue-400 text-sm hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[1,2,3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-neutral-800/50 rounded-lg transition-colors">
                                <div className="p-2 bg-neutral-800 rounded text-gray-400">
                                    <Activity size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-200">Admin login successful</p>
                                    <p className="text-xs text-gray-500">IP: 192.168.1.{i}4 • 2 mins ago</p>
                                </div>
                                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">Success</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
