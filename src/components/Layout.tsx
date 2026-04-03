import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Users, BookOpen, LogOut, Menu, X, Receipt } from 'lucide-react';
import clsx from 'clsx';

const Layout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Students & Fees', icon: Users, path: '/students' },
    { name: 'Registers', icon: BookOpen, path: '/registers' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-200">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">Achievers</span>
        </div>
        <button 
          onClick={toggleMenu}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar / Mobile Menu Overlay */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-40 w-[280px] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col shadow-2xl md:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="px-8 py-8 flex items-center justify-between md:justify-start">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">Achievers</h1>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">Academy</p>
              </div>
            </div>
            {/* Mobile close button inside sidebar */}
            <button onClick={closeMenu} className="md:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 md:py-4 space-y-1.5">
            {navigation.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={closeMenu}
                  className={clsx(
                    "group flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]",
                    active 
                      ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-50" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={clsx(
                    "w-5 h-5 mr-3 transition-colors",
                    active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-100 mb-safe">
            <button
              onClick={() => {
                closeMenu();
                logout();
              }}
              className="w-full flex items-center px-4 py-3.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full md:h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-20 md:pb-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
