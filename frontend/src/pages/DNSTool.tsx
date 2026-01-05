import { useState } from 'react';

interface DNSRecords {
    A?: string[];
    MX?: string[];
    NS?: string[];
    TXT?: string[];
}

interface PropagationResult {
    resolver: string;
    ip: string;
    status: string;
    records: string[];
}

export function DNSTool() {
    const [domain, setDomain] = useState('');
    const [records, setRecords] = useState<DNSRecords | null>(null);
    const [propagation, setPropagation] = useState<PropagationResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'local' | 'global'>('local');

    const handleLookup = async () => {
        if (!domain) return;
        setLoading(true);
        setRecords(null);
        setPropagation([]);

        try {
            // Parallel fetches
            const p1 = fetch(`/api/tools/dns?domain=${encodeURIComponent(domain)}`).then(r => r.json());
            const p2 = fetch(`/api/tools/dns-propagation?domain=${encodeURIComponent(domain)}`).then(r => r.json());

            const [localData, propData] = await Promise.all([p1, p2]);
            setRecords(localData);
            setPropagation(propData);
        } catch (e) {
            alert("Lookup failed");
        } finally {
            setLoading(false);
        }
    };

    const copyAll = () => {
        if (!records) return;
        const text = JSON.stringify(records, null, 2);
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">DNS Detective Pro</h1>
            <p className="text-slate-400 text-center mb-8">Inspect records & verify global propagation.</p>

            <div className="glass-card p-6 rounded-xl mb-8 max-w-3xl mx-auto flex gap-4">
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                />
                <button
                    onClick={handleLookup}
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold disabled:opacity-50 shadow-lg shadow-indigo-500/30"
                >
                    {loading ? 'Analyzing...' : 'Investigate'}
                </button>
            </div>

            {records && (
                <div className="animate-slide-up space-y-8">
                    {/* Tabs */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setActiveTab('local')}
                            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'local' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            DNS Records
                        </button>
                        <button
                            onClick={() => setActiveTab('global')}
                            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'global' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            Global Propagation
                        </button>
                    </div>

                    {activeTab === 'local' && (
                        <div className="glass-card rounded-xl overflow-hidden p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Current Records</h2>
                                <button onClick={copyAll} className="text-sm text-indigo-400 hover:text-indigo-300 font-bold">Copy JSON</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(records).map(([type, values]) => (
                                    <div key={type} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-1 bg-slate-700 text-white text-xs font-bold rounded">{type}</span>
                                            <span className="text-slate-400 text-xs">{values.length} records</span>
                                        </div>
                                        <ul className="space-y-1">
                                            {values.map((v, i) => (
                                                <li key={i} className="font-mono text-sm text-emerald-300 break-all">{v}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'global' && (
                        <div className="glass-card rounded-xl overflow-hidden p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Global Resolver Status</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="px-4 py-3">Resolver</th>
                                            <th className="px-4 py-3">Provider</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Resolved IP(s)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {propagation.map((p, i) => (
                                            <tr key={i} className="hover:bg-white/5">
                                                <td className="px-4 py-4 font-mono text-slate-300 text-sm">{p.ip}</td>
                                                <td className="px-4 py-4 text-white font-bold">{p.resolver}</td>
                                                <td className="px-4 py-4">
                                                    {p.status === 'Success' ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400">
                                                            MATCHED
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400">
                                                            {p.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-sm text-slate-300">
                                                    {p.records ? p.records.join(', ') : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
