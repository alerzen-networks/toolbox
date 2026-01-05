import { useState } from 'react';

interface HostResult {
    ip: string;
    hostname: string;
    mac: string;
    vendor: string;
    role: string;
    ports: number[];
    latency: number;
    status: string;
}

export function SubnetTool() {
    const [cidr, setCidr] = useState('192.168.1.0/24');
    const [hosts, setHosts] = useState<HostResult[]>([]);
    const [loading, setLoading] = useState(false);

    const handleScan = async () => {
        if (!cidr) return;
        setLoading(true);
        setHosts([]);
        try {
            const res = await fetch(`/api/tools/subnet?cidr=${encodeURIComponent(cidr)}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                // Sort by IP numerically if possible
                setHosts(data.sort((a, b) => {
                    const numA = a.ip.split('.').map(Number);
                    const numB = b.ip.split('.').map(Number);
                    for (let i = 0; i < 4; i++) {
                        if (numA[i] !== numB[i]) return numA[i] - numB[i];
                    }
                    return 0;
                }));
            }
        } catch (e) {
            alert("Scan failed");
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (hosts.length === 0) return;
        const headers = ['IP', 'Hostname', 'MAC', 'Vendor', 'Role', 'Latency (ms)'];
        const rows = hosts.map(h => [h.ip, h.hostname, h.mac, h.vendor, h.role, h.latency]);
        const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `network_scan_${Date.now()}.csv`;
        a.click();
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Network Inventory Scanner</h1>
            <p className="text-slate-400 text-center mb-8">Discover devices, identify vendors, and audit your subnet.</p>

            <div className="glass-card p-6 rounded-xl mb-8 max-w-3xl mx-auto flex gap-4">
                <input
                    type="text"
                    value={cidr}
                    onChange={(e) => setCidr(e.target.value)}
                    placeholder="CIDR (e.g., 192.168.1.0/24)"
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                />
                <button
                    onClick={handleScan}
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold disabled:opacity-50 shadow-lg shadow-indigo-500/30 whitespace-nowrap"
                >
                    {loading ? 'Scanning...' : 'Start Scan'}
                </button>
            </div>

            {hosts.length > 0 && (
                <div className="glass-card rounded-xl overflow-hidden animate-slide-up">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Discovered Devices ({hosts.length})</h2>
                        <button
                            onClick={handleExportCSV}
                            className="text-sm px-3 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded border border-emerald-500/50 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export CSV
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider bg-black/20">
                                    <th className="px-6 py-3">IP Address</th>
                                    <th className="px-6 py-3">Hostname</th>
                                    <th className="px-6 py-3">MAC / Vendor</th>
                                    <th className="px-6 py-3">Role / OS</th>
                                    <th className="px-6 py-3 text-right">Latency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {hosts.map((host, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-white text-sm">
                                            {host.ip}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 text-sm">
                                            {host.hostname || <span className="text-slate-600 italic">Unknown</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-300 font-mono text-xs">{host.mac}</div>
                                            <div className="text-slate-500 text-xs">{host.vendor}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${host.role === 'Generic Device' ? 'bg-slate-700 text-slate-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                                                {host.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-sm font-bold ${host.latency < 20 ? 'text-emerald-400' : host.latency < 100 ? 'text-yellow-400' : 'text-rose-400'}`}>
                                                {host.latency} ms
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
