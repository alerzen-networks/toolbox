import { useEffect, useState } from 'react';
import type { Monitor } from '../types';
import { MonitorCard } from '../components/MonitorCard';
import { AddMonitorForm } from '../components/AddMonitorForm';
import { StatsOverview } from '../components/StatsOverview';

export function MonitorDashboard() {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMonitors = async () => {
        try {
            const res = await fetch('/api/status');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setMonitors(data);
        } catch (error) {
            console.error("Failed to fetch monitors", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonitors();
        const interval = setInterval(fetchMonitors, 10000); // Poll every 10 seconds for fresher data
        return () => clearInterval(interval);
    }, []);

    const handleAddMonitor = async (name: string, url: string, type: string, interval: number, checkSSL: boolean) => {
        try {
            const res = await fetch('/api/monitors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, url, type, interval, check_ssl: checkSSL }),
            });
            if (!res.ok) throw new Error('Failed to create monitor');
            await fetchMonitors();
        } catch (error) {
            console.error("Error adding monitor:", error);
            alert("Failed to add monitor");
        }
    };

    const handleDeleteMonitor = async (id: number) => {
        try {
            const res = await fetch(`/api/monitors/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete monitor');
            setMonitors(monitors.filter(m => m.id !== id));
        } catch (error) {
            console.error("Error deleting monitor:", error);
            alert("Failed to delete monitor");
        }
    };

    const handleTriggerCheck = async (id: number) => {
        try {
            const res = await fetch(`/api/monitors/${id}/check`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to trigger check');
            setTimeout(fetchMonitors, 500);
        } catch (error) {
            console.error("Error triggering check:", error);
            alert("Failed to trigger check");
        }
    };

    const handleTraceroute = async (id: number): Promise<string> => {
        const res = await fetch(`/api/monitors/${id}/traceroute`, { method: 'POST' });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data.output || 'No output';
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <StatsOverview monitors={monitors} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Active Monitors</h2>
                        <span className="text-sm text-slate-400">{monitors.length} targets configured</span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 rounded-xl bg-slate-800/50 border border-slate-700/50"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {monitors.map(m => (
                                <MonitorCard
                                    key={m.id}
                                    monitor={m}
                                    onDelete={handleDeleteMonitor}
                                    onCheck={handleTriggerCheck}
                                    onTrace={handleTraceroute}
                                />
                            ))}
                            {monitors.length === 0 && (
                                <div className="col-span-full py-12 text-center glass-card rounded-xl border-dashed border-2 border-slate-700">
                                    <p className="text-slate-400">No monitors configured. Add one to get started.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-28">
                        <AddMonitorForm onAdd={handleAddMonitor} />
                    </div>
                </div>
            </div>
        </div>
    );
}
