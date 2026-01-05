import { Link, Outlet, useLocation } from 'react-router-dom';

export function Layout() {
    const location = useLocation();

    return (
        <div className="min-h-screen text-slate-800 selection:bg-cyan-500/30">
            <header className="fixed top-0 w-full z-50 glass border-b-0">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <img src="/logo.png" alt="Alerzen Logo" className="w-14 h-14 object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                            Alerzen Networks
                        </h1>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
                            Hub
                        </Link>
                        <Link to="/monitor" className={`text-sm font-medium transition-colors ${location.pathname === '/monitor' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
                            Monitor
                        </Link>
                        <Link to="/ip-tools" className={`text-sm font-medium transition-colors ${location.pathname === '/ip-tools' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
                            IP Tools
                        </Link>
                        <Link to="/snmp-tools" className={`text-sm font-medium transition-colors ${location.pathname === '/snmp-tools' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
                            SNMP
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4 hidden md:flex">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </span>
                        <span className="text-xs font-medium text-cyan-600 tracking-wider uppercase">System Active</span>
                    </div>
                </div>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}
