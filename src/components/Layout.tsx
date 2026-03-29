import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UploadCloud, LogOut, Home, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';

export default function Layout({ setAuth }: { setAuth: (val: boolean) => void }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Members', path: '/dashboard/members', icon: Users },
    { name: 'Upload', path: '/dashboard/upload', icon: UploadCloud },
  ];

  return (
    <div className="flex h-screen bg-transparent">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 w-64 bg-white/90 backdrop-blur-md border-r border-slate-200 flex flex-col z-50 transform transition-transform duration-200 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">CareVault</span>
          </div>
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <Link
            to="/"
            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors mb-4 border border-slate-200"
          >
            <Home className="mr-3 h-5 w-5 text-slate-400" />
            Back to Home
          </Link>
          
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Menu</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-indigo-700" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-slate-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-30">
          <div className="flex items-center">
            <button 
              className="mr-4 md:hidden p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800 truncate">
              {navItems.find(item => item.path === location.pathname)?.name || 'CareVault'}
            </h1>
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-700 leading-none">{user?.name || 'User'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setIsProfileOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
