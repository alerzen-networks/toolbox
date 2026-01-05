import React from 'react';
import type { Monitor } from '../types';

interface Props {
    monitor: Monitor;
}

export const MonitorCard: React.FC<Props & { onDelete: (id: number) => void; onCheck: (id: number) => void; onTrace: (id: number) => Promise<string> }> = ({ monitor, onDelete, onCheck, onTrace }) => {
    const isUp = monitor.last_check?.status_code === 200;
    const [tracing, setTracing] = React.useState(false);
    const [traceOutput, setTraceOutput] = React.useState<string | null>(null);

    // Dynamic styles based on status
    const statusColor = isUp ? 'bg-emerald-500' : 'bg-rose-500';
    const statusGlow = isUp ? 'shadow-emerald-500/50' : 'shadow-rose-500/50';
    const statusText = isUp ? 'text-emerald-400' : 'text-rose-400';
    const bgPulse = !monitor.last_check ? 'animate-pulse' : '';

    const handleTrace = async () => {
        setTracing(true);
        try {
            const output = await onTrace(monitor.id);
            setTraceOutput(output);
        } catch (e) {
            alert("Traceroute failed");
        } finally {
            setTracing(false);
        }
    };

    return (
        <div className={`glass-card rounded-xl p-5 relative overflow-hidden group ${bgPulse}`}>
            {/* Background Glow Effect */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 border border-white/5">
                                {monitor.type || 'HTTP'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                                {monitor.interval}s
                            </span>
                        </div>
                        <h3 className="text-base font-semibold text-white truncate pr-2" title={monitor.name}>
                            {monitor.name}
                        </h3>
                        <p className="text-xs text-slate-400 truncate font-mono mt-1 opacity-80">{monitor.url}</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleTrace}
                            disabled={tracing}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-sky-400 transition-colors disabled:opacity-50"
                            title="Run Traceroute"
                        >
                            <svg className={`w-4 h-4 ${tracing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.806-.98l-6-1.513M9 7l4-2 4 2" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onCheck(monitor.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Run Check Now"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this monitor?')) onDelete(monitor.id);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Monitor"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {traceOutput && (
                    <div className="mb-4 p-3 bg-black/50 rounded-lg border border-slate-700 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre">
                        <div className="flex justify-between items-start mb-2 sticky top-0">
                            <span className="font-bold text-sky-400">TRACEROUTE RESULT</span>
                            <button onClick={() => setTraceOutput(null)} className="text-slate-500 hover:text-white">x</button>
                        </div>
                        {traceOutput}
                    </div>
                )}

                <div className="flex items-end justify-between mt-4">
                    <div>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Response</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white tracking-tight">
                                {monitor.last_check ? monitor.last_check.duration : '--'}
                            </span>
                            <span className="text-sm text-slate-400 font-medium">ms</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={`flex h-3 w-3 relative ml-auto mb-2`}>
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColor}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${statusColor} shadow-lg ${statusGlow}`}></span>
                        </div>
                        <div className={`text-sm font-bold ${statusText}`}>
                            {monitor.last_check ? (isUp ? 'OPERATIONAL' : 'DOWN') : 'PENDING'}
                        </div>
                    </div>
                </div>

                {/* History Bar */}
                <div className="mt-6">
                    <div className="flex justify-between items-end h-8 gap-1">
                        {monitor.checks?.slice().reverse().map((check, idx) => (
                            <div
                                key={idx}
                                title={`${new Date(check.created_at).toLocaleTimeString()} - ${check.status_code} (${check.duration}ms)`}
                                className={`flex-1 rounded-sm transition-all hover:opacity-100 opacity-60 ${check.status_code === 200 ? 'bg-emerald-500/50 hover:bg-emerald-400' : 'bg-rose-500/50 hover:bg-rose-400'}`}
                                style={{ height: `${Math.min(100, Math.max(20, check.duration / 10))}%` }}
                            ></div>
                        ))}
                        {(!monitor.checks || monitor.checks.length === 0) && (
                            <div className="w-full text-center text-xs text-slate-600">No history yet</div>
                        )}
                    </div>
                </div>

                <div className="mt-2 flex justify-between items-center px-1">
                    <span className="text-xs text-slate-500 font-mono">
                        {monitor.last_check ? new Date(monitor.last_check.created_at).toLocaleTimeString() : ''}
                    </span>
                    <div className="flex gap-2 items-center">
                        {monitor.last_check?.output && monitor.type === 'ICMP' && (
                            <span className="text-[10px] text-slate-500 max-w-[150px] truncate" title={monitor.last_check.output}>
                                {monitor.last_check.output}
                            </span>
                        )}
                        {monitor.check_ssl && monitor.ssl_expiry && (
                            (() => {
                                const days = Math.floor((new Date(monitor.ssl_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                let color = 'text-emerald-400';
                                if (days < 7) color = 'text-rose-500';
                                else if (days < 30) color = 'text-amber-400';

                                return (
                                    <span className={`text-[10px] flex items-center gap-1 ${color} border border-current/20 px-1.5 py-0.5 rounded`} title={`Expires on ${new Date(monitor.ssl_expiry).toLocaleDateString()}`}>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        {days}d
                                    </span>
                                );
                            })()
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
