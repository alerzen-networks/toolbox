import { useState } from 'react';

interface SpeedResult {
    ping: number;
    download: number;
    upload: number;
    server: string;
    location: string;
    sponsor: string;
    error?: string;
}

export function SpeedTestTool() {
    const [result, setResult] = useState<SpeedResult | null>(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/api/tools/speedtest', { method: 'POST' });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            alert("Test Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Connection Speed Test</h1>

            <div className="max-w-2xl mx-auto glass-card p-8 rounded-2xl border border-white/10">
                {!loading && !result && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/30 animate-pulse-slow">
                            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Ready to test?</h2>
                        <p className="text-slate-400 mb-8">Measure your server's Download, Upload, and Ping.</p>
                        <button
                            onClick={runTest}
                            className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-full hover:bg-slate-200 transition-colors shadow-xl"
                        >
                            Start Speed Test
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 border-4 border-indigo-500 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-bold text-white animate-pulse">Running Speed Test...</h2>
                        <p className="text-slate-400 mt-2 text-sm">Testing Ping, Download, and Upload.<br />This takes about 15-30 seconds.</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Date Rate Download</div>
                                <div className="text-4xl font-bold text-emerald-400">{result.download} <span className="text-lg font-normal text-emerald-600">Mbps</span></div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Data Rate Upload</div>
                                <div className="text-4xl font-bold text-sky-400">{result.upload} <span className="text-lg font-normal text-sky-600">Mbps</span></div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Latency / Ping</div>
                                <div className="text-4xl font-bold text-amber-400">{result.ping} <span className="text-lg font-normal text-amber-600">ms</span></div>
                            </div>
                        </div>

                        {result.error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-center">
                                Error: {result.error}
                            </div>
                        )}

                        <div className="text-center border-t border-white/5 pt-6">
                            <p className="text-sm text-slate-500 mb-1">Testing Server</p>
                            <div className="text-lg font-medium text-white">{result.sponsor}</div>
                            <div className="text-sm text-slate-400">{result.server} ({result.location})</div>

                            <button
                                onClick={runTest}
                                className="mt-8 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Test Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
