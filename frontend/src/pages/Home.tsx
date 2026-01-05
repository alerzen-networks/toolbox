import { Link } from 'react-router-dom';

export function Home() {
    return (
        <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-6 py-2">
                    Alerzen Networks Toolkit
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    A suite of professional network diagnostics and monitoring tools for the modern engineer.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Uptime Monitor Card */}
                <Link to="/monitor" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-indigo-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Uptime Monitor</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Track HTTP, ICMP, and SSL status with detailed history and alerts.
                        </p>
                    </div>
                </Link>

                {/* IP Tool Card */}
                <Link to="/ip-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-sky-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-emerald-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">IP Master Tool</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Subnet calculator, CIDR visualizer.
                        </p>
                    </div>
                </Link>

                {/* DNS Tool Card */}
                <Link to="/dns-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-amber-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">DNS Detective</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Deep records lookup & global propagation check.
                        </p>
                    </div>
                </Link>

                {/* Port Tool Card */}
                <Link to="/port-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-pink-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Port Scanner</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Multi-threaded TCP scanner for common services.
                        </p>
                    </div>
                </Link>

                {/* MAC Tool Card */}
                <Link to="/mac-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-cyan-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">MAC Lookup</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Identify manufacturer from OUI address.
                        </p>
                    </div>
                </Link>

                {/* Latency Tool Card */}
                <Link to="/latency-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500/20 to-green-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-lime-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center shadow-lg shadow-lime-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Global Latency</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Real-time latency heatmap from major cloud regions.
                        </p>
                    </div>
                </Link>

                {/* SNMP Tool Card */}
                <Link to="/snmp-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-orange-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                {/* Overlay a signal icon or similar if desired, reusing generic info icon for now but colored differently */}
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">SNMP Suite</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Manager (Browser) & embedded Agent.
                        </p>
                    </div>
                </Link>

                {/* Speed Test Card */}
                <Link to="/speed-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-violet-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Speed Test</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Bandwidth test for the Alerzen Networks server.
                        </p>
                    </div>
                </Link>

                {/* SSL Tool Card */}
                <Link to="/ssl-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-teal-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">SSL Inspector</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Check certificate expiry, issuer, and validity.
                        </p>
                    </div>
                </Link>

                {/* Whois Tool Card */}
                <Link to="/whois-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-sky-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-cyan-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Whois Lookup</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Domain registration and ownership details.
                        </p>
                    </div>
                </Link>

                {/* Subnet Tool Card */}
                <Link to="/subnet-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-indigo-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Subnet Scanner</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Discover active devices on your local network.
                        </p>
                    </div>
                </Link>

                {/* Security Grade Tool Card */}
                <Link to="/security-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-rose-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Security Grader</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Analyze HTTP headers and score your security posture.
                        </p>
                    </div>
                </Link>

                {/* Blacklist Tool Card */}
                <Link to="/blacklist-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-500/20 to-gray-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-slate-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-lg shadow-slate-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Blacklist Monitor</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Check if your IP is flagged on Spamhaus or other lists.
                        </p>
                    </div>
                </Link>

                {/* Zscaler Tool Card */}
                <Link to="/zscaler-tools" className="group relative block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50 group-hover:opacity-100"></div>
                    <div className="relative h-full glass-card p-6 rounded-2xl border border-white/10 group-hover:border-blue-500/50 transition-all flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Zscaler Diagnostics</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            ZDX Score, Tunnel Status, and Map Visualization.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
