import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../services/api';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import { Search, Filter, SlidersHorizontal, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoriesList = [
  { value: '', label: 'All' },
  { value: 'technical', label: 'Tech' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'academic', label: 'Academic' }
];

// Skeleton Loader layout
const SkeletonLayout = () => (
  <div className="min-h-screen flex-grow flex flex-col justify-center items-center py-20 px-4 md:px-20 bg-transparent space-y-12">
    <div className="w-1/2 h-12 custom-skeleton" />
    <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 pt-10">
      <div className="h-96 custom-skeleton animate-pulse" />
      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-96 custom-skeleton animate-pulse" />
        <div className="h-96 custom-skeleton animate-pulse" />
        <div className="h-96 custom-skeleton animate-pulse" />
      </div>
    </div>
  </div>
);

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '1000');
  const [upcomingOnly, setUpcomingOnly] = useState(searchParams.get('upcomingOnly') !== 'false');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const applyFilters = () => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (maxPrice && maxPrice !== '1000') params.maxPrice = maxPrice;
    if (upcomingOnly) params.upcomingOnly = 'true';
    setSearchParams(params);
  };

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 600);

    const fetchFilteredEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const filters = {
          search: searchParams.get('search') || undefined,
          category: searchParams.get('category') || undefined,
          maxPrice: searchParams.get('maxPrice') || undefined,
          upcomingOnly: searchParams.get('upcomingOnly') || 'true'
        };
        const data = await eventService.getAll(filters);
        setEvents(data);
      } catch (err) {
        console.error('Error loading events:', err.message);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredEvents();

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') applyFilters();
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMaxPrice('1000');
    setUpcomingOnly(true);
    setSearchParams({ upcomingOnly: 'true' });
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
          className="min-h-screen flex-1 max-w-7xl mx-auto px-4 md:px-20 py-10 font-sans"
        >
          <div className="mb-8">
            <p className="text-[12px] font-mono text-emerald-400 tracking-[0.15em] font-semibold uppercase mb-2">
              // BROWSE
            </p>
            <h1 className="text-4xl md:text-[52px] font-extrabold text-[#FAF7F2] leading-none m-0 font-display">
              Pick your night.
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:items-start">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden flex items-center justify-between w-full bg-white/[0.06] border border-white/10 p-4 rounded-xl text-sm font-semibold text-[#FAF7F2]/90 cursor-pointer"
            >
              <span className="flex items-center tracking-wider uppercase font-mono">
                <Filter className="w-4 h-4 mr-2 text-emerald-500/60" />
                Filters
              </span>
              {filtersOpen ? <ChevronUp className="w-4 h-4 text-[rgba(250,247,242,0.45)]" /> : <ChevronDown className="w-4 h-4 text-[rgba(250,247,242,0.45)]" />}
            </button>

            {/* Filter Sidebar — sticky wrapper must be a plain div, not motion.div */}
            <div
              className={`w-full md:w-[280px] shrink-0 ${
                filtersOpen ? 'block' : 'hidden md:block'
              }`}
              style={{
                position: 'sticky',
                top: '80px',
                alignSelf: 'flex-start',
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(16,185,129,0.2) transparent',
              }}
            >
            <motion.div
              className="w-full custom-card space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Filters Title & Reset */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <h3 className="text-xs font-mono font-bold text-[#FAF7F2] flex items-center tracking-wider uppercase m-0">
                  <Filter className="w-4 h-4 mr-2 text-emerald-500/70" />
                  FILTERS
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-emerald-400 hover:underline bg-transparent border-none p-0 cursor-pointer transition-colors"
                >
                  RESET
                </button>
              </div>

              {/* SEARCH */}
              <div className="flex flex-col">
                <label className="label-field">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Title, description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="input-field pl-10 text-sm py-2.5 w-full focus:border-emerald-500"
                  />
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[rgba(250,247,242,0.45)]" />
                </div>
              </div>

              {/* CATEGORY Pills */}
              <div className="flex flex-col gap-2">
                <label className="label-field">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CategoriesList.map((cat) => {
                    const active = category === cat.value;
                    return (
                      <motion.button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all duration-200 tracking-wider uppercase cursor-pointer ${
                          active
                            ? 'bg-emerald-500 text-black border-transparent'
                            : 'bg-white/[0.06] border-white/[0.12] text-[rgba(250,247,242,0.6)] hover:border-emerald-500 hover:text-emerald-400'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        {cat.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* MAX PRICE Slider */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <label className="label-field mb-0">MAX PRICE</label>
                  <span className="text-xs font-bold text-emerald-400 bg-white/[0.06] px-2 py-0.5 rounded border border-white/10">
                    {parseInt(maxPrice) === 1000 ? 'ANY' : parseInt(maxPrice) === 0 ? 'Free only' : `Up to ₹${maxPrice}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                  style={{
                    accentColor: '#10B981',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}
                />
                <div className="flex justify-between text-[10px] font-mono text-[rgba(250,247,242,0.35)] mt-1.5 tracking-wider uppercase font-semibold">
                  <span>FREE</span>
                  <span>₹1,000+</span>
                </div>
              </div>

              {/* UPCOMING ONLY Checkbox */}
              <div className="flex items-center pt-2">
                <input
                  id="upcomingOnly"
                  type="checkbox"
                  checked={upcomingOnly}
                  onChange={(e) => setUpcomingOnly(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500/30 cursor-pointer bg-white/[0.06] border-emerald-500 accent-emerald-500"
                />
                <label htmlFor="upcomingOnly" className="ml-2.5 text-xs text-[rgba(250,247,242,0.75)] cursor-pointer select-none font-semibold uppercase tracking-wider flex items-center font-sans">
                  <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-[rgba(250,247,242,0.45)]" />
                  Upcoming Only
                </label>
              </div>

              {/* APPLY FILTERS Button */}
              <motion.button
                onClick={applyFilters}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors font-sans btn-shimmer"
              >
                <SlidersHorizontal className="w-4 h-4 mr-1.5 inline" />
                <span>APPLY FILTERS</span>
              </motion.button>
            </motion.div>
            </div>

            {/* Events Cards Grid */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {loading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-96 rounded-2xl bg-white/[0.04] border border-white/10 p-5 flex flex-col gap-4">
                      <div className="h-44 rounded-xl w-full skeleton"></div>
                      <div className="h-6 rounded w-3/4 skeleton"></div>
                      <div className="h-4 rounded w-1/2 skeleton"></div>
                      <div className="h-10 rounded w-full mt-auto skeleton"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-16 bg-white/[0.04] rounded-2xl border border-white/10">
                  <p className="text-error font-mono text-sm">{error}</p>
                  <button onClick={clearFilters} className="btn-ghost mt-4 text-xs font-bold uppercase">RESET FILTERS</button>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.04] rounded-2xl border border-white/10">
                  <p className="text-[rgba(250,247,242,0.45)] font-mono text-sm tracking-wider uppercase font-semibold m-0">No events match your criteria.</p>
                  <button onClick={clearFilters} className="btn-ghost mt-4 text-xs font-bold uppercase">CLEAR FILTERS</button>
                </div>
              ) : (
                <>
                  <div className="text-[11px] uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
                    Showing {events.length} event{events.length !== 1 ? 's' : ''}
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 items-start">
                  <AnimatePresence mode="popLayout">
                    {events.map((event, index) => (
                      <motion.div
                        key={event.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                        className="w-full flex"
                      >
                        <EventCard event={event} onQuickView={setSelectedEvent} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick View Modal */}
      <EventModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </AnimatePresence>
  );
};

export default Events;
