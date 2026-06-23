import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Custom icons to avoid external svg loader issues
const Twitter = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Github = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Footer = () => {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);

  const productLinks = [
    { label: 'Events', to: '/events' },
    { label: 'Admin Console', to: '/admin' },
    { label: 'Scanner', to: '/scanner' },
    { label: 'Analytics', to: '/analytics' },
  ];

  const accountLinks = user
    ? user.role === 'admin'
      ? [{ label: 'Events', to: '/events' }]
      : [
          { label: 'My Dashboard', to: '/my-tickets' },
          { label: 'Browse Events', to: '/events' },
        ]
    : [
        { label: 'Login', to: '/login' },
        { label: 'Register', to: '/register' },
      ];

  const categoryLinks = [
    { label: 'Technical', to: '/events?category=technical' },
    { label: 'Cultural', to: '/events?category=cultural' },
    { label: 'Sports', to: '/events?category=sports' },
    { label: 'Academic', to: '/events?category=academic' },
  ];

  return (
    <footer 
      className="px-4 md:px-20 py-16 mt-auto relative z-0"
      style={{
        background: 'rgba(11, 11, 13, 0.4)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 184, 108, 0.08)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
          {/* Column 1 — Brand */}
          <div className="flex flex-col items-start">
            <Link to="/" className="flex items-center no-underline select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB86C] mr-2" style={{boxShadow: '0 0 10px rgba(255,184,108,0.5)'}} />
              <span className="text-[#FAF7F2] font-[800] text-[14px] tracking-[0.1em] uppercase font-display">
                CAMPUSPASS
              </span>
              <span className="text-white/25 ml-1.5 font-sans font-medium">//</span>
            </Link>
            <p className="text-[rgba(250,247,242,0.45)] text-[13px] line-height-[1.6] mt-3 max-w-[240px]">
              Event infrastructure for the next generation of college communities.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { Icon: Twitter, url: 'https://twitter.com' },
                { Icon: Github, url: 'https://github.com' },
                { Icon: Instagram, url: 'https://instagram.com' },
              ].map(({ Icon, url }, i) => (
                <motion.a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-white/[0.1] rounded-lg text-[rgba(250,247,242,0.4)] hover:border-[#FFB86C] hover:text-[#FFB86C] hover:bg-[rgba(255,184,108,0.06)] hover:shadow-[0_0_12px_rgba(255,184,108,0.15)] flex items-center justify-center transition-all duration-200"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 2 — PRODUCT */}
          <div>
            <h4 className="text-[rgba(250,247,242,0.3)] text-[11px] font-[600] tracking-[0.1em] uppercase mb-4">
              PRODUCT
            </h4>
            <ul className="flex flex-col gap-3 p-0 m-0 list-none text-[14px]">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[rgba(250,247,242,0.55)] no-underline transition-all duration-200 hover:text-[#FAF7F2] hover:pl-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — ACCOUNT */}
          <div>
            <h4 className="text-[rgba(250,247,242,0.3)] text-[11px] font-[600] tracking-[0.1em] uppercase mb-4">
              ACCOUNT
            </h4>
            <ul className="flex flex-col gap-3 p-0 m-0 list-none text-[14px]">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[rgba(250,247,242,0.55)] no-underline transition-all duration-200 hover:text-[#FAF7F2] hover:pl-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — NEWSLETTER */}
          <div>
            <h4 className="text-[rgba(250,247,242,0.3)] text-[11px] font-[600] tracking-[0.1em] uppercase mb-4">
              NEWSLETTER
            </h4>
            <p className="text-[13px] text-[rgba(250,247,242,0.55)] mb-3">
              Get the latest updates on campus events.
            </p>
            {subscribed ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#8AC926]/10 border border-[#8AC926]/20 p-2.5 rounded-lg text-center"
              >
                <span className="text-[#8AC926] text-sm font-semibold flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Subscribed!
                </span>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-white/[0.03] border border-white/10 text-white text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-[#FFB86C] transition-colors"
                />
                <motion.button 
                  onClick={() => setSubscribed(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#FFB86C] text-[#1A1612] font-semibold px-3 py-2 rounded-lg text-sm"
                >
                  Join
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-[rgba(250,247,242,0.25)] text-[12px]">
            © 2026 CampusPass Ticketing Co.
          </span>
          <span className="text-[rgba(250,247,242,0.25)] text-[12px] flex items-center gap-2">
            Made for the campus.
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB86C] shadow-[0_0_8px_rgba(255,184,108,1)]"></span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
