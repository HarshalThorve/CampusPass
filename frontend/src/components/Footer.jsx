import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-950 border-t border-dark-500/10 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center space-x-2 group w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-neon group-hover:shadow-neon-strong transition-shadow"></span>
              <span className="font-mono font-bold text-sm tracking-[0.2em] text-dark-100 uppercase">
                Campus<span className="text-dark-400">//</span>
              </span>
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed max-w-xs">
              Event infrastructure for the next generation of college communities.
            </p>
          </div>

          {/* Product */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[11px] font-mono font-bold text-dark-200 uppercase tracking-[0.2em]">Product</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'EVENTS', to: '/events' },
                { label: 'TICKETS', to: '/dashboard' },
                { label: 'SCANNER', to: '/scanner' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs font-mono text-dark-400 hover:text-lime-400 transition-colors tracking-wider uppercase"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[11px] font-mono font-bold text-dark-200 uppercase tracking-[0.2em]">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'LOGIN', to: '/login' },
                { label: 'REGISTER', to: '/register' },
                { label: 'DASHBOARD', to: '/admin' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs font-mono text-dark-400 hover:text-lime-400 transition-colors tracking-wider uppercase"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[11px] font-mono font-bold text-dark-200 uppercase tracking-[0.2em]">Categories</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'TECHNICAL', filter: 'technical' },
                { label: 'CULTURAL', filter: 'cultural' },
                { label: 'SPORTS', filter: 'sports' },
                { label: 'ACADEMIC', filter: 'academic' },
              ].map((item) => (
                <li key={item.filter}>
                  <Link
                    to={`/events?category=${item.filter}&upcomingOnly=true`}
                    className="text-xs font-mono text-dark-400 hover:text-lime-400 transition-colors tracking-wider uppercase"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-dark-500/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-mono text-dark-500 tracking-wider uppercase">
            © {currentYear} CampusPass Ticketing Co.
          </p>
          <p className="text-[11px] font-mono text-dark-500 tracking-wider uppercase">
            Made for the campus.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
