import { useEffect, useState } from 'react';

interface LatencyResult {
    region: string;
    target: string;
    latency: number;
}

export function LatencyTool() {
    const [results, setResults] = useState<LatencyResult[]>([]);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/tools/latency');
            const data = await res.json();
            setResults(data);
        } catch (e) {
            alert("Test failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runTest();
    }, []);

    const getLatencyColor = (ms: number) => {
        if (ms === -1) return 'bg-slate-700 text-slate-500';
        if (ms < 100) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        if (ms < 200) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Global Latency Heatmap</h1>
                <button
                    onClick={runTest}
                    disabled={loading}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 transition-colors"
                >
                    {loading ? 'Pinging...' : 'Refresh'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && results.length === 0 ? (
                    // Skeleton UI
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card p-6 rounded-xl animate-pulse h-32 bg-slate-800/50"></div>
                    ))
                ) : (
                    results.map((res, idx) => (
                        <div key={idx} className={`glass-card p-6 rounded-xl border transition-all ${getLatencyColor(res.latency)}`}>
                            <h3 className="font-bold text-lg mb-1 opacity-90">{res.region}</h3>
                            <p className="text-xs opacity-60 font-mono mb-4">{res.target}</p>

                            <div className="flex items-end justify-between">
                                <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Ping</span>
                                <span className="text-3xl font-bold">
                                    {res.latency === -1 ? 'Time out' : `${res.latency}ms`}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
