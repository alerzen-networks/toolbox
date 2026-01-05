import { useState } from 'react';

interface SSLResult {
    subject: string;
    issuer: string;
    valid_from: string;
    valid_to: string;
    days_remaining: number;
    error?: string;
}

export function SSLTool() {
    const [domain, setDomain] = useState('');
    const [result, setResult] = useState<SSLResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        if (!domain) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tools/ssl?domain=${encodeURIComponent(domain)}`);
            const data = await res.json();
            setResult(data);
        } catch (e) {
            alert("Check failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">SSL Inspector</h1>

            <div className="glass-card p-6 rounded-xl mb-8">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="example.com"
                        className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                    />
                    <button
                        onClick={handleCheck}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold disabled:opacity-50"
                    >
                        {loading ? 'Checking...' : 'Inspect'}
                    </button>
                </div>
            </div>

            {result && (
                <div className="glass-card p-8 rounded-xl animate-fade-in space-y-6">
                    {result.error ? (
                        <div className="text-center text-rose-400 font-bold">Error: {result.error}</div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${result.days_remaining > 30 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-white">{result.subject}</h2>
                                <p className={`text-lg font-medium ${result.days_remaining > 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    Expires in {result.days_remaining} days
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">Issuer</span>
                                    <div className="text-slate-300 mt-1">{result.issuer}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">Valid From</span>
                                    <div className="text-slate-300 mt-1">{new Date(result.valid_from).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 uppercase tracking-wider">Expires On</span>
                                    <div className="text-slate-300 mt-1">{new Date(result.valid_to).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
