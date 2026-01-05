import { Link, Outlet, useLocation } from 'react-router-dom';

export function Layout() {
    const location = useLocation();

    return (
        <div className="min-h-screen text-slate-200 selection:bg-indigo-500/30">
            <header className="fixed top-0 w-full z-50 glass border-b-0 border-white/5">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Alerzen Networks
                        </h1>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                            Hub
                        </Link>
                        <Link to="/monitor" className={`text-sm font-medium transition-colors ${location.pathname === '/monitor' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                            Monitor
                        </Link>
                        <Link to="/ip-tools" className={`text-sm font-medium transition-colors ${location.pathname === '/ip-tools' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                            IP Tools
                        </Link>
                        <Link to="/snmp-tools" className={`text-sm font-medium transition-colors ${location.pathname === '/snmp-tools' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                            SNMP
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4 hidden md:flex">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-medium text-emerald-400 tracking-wider uppercase">System Active</span>
                    </div>
                </div>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}
