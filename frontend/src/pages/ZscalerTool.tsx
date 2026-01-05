import { useEffect, useState } from 'react';


// Types matching backend
interface ZscalerProcess {
    name: string;
    status: string;
    pid?: string;
}

interface ZDXMetric {
    score: number;
    latencyMs: number;
    jitterMs: number;
    packetLossPct: number;
    dnsMs: number;
}

interface ZscalerInfo {
    isZscaler: boolean;
    proxyIP: string;
    gateway: string;
    cloud: string;
    clientIP: string;
    city: string;
    country: string;
    lat: number;
    lon: number;
}

interface SSLStatus {
    inspected: boolean;
    issuer: string;
}

interface ZscalerData {
    processes: ZscalerProcess[];
    info: ZscalerInfo;
    zdx: ZDXMetric;
    ssl: SSLStatus;
}

export function ZscalerTool() {
    const [data, setData] = useState<ZscalerData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/tools/zscaler/advanced');
            if (!res.ok) throw new Error("Failed to fetch data");
            const json = await res.json();
            setData(json);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Simple color interpolation
    const getColor = (score: number) => {
        if (score >= 90) return "#22c55e"; // Green
        if (score >= 50) return "#eab308"; // Yellow
        return "#ef4444"; // Red
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Zscaler Diagnostics</h1>
                    <p className="text-slate-500">Advanced ZTNA Telemetry & Health Check</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                    {loading ? 'Analyzing...' : 'Refresh Analysis'}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8">
                    {error}
                </div>
            )}

            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ZDX Score Card */}
                    <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-slate-200 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50 opacity-50"></div>
                        <h2 className="text-xl font-bold text-slate-900 mb-6 relative z-10">ZDX Health Score</h2>

                        <div className="relative flex items-center justify-center py-8">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-slate-200"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 88}
                                    strokeDashoffset={2 * Math.PI * 88 * (1 - data.zdx.score / 100)}
                                    className="text-blue-500 transition-all duration-1000 ease-out"
                                    style={{ color: getColor(data.zdx.score) }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-slate-900">{data.zdx.score}</span>
                                <span className="text-sm text-slate-500 uppercase tracking-widest mt-1">Excellent</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
                            <div className="bg-slate-100 p-3 rounded-lg text-center">
                                <div className="text-xs text-slate-500 uppercase">Latency</div>
                                <div className="text-lg font-mono text-slate-900">{data.zdx.latencyMs}ms</div>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-lg text-center">
                                <div className="text-xs text-slate-500 uppercase">Jitter</div>
                                <div className="text-lg font-mono text-white">{data.zdx.jitterMs}ms</div>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-lg text-center">
                                <div className="text-xs text-slate-500 uppercase">Packet Loss</div>
                                <div className="text-lg font-mono text-white">{data.zdx.packetLossPct.toFixed(1)}%</div>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-lg text-center">
                                <div className="text-xs text-slate-500 uppercase">DNS Time</div>
                                <div className="text-lg font-mono text-white">{data.zdx.dnsMs}ms</div>
                            </div>
                        </div>
                    </div>

                    {/* Central Tunnel Visual (CSS Based) */}
                    <div className="lg:col-span-2 glass-card p-0 rounded-2xl border border-slate-200 overflow-hidden relative flex flex-col">
                        <div className="absolute top-0 w-full p-6 z-10 bg-gradient-to-b from-white/90 to-transparent">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full ${data.info.isZscaler ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                {data.info.isZscaler ? 'Secure Tunnel Active' : 'Tunnel Inactive'}
                            </h2>
                            <p className="text-sm text-slate-600 mt-1">
                                Connected to <strong>{data.info.gateway || 'Unknown Gateway'}</strong> via <strong>{data.info.cloud || 'Direct Internet'}</strong>
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {data.info.city}, {data.info.country}
                            </p>
                        </div>

                        <div className="flex-1 bg-slate-50 relative flex items-center justify-center min-h-[400px]">
                            {/* Animated Tunnel Rings */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>

                                {data.info.isZscaler && (
                                    <>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-blue-500/30 rounded-full animate-ping opacity-20"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-blue-500/50 rounded-full animate-ping opacity-30 animation-delay-200"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-blue-500/70 rounded-full animate-pulse"></div>
                                    </>
                                )}

                                <div className="relative w-32 h-32 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center z-10 shadow-xl">
                                    <svg className={`w-16 h-16 ${data.info.isZscaler ? 'text-blue-500' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>

                                {/* Connecting Lines */}
                                <div className="absolute top-1/2 left-full w-32 h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                                <div className="absolute top-1/2 right-full w-32 h-0.5 bg-gradient-to-l from-blue-500/50 to-transparent"></div>
                            </div>

                            {!data.info.isZscaler && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                                    <div className="text-center">
                                        <div className="text-5xl mb-4">⚠️</div>
                                        <h3 className="text-xl font-bold text-white">Traffic Not Proxied</h3>
                                        <p className="text-slate-400">You are accessing the internet directly.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Process Status Grid */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {data.processes.map((proc) => (
                            <div key={proc.name} className="glass-card p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{proc.name.replace('.exe', '')}</p>
                                    <p className={`font-mono font-bold ${proc.status === 'Running' ? 'text-green-400' : 'text-red-400'}`}>
                                        {proc.status}
                                    </p>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${proc.status === 'Running' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                            </div>
                        ))}

                        {/* SSL Inspection Status */}
                        <div className="glass-card p-4 rounded-xl border border-slate-200 flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-1">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">SSL Inspection</p>
                                <p className={`font-bold ${data.ssl.inspected ? 'text-blue-400' : 'text-orange-400'}`}>
                                    {data.ssl.inspected ? 'Active' : 'Bypassed'}
                                </p>
                                <p className="text-xs text-slate-600 truncate max-w-[120px]" title={data.ssl.issuer}>{data.ssl.issuer}</p>
                            </div>
                            <div className="bg-slate-800 p-2 rounded-lg">
                                <svg className={`w-6 h-6 ${data.ssl.inspected ? 'text-blue-400' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
