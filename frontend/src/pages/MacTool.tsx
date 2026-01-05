import { useState } from 'react';

export function MacTool() {
    const [mac, setMac] = useState('');
    const [vendor, setVendor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        if (!mac) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tools/mac/${encodeURIComponent(mac)}`);
            const data = await res.json();
            if (data.error) {
                setVendor(`Error: ${data.error}`);
            } else {
                setVendor(data.vendor);
            }
        } catch (e) {
            console.error(e);
            setVendor("Error looking up MAC (Check logs)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">MAC OUI Lookup</h1>

            <div className="glass-card p-8 rounded-xl space-y-8">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 text-center">Enter MAC Address</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={mac}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMac(e.target.value)}
                            placeholder="00:1B:44:11:3A:B7"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-center text-lg"
                        />
                    </div>
                </div>

                <button
                    onClick={handleLookup}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                    {loading ? 'Identifying...' : 'Find Manufacturer'}
                </button>

                {vendor && (
                    <div className="text-center pt-8 border-t border-white/5 animate-fade-in">
                        <span className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Manufacturer</span>
                        <div className="text-2xl font-bold text-white">
                            {vendor}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
