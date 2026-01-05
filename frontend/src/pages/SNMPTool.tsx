import { useState, useEffect } from 'react';

interface SNMPResult {
    oid: string;
    type: string;
    value: string;
}

export function SNMPTool() {
    const [activeTab, setActiveTab] = useState<'manager' | 'agent'>('manager');

    // Manager State
    const [target, setTarget] = useState('');
    const [community, setCommunity] = useState('public');
    const [oid, setOid] = useState('.1.3.6.1.2.1.1.1.0'); // SysDescr
    const [results, setResults] = useState<SNMPResult[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'GET' | 'WALK'>('GET');

    // Agent State
    const [agentStats, setAgentStats] = useState<any>(null);

    const handleExecute = async () => {
        if (!target || !oid) return;
        setLoading(true);
        setResults(null);
        try {
            const endpoint = mode === 'GET' ? '/api/tools/snmp/get' : '/api/tools/snmp/walk';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target, community, oid }),
            });
            const data = await res.json();
            if (data.error) {
                alert("Error: " + data.error);
            } else {
                setResults(data);
            }
        } catch (e) {
            alert("Execution Failed");
        } finally {
            setLoading(false);
        }
    };

    const fetchAgentStats = async () => {
        try {
            const res = await fetch('/api/tools/snmp/agent-stats');
            const data = await res.json();
            setAgentStats(data);
        } catch (e) {
            console.error("Failed to fetch agent stats");
        }
    };

    useEffect(() => {
        if (activeTab === 'agent') {
            fetchAgentStats();
            const interval = setInterval(fetchAgentStats, 5000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">SNMP Suite</h1>

            <div className="flex gap-4 mb-6 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('manager')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'manager' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}
                >
                    SNMP Manager (Browser)
                </button>
                <button
                    onClick={() => setActiveTab('agent')}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'agent' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}
                >
                    Local Agent Status
                </button>
            </div>

            {activeTab === 'manager' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="glass-card p-6 rounded-xl space-y-6 h-fit">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Target IP</label>
                            <input
                                type="text"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder="192.168.1.1"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Community String</label>
                            <input
                                type="text"
                                value={community}
                                onChange={(e) => setCommunity(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">OID Input</label>
                            <div className="flex gap-2 mb-2">
                                <button onClick={() => setOid('.1.3.6.1.2.1.1.1.0')} className="text-xs px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300">SysDescr</button>
                                <button onClick={() => setOid('.1.3.6.1.2.1.1.5.0')} className="text-xs px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300">SysName</button>
                                <button onClick={() => setOid('.1.3.6.1.2.1.2.2.1.2')} className="text-xs px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300">Interfaces</button>
                            </div>
                            <input
                                type="text"
                                value={oid}
                                onChange={(e) => setOid(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => { setMode('GET'); handleExecute(); }}
                                disabled={loading}
                                className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === 'GET' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                            >
                                GET
                            </button>
                            <button
                                onClick={() => { setMode('WALK'); handleExecute(); }}
                                disabled={loading}
                                className={`flex-1 py-2 rounded-lg font-bold transition-colors ${mode === 'WALK' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                            >
                                WALK
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        {loading && (
                            <div className="glass-card p-12 rounded-xl flex flex-col items-center justify-center text-slate-400">
                                <div className="animate-spin h-8 w-8 mb-4 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                                Querying Device...
                            </div>
                        )}

                        {!loading && results && (
                            <div className="glass-card rounded-xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                                    <h2 className="font-semibold text-white">Results ({results.length})</h2>
                                </div>
                                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                                    {results.map((res, idx) => (
                                        <div key={idx} className="px-6 py-3 hover:bg-white/5 transition-colors">
                                            <div className="text-xs text-indigo-400 font-mono mb-1">{res.oid}</div>
                                            <div className="flex justify-between items-start gap-4">
                                                <span className="text-slate-200 font-mono break-all">{res.value}</span>
                                                <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-800 rounded">{res.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {results.length === 0 && (
                                        <div className="p-8 text-center text-slate-500">No results found.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!loading && !results && (
                            <div className="glass-card p-12 rounded-xl flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700">
                                <p>Enter target details and Execute</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'agent' && (
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="glass-card p-6 rounded-xl border border-emerald-500/30">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Agent Active</h2>
                                <p className="text-slate-400">Listening on UDP Port <span className="text-emerald-400 font-mono font-bold">1161</span></p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500">
                            This agent exposes internal Alerzen Networks metrics. You can poll this server using any SNMP Manager (or the one in the other tab!).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-xl text-center">
                            <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Total Monitors</h3>
                            <div className="text-4xl font-bold text-white">{agentStats?.total || 0}</div>
                        </div>
                        <div className="glass-card p-6 rounded-xl text-center">
                            <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Monitors UP</h3>
                            <div className="text-4xl font-bold text-emerald-400">{agentStats?.up || 0}</div>
                        </div>
                        <div className="glass-card p-6 rounded-xl text-center">
                            <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Monitors DOWN</h3>
                            <div className="text-4xl font-bold text-rose-400">{agentStats?.down || 0}</div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-xl">
                        <h3 className="text-lg font-bold text-white mb-4">Exposed OIDs</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-slate-500 border-b border-white/10">
                                    <tr>
                                        <th className="pb-2">OID</th>
                                        <th className="pb-2">Description</th>
                                        <th className="pb-2">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300 font-mono">
                                    <tr className="border-b border-white/5">
                                        <td className="py-2">.1.3.6.1.4.1.99999.1</td>
                                        <td>Total Configured Monitors</td>
                                        <td>Integer</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-2">.1.3.6.1.4.1.99999.2</td>
                                        <td>Count of UP Monitors</td>
                                        <td>Integer</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-2">.1.3.6.1.4.1.99999.3</td>
                                        <td>Count of DOWN Monitors</td>
                                        <td>Integer</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
