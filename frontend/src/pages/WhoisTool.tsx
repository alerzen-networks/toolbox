import { useState } from 'react';

interface WhoisResult {
    domain: string;
    raw: string;
    error?: string;
}

export function WhoisTool() {
    const [domain, setDomain] = useState('');
    const [result, setResult] = useState<WhoisResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        if (!domain) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tools/whois?domain=${encodeURIComponent(domain)}`);
            const data = await res.json();
            setResult(data);
        } catch (e) {
            alert("Lookup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Whois Lookup</h1>

            <div className="glass-card p-6 rounded-xl mb-8 max-w-3xl mx-auto">
                <div className="flex gap-4">
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
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Lookup'}
                    </button>
                </div>
            </div>

            {result && (
                <div className="glass-card p-0 rounded-xl overflow-hidden animate-fade-in">
                    <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                        <span className="font-bold text-white text-lg">{result.domain}</span>
                        {result.error && <span className="text-rose-400 text-sm">{result.error}</span>}
                    </div>
                    <pre className="p-6 overflow-x-auto text-xs sm:text-sm font-mono text-slate-400 whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                        {result.raw || "No Data Found"}
                    </pre>
                </div>
            )}
        </div>
    );
}
