import { useState } from 'react';

export function IPTool() {
    const [ip, setIp] = useState('');
    const [cidr, setCidr] = useState(24);
    const [hostsInput, setHostsInput] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleHostsChange = (val: string) => {
        setHostsInput(val);
        const hosts = parseInt(val);
        if (!isNaN(hosts) && hosts > 0) {
            // Calculate minimum bits needed for hosts + 2 (network + broadcast)
            // 32 - ceil(log2(hosts + 2))
            const bits = Math.ceil(Math.log2(hosts + 2));
            const newCidr = 32 - bits;
            // Ensure valid CIDR range (e.g. max /30 for 2 hosts, though technically /31 or /32 exist but usually useless for hosts)
            if (newCidr >= 0 && newCidr <= 32) {
                setCidr(newCidr);
            }
        }
    };

    const handleCidrChange = (val: number) => {
        setCidr(val);
        // Optional: Update hosts input to match max hosts of this CIDR? 
        // Or leave it independent. Let's leave it to avoid overwriting user intent too aggressively.
        // But maybe clear specific requirement if manual override?
        // setHostsInput(''); 
    };

    const calculateSubnet = () => {
        // Simple client-side calculation logic
        try {
            const ipParts = ip.split('.').map(Number);
            if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) {
                alert("Invalid IP Address");
                return;
            }

            const mask = -1 << (32 - cidr);
            const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
            const netAddr = (ipNum & mask) >>> 0;
            const broadcast = (netAddr | (~mask)) >>> 0;
            const firstUsable = (netAddr + 1) >>> 0;
            const lastUsable = (broadcast - 1) >>> 0;
            const hosts = Math.pow(2, 32 - cidr) - 2;

            const numToIp = (num: number) => {
                return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join('.');
            };

            const numToBin = (num: number) => {
                return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255]
                    .map(b => b.toString(2).padStart(8, '0')).join('.');
            }

            setResult({
                network: numToIp(netAddr),
                broadcast: numToIp(broadcast),
                firstUsable: numToIp(firstUsable),
                lastUsable: numToIp(lastUsable),
                hosts: hosts > 0 ? hosts : 0,
                mask: numToIp(mask),
                binary: numToBin(ipNum),
                netBinary: numToBin(netAddr)
            });

        } catch (e) {
            alert("Calculation Error");
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">IP Addressing Master</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-6 rounded-xl space-y-6">
                    <h2 className="text-xl font-semibold text-slate-200">Configuration</h2>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">IP Address</label>
                        <input
                            type="text"
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                            placeholder="192.168.1.10"
                        />
                    </div>

                    <div className="p-4 bg-slate-800/30 rounded-lg border border-white/5 space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-slate-400">Required Hosts</label>
                                <span className="text-xs text-indigo-400">Auto-calculates CIDR</span>
                            </div>
                            <input
                                type="number"
                                value={hostsInput}
                                onChange={(e) => handleHostsChange(e.target.value)}
                                min="1"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono"
                                placeholder="e.g. 50"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-x-0 top-1/2 border-t border-slate-700/50"></div>
                            <div className="relative text-center">
                                <span className="bg-[#0f172a] px-2 text-xs text-slate-500">OR ADJUST MANUALY</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">CIDR (/{cidr})</label>
                            <input
                                type="range"
                                min="1"
                                max="32"
                                value={cidr}
                                onChange={(e) => handleCidrChange(Number(e.target.value))}
                                className="w-full accent-indigo-500"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1 font-mono">
                                <span>/1</span>
                                <span>/8</span>
                                <span>/16</span>
                                <span>/24</span>
                                <span>/32</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={calculateSubnet}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        Calculate
                    </button>
                </div>

                {result && (
                    <div className="glass-card p-6 rounded-xl space-y-4 font-mono text-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold text-white pointer-events-none">
                            /{cidr}
                        </div>
                        <h2 className="text-xl font-semibold text-slate-200 font-sans border-b border-white/10 pb-2">Result Analysis</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-slate-500 block text-xs uppercase">Network Address</span>
                                <span className="text-sky-400 text-base">{result.network}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs uppercase">Subnet Mask</span>
                                <span className="text-slate-300 text-base">{result.mask}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs uppercase">First Usable</span>
                                <span className="text-emerald-400 text-base">{result.firstUsable}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs uppercase">Last Usable</span>
                                <span className="text-emerald-400 text-base">{result.lastUsable}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs uppercase">Broadcast</span>
                                <span className="text-indigo-400 text-base">{result.broadcast}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-xs uppercase">Total Hosts</span>
                                <span className="text-white text-base font-bold">{result.hosts.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10">
                            <span className="text-slate-500 block text-xs uppercase mb-1">Binary Representation</span>
                            <div className="text-xs text-slate-400 break-all bg-black/30 p-2 rounded">
                                IP:  {result.binary} <br />
                                Net: {result.netBinary}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* IP Reference Guide */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span> IP Classes
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead>
                                <tr className="text-slate-500 border-b border-white/10">
                                    <th className="pb-2">Class</th>
                                    <th className="pb-2">Range</th>
                                    <th className="pb-2">Usage</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-300 font-mono">
                                <tr className="border-b border-white/5">
                                    <td className="py-2 text-indigo-400 font-bold">A</td>
                                    <td className="py-2">1.0.0.0 - 126.255.255.255</td>
                                    <td className="py-2 text-slate-500">Large Orgs</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="py-2 text-indigo-400 font-bold">B</td>
                                    <td className="py-2">128.0.0.0 - 191.255.255.255</td>
                                    <td className="py-2 text-slate-500">Medium Orgs</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="py-2 text-indigo-400 font-bold">C</td>
                                    <td className="py-2">192.0.0.0 - 223.255.255.255</td>
                                    <td className="py-2 text-slate-500">Small Networks</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="py-2 text-purple-400 font-bold">D</td>
                                    <td className="py-2">224.0.0.0 - 239.255.255.255</td>
                                    <td className="py-2 text-slate-500">Multicast</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-purple-400 font-bold">E</td>
                                    <td className="py-2">240.0.0.0 - 255.255.255.255</td>
                                    <td className="py-2 text-slate-500">Experimental</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Private Networks (RFC 1918)
                    </h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-800/50 rounded-lg border-l-2 border-emerald-500">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-emerald-400 font-mono font-bold">10.0.0.0/8</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Class A Private</span>
                            </div>
                            <p className="text-xs text-slate-400">10.0.0.0 - 10.255.255.255</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg border-l-2 border-emerald-500">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-emerald-400 font-mono font-bold">172.16.0.0/12</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Class B Private</span>
                            </div>
                            <p className="text-xs text-slate-400">172.16.0.0 - 172.31.255.255</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg border-l-2 border-emerald-500">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-emerald-400 font-mono font-bold">192.168.0.0/16</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Class C Private</span>
                            </div>
                            <p className="text-xs text-slate-400">192.168.0.0 - 192.168.255.255</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span> Cheat Sheet
                    </h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-slate-400">Loopback (Localhost)</span>
                            <span className="font-mono text-white">127.0.0.0/8</span>
                        </li>
                        <li className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-slate-400">APIPA (Link-Local)</span>
                            <span className="font-mono text-white">169.254.0.0/16</span>
                        </li>
                        <li className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-slate-400">Google DNS</span>
                            <div className="text-right">
                                <span className="font-mono text-sky-400 block">8.8.8.8</span>
                                <span className="font-mono text-sky-400 block text-xs">8.8.4.4</span>
                            </div>
                        </li>
                        <li className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-slate-400">Cloudflare DNS</span>
                            <div className="text-right">
                                <span className="font-mono text-amber-400 block">1.1.1.1</span>
                                <span className="font-mono text-amber-400 block text-xs">1.0.0.1</span>
                            </div>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-slate-400">Broadcast (Local)</span>
                            <span className="font-mono text-white">255.255.255.255</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
