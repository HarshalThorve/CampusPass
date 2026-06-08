import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../services/api';
import EventCard from '../components/EventCard';
import { Search, Filter, SlidersHorizontal, CalendarDays } from 'lucide-react';

const CategoriesList = [
  { value: '', label: 'All' },
  { value: 'technical', label: 'Tech' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'academic', label: 'Academic' }
];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '1000');
  const [upcomingOnly, setUpcomingOnly] = useState(searchParams.get('upcomingOnly') !== 'false');

  const applyFilters = () => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (maxPrice && maxPrice !== '1000') params.maxPrice = maxPrice;
    if (upcomingOnly) params.upcomingOnly = 'true';
    setSearchParams(params);
  };

  useEffect(() => {
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
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="mb-8">
        <p className="text-[11px] font-mono text-lime-400 tracking-[0.2em] uppercase mb-2">// BROWSE</p>
        <h1 className="text-3xl md:text-4xl font-display font-light text-dark-100">
          Pick your night.
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 bg-surface-300/40 border border-dark-500/15 p-6 rounded-2xl h-fit space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-dark-500/10">
            <h3 className="text-sm font-mono font-bold text-dark-200 flex items-center tracking-wider uppercase">
              <Filter className="w-4 h-4 mr-2 text-lime-400/60" />
              Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-[10px] font-mono font-semibold text-dark-500 hover:text-lime-400 transition-colors tracking-wider uppercase"
            >
              Reset
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="label-field">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Title, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-field-enhanced pl-10 text-sm py-2.5"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-dark-500" />
            </div>
          </div>

          {/* Category Pills */}
          <div>
            <label className="label-field">Category</label>
            <div className="flex flex-wrap gap-2">
              {CategoriesList.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-3.5 py-1.5 text-[11px] font-mono font-medium rounded-full border tracking-wider uppercase transition-all duration-200 ${
                    category === cat.value
                      ? 'bg-lime-400 text-surface-950 border-lime-400 shadow-neon'
                      : 'bg-transparent text-dark-400 border-dark-500/20 hover:border-lime-400/30 hover:text-lime-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="label-field mb-0">Max Price</label>
              <span className="text-xs font-mono font-bold text-lime-400">
                {parseInt(maxPrice) === 1000 ? 'ANY' : `₹${maxPrice}`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full h-1 bg-dark-500/20 rounded-lg appearance-none cursor-pointer accent-lime-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-dark-500 mt-1 tracking-wider">
              <span>FREE</span>
              <span>₹1,000+</span>
            </div>
          </div>

          {/* Upcoming Toggle */}
          <div className="flex items-center pt-2">
            <input
              id="upcomingOnly"
              type="checkbox"
              checked={upcomingOnly}
              onChange={(e) => setUpcomingOnly(e.target.checked)}
              className="h-4 w-4 rounded border-dark-500/30 text-lime-400 focus:ring-lime-400 cursor-pointer bg-surface-400/50 accent-lime-400"
            />
            <label htmlFor="upcomingOnly" className="ml-2.5 text-xs font-mono font-medium text-dark-300 cursor-pointer flex items-center tracking-wider uppercase">
              <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-dark-500" />
              Upcoming Only
            </label>
          </div>

          {/* Apply */}
          <button
            onClick={applyFilters}
            className="btn-primary w-full py-2.5 flex items-center justify-center space-x-2 text-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>APPLY FILTERS</span>
          </button>
        </div>

        {/* Events Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-96 rounded-2xl border border-dark-500/15 bg-surface-400/20 p-5 flex flex-col space-y-4">
                  <div className="h-44 rounded-xl w-full skeleton"></div>
                  <div className="h-6 rounded w-3/4 skeleton"></div>
                  <div className="h-4 rounded w-1/2 skeleton"></div>
                  <div className="h-10 rounded w-full mt-auto skeleton"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-surface-400/20 rounded-2xl border border-dark-500/15">
              <p className="text-rose-400 font-mono text-sm">{error}</p>
              <button onClick={clearFilters} className="btn-secondary mt-4 text-xs">RESET FILTERS</button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-surface-400/20 rounded-2xl border border-dark-500/15">
              <p className="text-dark-400 font-mono text-sm tracking-wider">No events match your criteria.</p>
              <button onClick={clearFilters} className="btn-secondary mt-4 text-xs">CLEAR FILTERS</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
