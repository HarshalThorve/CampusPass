import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Calendar, User, LayoutDashboard, BarChart3, ScanLine } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = user
    ? user.role === 'admin'
      ? [
          { name: 'DASHBOARD', path: '/admin', icon: LayoutDashboard },
          { name: 'ANALYTICS', path: '/analytics', icon: BarChart3 },
          { name: 'SCANNER', path: '/scanner', icon: ScanLine },
          { name: 'EVENTS', path: '/events', icon: Calendar }
        ]
      : [
          { name: 'HOME', path: '/', icon: Calendar },
          { name: 'EVENTS', path: '/events', icon: Calendar },
          { name: 'MY TICKETS', path: '/dashboard', icon: User }
        ]
    : [
        { name: 'HOME', path: '/', icon: Calendar },
        { name: 'EVENTS', path: '/events', icon: Calendar }
      ];

  return (
    <nav className="sticky top-0 z-40 bg-surface-950/90 backdrop-blur-xl border-b border-dark-500/15 transition-all duration-300 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-neon group-hover:shadow-neon-strong transition-shadow duration-300"></span>
              <span className="font-mono font-bold text-sm tracking-[0.2em] text-dark-100 uppercase">
                Campus<span className="text-dark-300">//</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-4 py-2 text-[11px] font-mono font-medium tracking-[0.15em] text-dark-300 hover:text-lime-400 transition-colors duration-300 uppercase"
              >
                {link.name}
              </Link>
            ))}

            {/* User Profile & Auth */}
            {user ? (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-dark-500/20">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-medium text-dark-200">{user.name}</span>
                  <span className="text-[10px] font-mono text-dark-400 uppercase tracking-wider">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-dark-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-dark-500/20">
                <Link
                  to="/login"
                  className="text-[11px] font-mono font-medium tracking-[0.15em] text-dark-300 hover:text-dark-100 transition-colors uppercase"
                >
                  SIGN IN
                </Link>
                <Link to="/register" className="btn-primary px-5 py-2 text-[11px]">
                  HOST EVENT →
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-dark-300 hover:text-lime-400 hover:bg-surface-400/50 transition-all duration-300"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-dark-500/15 bg-surface-950/95 backdrop-blur-xl">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-mono font-medium text-dark-300 hover:text-lime-400 hover:bg-surface-400/30 transition-all duration-300 tracking-wider uppercase"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {user ? (
              <div className="pt-4 pb-2 border-t border-dark-500/15 mt-3 px-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-dark-200">{user.name}</div>
                  <div className="text-xs font-mono text-dark-400 capitalize tracking-wider">{user.role}</div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-1 text-rose-400 hover:text-rose-300 font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 pb-2 border-t border-dark-500/15 mt-3 px-3 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-mono text-dark-200 hover:text-lime-400 transition-colors uppercase tracking-wider"
                >
                  SIGN IN
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center btn-primary py-2.5 text-xs"
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
