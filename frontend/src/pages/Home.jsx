import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Zap, ShieldCheck, ScanLine, Users } from 'lucide-react';
import EventCard from '../components/EventCard';
import { eventService } from '../services/api';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const CITIES = ['DELHI', 'BANGALORE', 'CHENNAI', 'PUNE', 'KOLKATA', 'HYDERABAD', 'AHMEDABAD', 'MUMBAI'];

// Deterministic QR Placeholder (8x8 grid)
function QRPlaceholder() {
  const cells = Array.from({ length: 64 });
  return (
    <div className="grid grid-cols-8 gap-[2px] w-[96px] h-[96px] shrink-0 p-1.5 bg-[#1A1612]/40 rounded-lg border border-[rgba(245,166,35,0.2)]">
      {cells.map((_, i) => {
        const on = (i * 7 + (i % 3) * 11) % 4 !== 0;
        const corner =
          (i < 3 || ((i % 8) < 3 && i < 24)) ||
          (((i % 8) > 4) && i < 24) ||
          (i > 39 && (i % 8) < 3);
        return (
          <span
            key={i}
            className="rounded-[2px] aspect-square transition-all duration-300"
            style={{
              background: on || corner ? 'rgba(255,184,108,0.6)' : 'rgba(255,255,255,0.08)'
            }}
          />
        );
      })}
    </div>
  );
}

// CountUp Component for stats numbers
const CountUp = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  
  useEffect(() => {
    if (!inView) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);
  
  return <span ref={ref}>{count}{suffix}</span>;
};

// Skeleton Loader
const SkeletonLayout = () => (
  <div className="min-h-screen flex-grow flex flex-col justify-center items-center py-20 px-4 md:px-20 bg-transparent space-y-12">
    <div className="w-3/4 max-w-xl h-16 custom-skeleton" />
    <div className="w-1/2 max-w-md h-8 custom-skeleton" />
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
      <div className="h-80 custom-skeleton" />
      <div className="h-80 custom-skeleton" />
      <div className="h-80 custom-skeleton" />
    </div>
  </div>
);

const Home = () => {
  const [featuredEvents, setFeatured] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // 600ms page skeleton loader
    const timer = setTimeout(() => setPageLoading(false), 600);

    eventService.getAll({ upcomingOnly: 'true' })
      .then(data => setFeatured(data.slice(0, 3)))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    initial: {},
    animate: {
      transition: { staggerChildren: 0.1, delayChildren: 0.6 }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <AnimatePresence mode="wait">
      {pageLoading ? (
        <motion.div 
          key="skeleton" 
          exit={{ opacity: 0 }} 
          transition={{ duration: 0.3 }} 
          className="fixed inset-0 z-50 bg-transparent"
        >
          <SkeletonLayout />
        </motion.div>
      ) : (
        <motion.div 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col min-h-screen overflow-x-hidden text-[#FAF7F2] font-sans bg-transparent"
        >
          {/* ── HERO SECTION ── */}
          <motion.section 
            className="min-h-[90vh] flex items-center px-4 md:px-20 py-16 relative z-10"
            style={{ paddingTop: '80px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Animated grid lines */}
            <div className="hero-grid" />


            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              {/* Left Column */}
              <div className="lg:col-span-7 flex flex-col items-start space-y-6">
                {/* Announcement Badge */}
                <motion.div 
                  className="inline-flex items-center gap-2 bg-[rgba(255,184,108,0.1)] border border-[rgba(255,184,108,0.25)] text-[#FFB86C] text-xs px-3.5 py-1.5 rounded-full font-sans select-none"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB86C] animate-pulse" />
                  <span>New · Razorpay live · Door scanner v2</span>
                </motion.div>

                {/* H1 Heading */}
                <h1
                  className="font-extrabold leading-[1.1] tracking-tight font-display m-0 text-left"
                  style={{
                    fontSize: 'clamp(48px, 6.5vw, 84px)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  <motion.span
                    className="block"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    Campus events,
                  </motion.span>
                  <motion.span 
                    className="font-serif italic bg-gradient-to-r from-[#FFB86C] via-[#E9C46A] to-[#F4A261] -webkit-background-clip-text -webkit-text-fill-color-transparent bg-clip-text pr-2"
                    style={{ display: 'block', filter: 'drop-shadow(0 0 30px rgba(255,184,108,0.3))' }}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    automated end-to-end.
                  </motion.span>
                </h1>

                {/* Paragraph Description */}
                <motion.p 
                  className="text-[16px] leading-relaxed text-[rgba(250,247,242,0.6)] max-w-[480px] m-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Registration, checkout, QR tickets, door scanning and a live participant database — quietly handled, beautifully designed. Built for student bodies and college clubs.
                </motion.p>

                {/* CTA Buttons Row */}
                <motion.div 
                  className="flex items-center gap-4 pt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.65 }}
                >
                  <Link to="/events" className="no-underline">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-primary py-3 px-6 text-sm font-bold btn-shimmer"
                    >
                      Browse events ↗
                    </motion.button>
                  </Link>
                  <Link to="/register" className="no-underline">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-ghost py-3 px-6 text-sm"
                    >
                      Get started
                    </motion.button>
                  </Link>
                </motion.div>
              </div>

              {/* Right Column (Floating insights card) */}
              <div className="lg:col-span-5 flex justify-center items-center relative select-none">
                {/* Ambient glows behind */}
                <div className="absolute -inset-10 bg-[#FFB86C]/5 rounded-[3.5rem] blur-3xl z-0 pointer-events-none" />

                <motion.div 
                  className="w-full max-w-[420px] bg-white/[0.06] border border-white/10 rounded-2xl p-6 backdrop-blur-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative z-10"
                  initial={{ opacity: 0, x: 60, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0, 
                    scale: 1,
                    y: [0, -10, 0]
                  }}
                  transition={{
                    opacity: { duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                    x: { duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                    scale: { duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                    y: { duration: 4, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 1.2 }
                  }}
                >
                  <div className="text-[#FFB86C] text-[10px] tracking-[0.12em] font-[700] mb-6 uppercase">
                    LIVE PLATFORM INSIGHTS
                  </div>
                  <motion.div 
                    className="space-y-1"
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                  >
                    {[
                      { prefix: '01', metric: '1,200+ Active Events', desc: 'Managed across student hubs' },
                      { prefix: '02', metric: '50,000+ Tickets Issued', desc: 'Secure blockchain-grade passes' },
                      { prefix: '03', metric: '98% Check-in Success', desc: 'Via our offline door scanner' },
                      { prefix: '04', metric: 'Real-time Event Discovery', desc: 'Instant updates for attendees' }
                    ].map((row, idx, arr) => (
                      <motion.div
                        key={idx}
                        variants={itemVariants}
                        className={`flex items-start gap-4 py-3 ${
                          idx !== arr.length - 1 ? 'border-b border-white/[0.06]' : ''
                        }`}
                      >
                        <span className="text-[rgba(250,247,242,0.3)] text-[11px] font-mono mt-0.5">{row.prefix}</span>
                        <div>
                          <div className="text-[#FAF7F2] text-[15px] font-[600]">{row.metric}</div>
                          <div className="text-[rgba(250,247,242,0.4)] text-[11px] font-sans mt-0.5">{row.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* ── TESTIMONIAL BANNER ── */}
          <motion.div 
            className="w-full border-y border-white/[0.06] bg-white/[0.01] py-8 text-center select-none backdrop-blur-md relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-[14px] text-[rgba(250,247,242,0.7)] max-w-2xl mx-auto italic font-serif">
              "CampusPass completely changed how we handle college fests. We went from chaotic spreadsheets to scanning 2,000+ attendees seamlessly at the door."
            </p>
            <div className="text-[11px] text-[rgba(250,247,242,0.4)] mt-3 font-sans tracking-widest uppercase">
              — Cultural Council, NIT
            </div>
          </motion.div>

          {/* ── STATS BAR ── */}
          <section 
            className="px-4 md:px-20 py-10 relative z-10 select-none overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            {/* Top gradient border overlay */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-[linear-gradient(90deg,transparent,rgba(255,184,108,0.3),transparent)]" />
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
              {/* DEMO_STATS: Wire these from a context or API later */}
              {[
                { end: 10, suffix: 'k+', label: 'TICKETS ISSUED', desc: 'Verified & active passes' },
                { end: 500, suffix: '+', label: 'ANNUAL EVENTS', desc: 'Across tech, culture & sports' },
                { end: 99, suffix: '.8%', label: 'CHECK-IN RATE', desc: 'Seamless gate entry scans' },
                { end: 15, suffix: '+', label: 'HOST CLUBS', desc: 'Coordinated student hubs' }
              ].map((stat, i, arr) => (
                <motion.div
                  key={i}
                  className={`flex flex-col items-center md:items-start text-center md:text-left md:px-8 ${
                    i !== arr.length - 1 ? 'md:border-r md:border-white/[0.08]' : ''
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div 
                    className="font-sans"
                    style={{
                      background: 'linear-gradient(135deg, #FFB86C, #E9C46A)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontSize: '42px',
                      fontWeight: '800',
                      lineHeight: '1',
                      filter: 'drop-shadow(0 0 20px rgba(255,184,108,0.4))'
                    }}
                  >
                    <CountUp end={stat.end} suffix={stat.suffix} />
                  </div>
                  <div className="text-[#FAF7F2] text-[11px] font-[600] tracking-[0.08em] uppercase mt-2">
                    {stat.label}
                  </div>
                  <div className="text-[rgba(250,247,242,0.4)] text-xs mt-1">
                    {stat.desc}
                  </div>
                  <div className="text-[#c8a96e] text-[11px] mt-0.5">
                    across all campuses
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── CITY TICKER ── */}
          <div className="ticker-wrapper select-none z-10 relative">
            <div className="ticker-track">
              {[...CITIES, ...CITIES, ...CITIES, ...CITIES].map((city, idx) => (
                <span key={idx} className="inline-flex items-center">
                  <span className="ticker-item">{city}</span>
                  <span className="ticker-dot">•</span>
                </span>
              ))}
            </div>
          </div>

          <hr className="section-divider" />

          {/* ── UPCOMING EVENTS ── */}
          <section className="max-w-7xl mx-auto px-4 md:px-20 py-20 relative z-10">
            <motion.div 
              className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <div className="text-[#FFB86C] text-xs font-[600] tracking-[0.2em] uppercase font-sans mb-2">
                  // ON SALE NOW
                </div>
                <h2 className="text-3xl sm:text-[48px] font-extrabold text-[#FAF7F2] font-display m-0 leading-tight">
                  Upcoming on campus.
                </h2>
              </div>
              <Link
                to="/events"
                className="text-[#FFB86C] hover:underline text-sm font-semibold no-underline flex items-center gap-1 select-none"
              >
                <span>View all</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-80 rounded-2xl skeleton" />
                ))}
              </div>
            ) : featuredEvents.length === 0 ? (
              <div className="custom-card p-12 text-center select-none">
                <p className="text-[rgba(250,247,242,0.5)] text-sm font-sans m-0">No upcoming events. Be the first to host one.</p>
                <Link to="/admin" className="no-underline inline-block mt-6">
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary text-xs font-bold uppercase"
                  >
                    Host Portal →
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 50, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ 
                      duration: 0.5,
                      delay: index * 0.12,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="w-full flex"
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <hr className="section-divider" />

          {/* ── TICKET FEATURE SECTION ── */}
          <section className="max-w-7xl mx-auto px-4 md:px-20 py-20 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12 items-center">
              {/* Left Side */}
              <motion.div 
                className="flex flex-col justify-center space-y-6"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="text-[#FFB86C] text-[11px] tracking-[0.1em] font-semibold uppercase font-sans">
                  // THE TICKET
                </div>
                <h2 className="text-4xl sm:text-[52px] font-extrabold text-[#FAF7F2] font-display m-0 leading-none">
                  One tap. <span className="font-serif italic text-gradient-orange-sand pr-2">You're in.</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  {[
                    { icon: Zap, title: 'Instant checkout', desc: 'Razorpay-powered, test mode ready' },
                    { icon: ShieldCheck, title: 'Unique QR per pass', desc: 'Refreshes on every view, anti-fraud' },
                    { icon: ScanLine, title: 'One-tap door scan', desc: 'Offline-first, syncs on reconnect' },
                    { icon: Users, title: 'Live participant database', desc: 'Real-time roster' }
                  ].map(({ icon: Icon, title, desc }, index) => (
                    <motion.div 
                      key={title} 
                      className="flex gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-[#FFB86C]/10 border border-[#FFB86C]/20">
                        <Icon className="w-4 h-4 text-[#FFB86C]" />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-[#FAF7F2] m-0 font-sans">{title}</h4>
                        <p className="text-[13px] text-[rgba(250,247,242,0.55)] mt-1.5 leading-relaxed m-0 font-sans">{desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right Side (Ticket Demo Card) */}
              <motion.div 
                className="flex justify-center select-none font-sans"
                initial={{ opacity: 0, x: 40, rotate: 2 }}
                whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <motion.div 
                  className="w-full max-w-[360px] bg-gradient-to-br from-[#FFB86C]/10 to-[#E9C46A]/5 border border-[rgba(245,166,35,0.25)] rounded-2xl p-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.5),_0_0_40px_rgba(244,162,97,0.08)] flex flex-col relative overflow-hidden"
                  animate={{ rotate: [-1, 1, -1] }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  {/* Pulsing Status */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[#c8a96e] text-[11px] tracking-[0.1em] font-mono font-bold uppercase">
                      ADMIT ONE
                    </span>
                    <span className="text-[#8AC926] text-[11px] font-bold flex items-center gap-1 font-mono">
                      LIVE <span className="w-1.5 h-1.5 rounded-full bg-[#8AC926] animate-pulse" />
                    </span>
                  </div>

                  {/* Event title */}
                  <h3 className="text-[#FAF7F2] text-[22px] font-bold m-0 tracking-tight">
                    HackSummit 2026
                  </h3>

                  <div className="my-5 border-t border-dashed border-white/[0.1]" />

                  {/* Info Columns */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'DATE', val: 'Jun 24' },
                      { label: 'SEAT', val: 'QA - 04' },
                      { label: 'YEAR', val: '2026' }
                    ].map((c) => (
                      <div key={c.label}>
                        <div className="text-[#c8a96e] text-[11px] font-bold tracking-[0.1em] uppercase font-mono">{c.label}</div>
                        <div className="text-[#FAF7F2] text-[15px] font-[600] mt-1 tabular-nums">{c.val}</div>
                      </div>
                    ))}
                  </div>

                  <div className="my-5 border-t border-dashed border-white/[0.1]" />

                  {/* QR and Footer Row */}
                  <div className="flex items-center gap-4">
                    <QRPlaceholder />
                    <div className="flex-1 min-w-0">
                      <span className="text-[rgba(250,247,242,0.4)] text-[12px] font-mono block select-none truncate">
                        CP-HACK-SAND-904
                      </span>
                      <span className="text-[11px] text-[rgba(250,247,242,0.4)] block mt-1 font-sans">
                        Refresh rate: 30s
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Home;
