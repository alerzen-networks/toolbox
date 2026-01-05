import React from 'react';
import type { Monitor } from '../types';

interface Props {
    monitors: Monitor[];
}

export const StatsOverview: React.FC<Props> = ({ monitors }) => {
    const total = monitors.length;
    const up = monitors.filter(m => m.last_check?.status_code === 200).length;
    const down = monitors.filter(m => m.last_check && m.last_check.status_code !== 200).length;
    const avgResponse = monitors.reduce((acc, m) => acc + (m.last_check?.duration || 0), 0) / (total || 1);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Monitors" value={total} color="text-indigo-400" />
            <StatCard label="Operational" value={up} color="text-emerald-400" />
            <StatCard label="Downtime" value={down} color="text-rose-400" />
            <StatCard label="Avg Response" value={`${Math.round(avgResponse)}ms`} color="text-sky-400" />
        </div>
    );
};

const StatCard: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
    <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <dt className="text-sm font-medium text-slate-400 mb-1">{label}</dt>
        <dd className={`text-3xl font-bold ${color} tracking-tight`}>{value}</dd>
    </div>
);
