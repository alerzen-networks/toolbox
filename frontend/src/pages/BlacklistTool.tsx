import { useState } from 'react';

interface BlacklistCheck {
    host: string;
    ip: string;
    results: BlacklistResult[];
    listed_in: number;
}

interface BlacklistResult {
    provider: string;
    listed: number;
    details: string;
}

export function BlacklistTool() {
    const [host, setHost] = useState('');
    const [report, setReport] = useState<BlacklistCheck | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        if (!host) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tools/blacklist?host=${encodeURIComponent(host)}`);
            const data = await res.json();
            setReport(data);
        } catch (e) {
            alert("Check failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Blacklist Monitor</h1>

            <div className="glass-card p-6 rounded-xl mb-8 max-w-3xl mx-auto">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="IP or Domain (e.g. 1.1.1.1)"
                        className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                    />
                    <button
                        onClick={handleCheck}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold disabled:opacity-50"
                    >
                        {loading ? 'Checking...' : 'Check Reputation'}
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                    Checks against Spamhaus, Barracuda, Spamcop, SORBS, and CBL.
                </p>
            </div>

            {report && (
                <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
                    <div className="px-6 py-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center bg-white/5">
                        <div className="mb-4 sm:mb-0">
                            <h2 className="text-xl font-bold text-white">{report.host}</h2>
                            <div className="text-sm text-slate-400 font-mono">{report.ip}</div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg font-bold ${report.listed_in === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {report.listed_in === 0 ? 'Clean Reputation' : `Listed in ${report.listed_in} Databases`}
                        </div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {report.results.map((res, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="text-slate-300 font-medium">{res.provider}</div>
                                <div>
                                    {res.listed ? (
                                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-sm">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            LISTED
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-sm">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            Clean
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
