import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Ticket, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from './Toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    navigate('/');
    logout();
    setToastMessage('Successfully logged out');
    setIsMenuOpen(false);
  };

  const navLinks = user
    ? user.role === 'admin'
      ? [
          { name: 'Dashboard', path: '/admin' },
          { name: 'Analytics', path: '/analytics' },
          { name: 'Scanner', path: '/scanner' },
          { name: 'Events', path: '/events' },
        ]
      : [
          { name: 'Home', path: '/' },
          { name: 'Events', path: '/events' },
          { name: 'My Tickets', path: '/my-tickets' },
        ]
    : [
        { name: 'Home', path: '/' },
        { name: 'Events', path: '/events' },
      ];

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : '';

  const navVariants = {
    hero: {
      width: "95%",
      maxWidth: "1600px",
      height: "84px",
      borderRadius: "28px",
      paddingLeft: "32px",
      paddingRight: "32px",
      background: "rgba(13, 20, 18, 0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(16, 185, 129, 0.12)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      y: 16,
    },
    compact: {
      width: isMobile ? "95%" : "72%",
      maxWidth: "1000px",
      height: "62px",
      borderRadius: "999px",
      paddingLeft: isMobile ? "16px" : "24px",
      paddingRight: isMobile ? "16px" : "24px",
      background: "rgba(13, 20, 18, 0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(16, 185, 129, 0.18)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
      y: 16,
    }
  };

  const innerVariants = {
    hero: { scale: 1 },
    compact: { scale: 0.95 }
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 mx-auto"
      style={{
        isolation: 'isolate',
        willChange: 'transform, width, height, opacity, backdrop-filter',
      }}
      variants={navVariants}
      initial="hero"
      animate={scrolled ? "compact" : "hero"}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        variants={{
          hero: { borderRadius: "28px", opacity: 0.7 },
          compact: { borderRadius: "999px", opacity: 1 }
        }}
        initial="hero"
        animate={scrolled ? "compact" : "hero"}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'radial-gradient(circle at center, rgba(16,185,129,0.06), transparent 75%)',
          zIndex: -1,
        }}
      />
      <motion.div
        className="flex items-center justify-between w-full h-full"
        variants={innerVariants}
        initial="hero"
        animate={scrolled ? "compact" : "hero"}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'center center', willChange: 'transform' }}
      >
      {/* Logo (Left) */}
      <Link to="/" className="flex items-center no-underline select-none group">
        <motion.span 
          whileHover={{ scale: 1.2, boxShadow: '0 0 15px rgba(16,185,129,0.8)' }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="w-2.5 h-2.5 rounded-full bg-[#10B981] mr-2 logo-dot" 
          style={{boxShadow: '0 0 10px rgba(16,185,129,0.5)'}} 
        />
        <motion.span 
          whileHover={{ letterSpacing: '0.12em' }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-[#FAF7F2] font-[800] text-[14px] tracking-[0.1em] uppercase font-display"
        >
          CAMPUSPASS
        </motion.span>
        <span className="text-white/20 ml-1.5 font-sans font-medium group-hover:text-[#10B981]/40 transition-colors duration-300">//</span>
      </Link>

      {/* Nav Links (Center - Desktop) — capsule pill indicator */}
      <div
        className="hidden md:flex items-center"
        style={{ gap: '4px' }}
      >
        {navLinks.map((link) => {
          const active = isActive(link.path);
          return (
              <Link
              key={link.name}
              to={link.path}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 16px',
                borderRadius: '999px',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                color: active ? '#10B981' : 'rgba(250, 247, 242, 0.55)',
                fontWeight: active ? 600 : 500,
                fontSize: '14px',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#10B981';
                  e.currentTarget.style.textShadow = '0 0 12px rgba(16,185,129,.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'rgba(250, 247, 242, 0.55)';
                  e.currentTarget.style.textShadow = 'none';
                }
              }}
            >
              {active && (
                <motion.div
                  layoutId="navPill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'transparent',
                    border: '1px solid #10B981',
                    borderRadius: '999px',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              {!active && (
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255,255,255,0)',
                    borderRadius: '999px',
                  }}
                  whileHover={{ background: 'rgba(16,185,129,0.06)', boxShadow: '0 0 15px rgba(16,185,129,0.08)' }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <motion.span 
                style={{ position: 'relative', zIndex: 1 }}
                whileHover={{ y: active ? 0 : -1 }}
                transition={{ duration: 0.2 }}
              >
                {link.name}
              </motion.span>
            </Link>
          );
        })}
      </div>

      {/* Right Side (User Info / Logout - Desktop & Mobile Action) */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Desktop User Panel */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right leading-tight">
                <div className="text-[#FAF7F2] text-[13px] font-[600] capitalize">
                  {user.name}
                </div>
                <div className={`text-[10px] font-[600] uppercase tracking-[0.08em] mt-0.5 ${user.role === 'admin' ? 'text-[#10B981]' : 'text-[#059669]'}`}>
                  {user.role}
                </div>
              </div>

              {/* Avatar Circle */}
              <motion.div 
                whileHover={{ scale: 1.08, y: -2, boxShadow: '0 5px 25px rgba(16,185,129,0.5), inset 0 0 10px rgba(255,255,255,0.4)' }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#10B981] to-[#34D399] text-[#0A0A0A] font-[800] text-[15px] flex items-center justify-center select-none cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)] border border-[#0A0A0A] ring-2 ring-[#10B981]"
              >
                {initials}
              </motion.div>

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                title="Logout"
                whileHover={{ y: -1, backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.4)' }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  color: 'rgba(250, 247, 242, 0.75)'
                }}
                className="py-2 px-3 flex items-center justify-center rounded-full transition-colors hover:text-[#10B981]"
              >
                <LogOut size={16} className="text-[#10B981]" />
              </motion.button>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-3">
              <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#10B981] to-[#34D399] text-[#0A0A0A] font-[700] text-[12px] flex items-center justify-center select-none">
                {initials}
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[rgba(250,247,242,0.75)] hover:text-[#10B981] p-1.5 focus:outline-none bg-transparent border-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </>
        ) : (
          /* Guest Actions */
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[14px] font-[500] text-[rgba(250,247,242,0.55)] hover:text-[#FAF7F2] no-underline transition-colors"
            >
              Sign in
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary text-xs py-2 px-4 rounded-lg font-bold btn-shimmer"
              >
                Get started
              </motion.button>
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-[rgba(250,247,242,0.75)] hover:text-[#10B981] p-1.5 focus:outline-none ml-1 bg-transparent border-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}
      </div>

      </motion.div>

      {/* Mobile Menu Dropdown Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[64px] left-0 right-0 bg-[rgba(13,20,18,0.97)] backdrop-blur-[20px] border-b border-white/[0.08] flex flex-col p-4 gap-3 md:hidden"
          >
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-[14px] font-[500] no-underline transition-colors py-2 px-3 rounded-lg ${
                    active
                      ? 'text-[#10B981] bg-white/[0.06] font-[600]'
                      : 'text-[rgba(250,247,242,0.65)] hover:text-[#FAF7F2]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            {user && (
              <div className="border-t border-white/[0.06] mt-2 pt-3 flex justify-between items-center px-3">
                <div>
                  <div className="text-[#FAF7F2] text-[13px] font-[600] capitalize">
                    {user.name}
                  </div>
                  <div className={`text-[10px] font-[600] uppercase tracking-[0.08em] mt-0.5 ${user.role === 'admin' ? 'text-[#10B981]' : 'text-[#059669]'}`}>
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-1.5 text-[rgba(250,247,242,0.75)] hover:text-[#10B981] font-bold text-xs p-2 bg-transparent border-none"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </motion.nav>

      <Toast 
        message={toastMessage} 
        type="success" 
        onClose={() => setToastMessage(null)} 
      />
    </>
  );
};

export default Navbar;
