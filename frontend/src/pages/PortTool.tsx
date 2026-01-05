import { useState } from 'react';

interface PortResult {
    port: number;
    status: string;
    service: string;
}

export function PortTool() {
    const [host, setHost] = useState('');
    const [customPorts, setCustomPorts] = useState('');
    const [results, setResults] = useState<PortResult[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleScan = async (ports: number[] = []) => {
        if (!host) return;
        setLoading(true);
        setResults(null);
        try {
            const res = await fetch('/api/tools/port-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host, ports: ports.length > 0 ? ports : undefined }),
            });
            const data = await res.json();
            setResults(data);
        } catch (e) {
            alert("Scan failed");
        } finally {
            setLoading(false);
        }
    };

    const runCustomScan = () => {
        const ports = customPorts.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
        handleScan(ports);
    }

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Port Authority (Scanner)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="glass-card p-6 rounded-xl space-y-6 h-fit">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Target Host</label>
                        <input
                            type="text"
                            value={host}
                            onChange={(e) => setHost(e.target.value)}
                            placeholder="example.com or 192.168.1.1"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Scan Profile</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleScan([21, 22, 23, 25])} disabled={loading} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors text-left">
                                Admin (22, 23, 25...)
                            </button>
                            <button onClick={() => handleScan([80, 443, 8080, 8443])} disabled={loading} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors text-left">
                                Web (80, 443...)
                            </button>
                            <button onClick={() => handleScan([3306, 5432, 6379, 27017])} disabled={loading} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors text-left">
                                Database (SQL...)
                            </button>
                            <button onClick={() => handleScan([])} disabled={loading} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors text-left">
                                All Common Ports
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Custom Ports</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customPorts}
                                onChange={(e) => setCustomPorts(e.target.value)}
                                placeholder="80, 443, 8080"
                                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                            />
                            <button onClick={runCustomScan} disabled={loading} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm disabled:opacity-50">
                                Scan
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {loading && (
                        <div className="glass-card p-12 rounded-xl flex flex-col items-center justify-center text-slate-400">
                            <svg className="animate-spin h-8 w-8 mb-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Scanning Target...
                        </div>
                    )}

                    {!loading && results && (
                        <div className="glass-card rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h2 className="font-semibold text-white">Scan Results</h2>
                                <span className="text-xs text-slate-400">{results.length} ports scanned</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {results.map((res) => (
                                    <div key={res.port} className="px-6 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-slate-300 w-12 text-right">{res.port}</span>
                                            <span className="text-sm font-medium text-slate-400">{res.service || 'Unknown'}</span>
                                        </div>
                                        <div>
                                            {res.status === 'Open' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Open
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 opacity-50">
                                                    Closed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && !results && (
                        <div className="glass-card p-12 rounded-xl flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700">
                            <p>Enter a host and start scanning</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
