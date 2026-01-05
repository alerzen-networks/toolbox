import React, { useState } from 'react';

interface Props {
    onAdd: (name: string, url: string, type: string, interval: number, checkSSL: boolean) => Promise<void>;
}

export const AddMonitorForm: React.FC<Props> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState('HTTP');
    const [interval, setInterval] = useState(60);
    const [checkSSL, setCheckSSL] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState<'name' | 'url' | 'interval' | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !url) return;

        setLoading(true);
        try {
            await onAdd(name, url, type, interval, checkSSL);
            setName('');
            setUrl('');
            setType('HTTP');
            setInterval(60);
            setCheckSSL(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
            {/* Decorative Grid Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Add Monitor</h3>
                    <p className="text-sm text-slate-400">Configure a new endpoint to track.</p>
                </div>

                <div className="space-y-4">
                    <div className={`transition-all duration-300 ${focused === 'name' ? 'scale-[1.02]' : ''}`}>
                        <label htmlFor="name" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                            Friendly Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={name}
                            onFocus={() => setFocused('name')}
                            onBlur={() => setFocused(null)}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                            placeholder="e.g. Production API"
                        />
                    </div>

                    <div className={`transition-all duration-300 ${focused === 'url' ? 'scale-[1.02]' : ''}`}>
                        <label htmlFor="url" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                            {type === 'ICMP' ? 'Hostname / IP' : 'Endpoint URL'}
                        </label>
                        <div className="relative">
                            <input
                                type={type === 'ICMP' ? 'text' : 'url'}
                                name="url"
                                id="url"
                                value={url}
                                onFocus={() => setFocused('url')}
                                onBlur={() => setFocused(null)}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-4 pr-10 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm"
                                placeholder={type === 'ICMP' ? '8.8.8.8' : 'https://api.example.com'}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                                Type
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                            >
                                <option value="HTTP">HTTP (Website)</option>
                                <option value="ICMP">ICMP (Ping)</option>
                            </select>
                        </div>
                        <div className={`transition-all duration-300 ${focused === 'interval' ? 'scale-[1.02]' : ''}`}>
                            <label htmlFor="interval" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                                Interval (s)
                            </label>
                            <input
                                type="number"
                                name="interval"
                                id="interval"
                                min="5"
                                value={interval}
                                onFocus={() => setFocused('interval')}
                                onBlur={() => setFocused(null)}
                                onChange={(e) => setInterval(parseInt(e.target.value) || 60)}
                                required
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                            />
                        </div>
                    </div>

                    {type === 'HTTP' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="check_ssl"
                                checked={checkSSL}
                                onChange={(e) => setCheckSSL(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-indigo-500 focus:ring-indigo-500/50"
                            />
                            <label htmlFor="check_ssl" className="text-sm text-slate-400">Track SSL Certificate Expiry</label>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full group relative flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        'Start Monitoring'
                    )}
                </button>
            </form>
        </div>
    );
};
