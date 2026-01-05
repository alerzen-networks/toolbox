import { useState } from 'react';

// New structure based on updated Go backend
interface SecurityReport {
    url: string;
    score: number;
    grade: string;
    checks: SecurityCheck[];
    reputation: BlacklistCheck;
}

interface SecurityCheck {
    name: string;
    passed: boolean;
    score_penalty: number;
    description: string;
    remediation: string;
    severity: string;
}

interface BlacklistCheck {
    host: string;
    ip: string;
    listed_in: number;
    results: any[];
}


export function SecurityGradeTool() {
    const [url, setUrl] = useState('');
    const [report, setReport] = useState<SecurityReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedCheck, setExpandedCheck] = useState<number | null>(null);

    const handleAnalye = async () => {
        if (!url) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tools/security-grade?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            setReport(data);
        } catch (e) {
            alert("Analysis failed");
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'text-emerald-400 border-emerald-500 shadow-emerald-500/50 bg-emerald-500/10';
            case 'B': return 'text-lime-400 border-lime-500 shadow-lime-500/50 bg-lime-500/10';
            case 'C': return 'text-yellow-400 border-yellow-500 shadow-yellow-500/50 bg-yellow-500/10';
            case 'D': return 'text-orange-400 border-orange-500 shadow-orange-500/50 bg-orange-500/10';
            default: return 'text-red-500 border-red-600 shadow-red-600/50 bg-red-500/10';
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Web Security Guardian</h1>
            <p className="text-slate-400 text-center mb-8">Detailed vulnerability analysis & remediation.</p>

            <div className="glass-card p-6 rounded-xl mb-8 max-w-3xl mx-auto">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://your-business.com"
                        className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                    />
                    <button
                        onClick={handleAnalye}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold disabled:opacity-50 shadow-lg shadow-indigo-500/30"
                    >
                        {loading ? 'Analyzing...' : 'Run Audit'}
                    </button>
                </div>
            </div>

            {loading && (
                <div className="text-center py-12 animate-fade-in">
                    <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-lg text-white font-medium">Scanning Headers, SSL & Reputation...</p>
                    <p className="text-sm text-slate-500">Connecting to Cisco SpamCop / Talos & Spamhaus...</p>
                </div>
            )}

            {report && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">

                    {/* Left Column: Grade & Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                            <div className={`w-40 h-40 rounded-full border-8 flex items-center justify-center text-7xl font-bold shadow-2xl mb-6 ${getGradeColor(report.grade)}`}>
                                {report.grade}
                            </div>
                            <div className="text-5xl font-bold text-white mb-2">{report.score}<span className="text-2xl text-slate-500">/100</span></div>
                            <div className="text-slate-400 uppercase tracking-widest text-sm font-bold">Security Score</div>
                        </div>

                        {/* Reputation Summary Card */}
                        <div className={`glass-card p-6 rounded-xl border ${report.reputation.listed_in > 0 ? 'border-rose-500/50 bg-rose-500/5' : 'border-emerald-500/50 bg-emerald-500/5'}`}>
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Global Reputation
                            </h3>
                            {report.reputation.listed_in === 0 ? (
                                <p className="text-emerald-300 text-sm">
                                    Your IP is <span className="font-bold">CLEAN</span> on Talos (SpamCop) & Spamhaus.
                                </p>
                            ) : (
                                <p className="text-rose-300 text-sm">
                                    <span className="font-bold">WARNING:</span> Your IP is flagged in {report.reputation.listed_in} blocklists. Immediate action required.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Detailed Checks */}
                    <div className="lg:col-span-8">
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Security Audit Report</h2>
                                <div className="text-xs text-slate-500">Click items for details</div>
                            </div>

                            <div className="divide-y divide-white/5">
                                {report.checks.map((check, idx) => (
                                    <div key={idx} className="group">
                                        <button
                                            onClick={() => setExpandedCheck(expandedCheck === idx ? null : idx)}
                                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                {check.passed ? (
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className={`font-bold ${check.passed ? 'text-slate-200' : 'text-rose-300'}`}>{check.name}</h3>
                                                    <p className="text-xs text-slate-500 truncate max-w-md">{check.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {!check.passed && (
                                                    <span className="px-2 py-1 bg-rose-500/20 text-rose-400 text-xs font-bold rounded">
                                                        -{check.score_penalty} pts
                                                    </span>
                                                )}
                                                <svg className={`w-5 h-5 text-slate-500 transition-transform ${expandedCheck === idx ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </button>

                                        {expandedCheck === idx && (
                                            <div className="px-6 py-4 bg-slate-900/50 border-t border-white/5 space-y-3 animate-fade-in">
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">What is this?</h4>
                                                    <p className="text-sm text-slate-300">{check.description}</p>
                                                </div>

                                                {!check.passed && (
                                                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg">
                                                        <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                            How to Fix
                                                        </h4>
                                                        <p className="text-sm text-rose-200 font-medium">{check.remediation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
