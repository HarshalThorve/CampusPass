import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
import EventCard from '../components/EventCard';
import { ArrowRight, Check } from 'lucide-react';

const MARQUEE_ITEMS = [
  'MUMBAI', 'DELHI', 'BANGALORE', 'HYDERABAD', 'CHENNAI', 'PUNE', 'KOLKATA', 'AHMEDABAD',
  'MUMBAI', 'DELHI', 'BANGALORE', 'HYDERABAD', 'CHENNAI', 'PUNE', 'KOLKATA', 'AHMEDABAD',
];

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await eventService.getAll({ upcomingOnly: 'true' });
        setFeaturedEvents(data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured events:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="flex-1 bg-surface-950">

      {/* ═══ HERO SECTION ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-24 pb-28 md:pt-36 md:pb-44">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-glow-magenta pointer-events-none"></div>
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-glow-top pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-light text-dark-100 leading-[1.05] max-w-4xl">
            Campus events,{' '}
            <span className="italic font-normal text-lime-400" style={{ textShadow: '0 0 40px rgba(140,255,20,0.2)' }}>
              automated end-to-end.
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-dark-400 max-w-2xl leading-relaxed">
            Registration, Razorpay checkout, QR Tickets, door scanning, and a live participant database. Built for student bodies and college clubs.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/events" className="btn-primary px-8 py-3.5 text-xs">
              BROWSE EVENTS
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 text-dark-300 hover:text-dark-100 transition-colors group"
            >
              <span className="w-10 h-10 rounded-full border border-dark-500/30 flex items-center justify-center group-hover:border-lime-400/50 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-sm font-mono tracking-wider uppercase">GET STARTED</span>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="mt-20 pt-8 border-t border-dark-500/15 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl">
            {[
              { value: '10k+', label: 'TICKETS ISSUED' },
              { value: '500+', label: 'ANNUAL EVENTS' },
              { value: '99.8%', label: 'CHECKIN RATE' },
              { value: '15+', label: 'HOST CLUBS' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-display font-bold text-dark-100">{stat.value}</p>
                <p className="text-[10px] font-mono text-dark-500 mt-1.5 tracking-[0.2em] uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCROLLING MARQUEE BAR ═══════════════════════════════ */}
      <section className="border-y border-dark-500/10 bg-surface-900/50 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {MARQUEE_ITEMS.map((city, i) => (
            <span key={i} className="flex items-center mx-8 text-sm font-mono tracking-[0.25em] text-dark-400 uppercase">
              {city}
              <span className="ml-8 text-lime-400 text-lg">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ═══ FEATURED EVENTS ════════════════════════════════════ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[11px] font-mono text-lime-400 tracking-[0.2em] uppercase mb-3">// ON SALE NOW</p>
            <h2 className="text-4xl md:text-5xl font-display font-light text-dark-100">
              Upcoming on campus.
            </h2>
          </div>
          <Link
            to="/events"
            className="hidden sm:flex items-center space-x-1 text-xs font-mono text-dark-400 hover:text-lime-400 transition-colors tracking-wider uppercase"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl border border-dark-500/15 bg-surface-400/30 p-5 flex flex-col space-y-4">
                <div className="h-44 rounded-xl w-full skeleton"></div>
                <div className="h-6 rounded w-3/4 skeleton"></div>
                <div className="h-4 rounded w-1/2 skeleton"></div>
                <div className="h-10 rounded w-full mt-auto skeleton"></div>
              </div>
            ))}
          </div>
        ) : featuredEvents.length === 0 ? (
          <div className="text-center py-16 border border-dark-500/15 rounded-2xl bg-surface-400/20">
            <p className="text-dark-400 font-mono text-sm uppercase tracking-wider">No upcoming events.</p>
            <p className="text-dark-500 font-mono text-xs mt-2">Be the first to host one.</p>
            <Link to="/register" className="btn-primary mt-6 inline-block text-xs px-6 py-2.5">
              CREATE EVENT →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Link to="/events" className="btn-secondary px-6 py-2.5 text-xs inline-block">
            VIEW ALL EVENTS →
          </Link>
        </div>
      </section>

      {/* ═══ FEATURES / THE TICKET SECTION ═══════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        {/* Ambient magenta glow */}
        <div className="absolute inset-0 bg-glow-magenta pointer-events-none opacity-60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-[11px] font-mono text-lime-400 tracking-[0.2em] uppercase mb-4">// THE TICKET</p>
          <h2 className="text-4xl md:text-5xl font-display font-light text-dark-100 mb-3">
            One tap. <span className="italic text-lime-400" style={{ textShadow: '0 0 30px rgba(140,255,20,0.2)' }}>You're in.</span>
          </h2>
          <p className="text-base text-dark-400 max-w-lg leading-relaxed mt-4 mb-12">
            Razorpay-powered checkout. Anti-fraud QR codes that refresh on every view. Offline-first door scanner syncs on reconnect.
          </p>

          <div className="space-y-4 max-w-lg">
            {[
              'Instant Razorpay checkout · Test mode ready',
              'Unique QR per registration',
              'One-tap scan · offline sync',
              'Real-time attendance tracking',
            ].map((feature) => (
              <div key={feature} className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded bg-lime-400/10 border border-lime-400/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-lime-400" />
                </span>
                <span className="text-sm text-dark-300 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM STATS ═════════════════════════════════════ */}
      <section className="py-20 border-t border-dark-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { label: 'ORGANIZERS', value: '120+' },
              { label: 'EVENTS SHIPPED', value: '500+' },
              { label: 'TICKETS SCANNED', value: '10k+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="text-[10px] font-mono text-dark-500 tracking-[0.2em] uppercase mb-2">{stat.label}</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-dark-100">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
