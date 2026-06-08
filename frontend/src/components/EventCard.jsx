import React, { useState } from 'react';
import { Calendar, MapPin, Users, IndianRupee } from 'lucide-react';
import EventModal from './EventModal';

const EventCard = ({ event, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    id,
    title,
    description,
    date,
    venue,
    category,
    price,
    capacity,
    image,
    registered_count,
    available_seats,
    registration_deadline
  } = event;

  const eventDate = new Date(date);
  const deadlineDate = new Date(registration_deadline);
  const now = new Date();

  const isDeadlinePassed = now > deadlineDate;
  const isSoldOut = available_seats <= 0;
  const isPast = now > eventDate;

  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const renderCategoryBadge = () => {
    switch (category.toLowerCase()) {
      case 'technical':
        return <span className="badge-tech">Tech</span>;
      case 'cultural':
        return <span className="badge-cultural">Cultural</span>;
      case 'sports':
        return <span className="badge-sports">Sports</span>;
      case 'academic':
        return <span className="badge-academic">Academic</span>;
      default:
        return <span className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full bg-dark-500/20 text-dark-300 border border-dark-500/20">{category}</span>;
    }
  };

  const fillPercentage = capacity > 0 ? Math.min(100, Math.round(((registered_count || 0) / capacity) * 100)) : 0;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`group relative flex flex-col rounded-2xl overflow-hidden border border-dark-500/15 bg-surface-300/40 backdrop-blur-sm cursor-pointer transition-all duration-400 hover:-translate-y-1 hover:border-lime-400/20 hover:shadow-neon ${className}`}
      >
        {/* Banner Image */}
        <div className="relative h-48 w-full overflow-hidden bg-surface-400/50">
          <img
            src={image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/30 to-transparent"></div>

          {/* Price Tag */}
          <div className="absolute top-4 right-4 bg-surface-950/80 backdrop-blur-sm border border-dark-500/20 px-3 py-1 rounded-full text-sm font-mono font-bold flex items-center">
            {parseFloat(price) === 0 ? (
              <span className="text-lime-400">FREE</span>
            ) : (
              <span className="flex items-center text-lime-400">
                <IndianRupee className="w-3 h-3 mr-0.5" />
                {Math.round(price)}
              </span>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-4 left-4">
            {renderCategoryBadge()}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-base font-bold text-dark-100 group-hover:text-lime-400 transition-colors line-clamp-1 mb-2">
            {title}
          </h3>

          <p className="text-xs text-dark-400 line-clamp-2 mb-4 leading-relaxed">
            {description}
          </p>

          {/* Info */}
          <div className="space-y-2 mb-4 text-xs text-dark-300">
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-2.5 text-lime-400/60" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-2.5 text-lime-400/60" />
              <span className="line-clamp-1">{venue}</span>
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] font-mono text-dark-500 mb-1.5 tracking-wider">
              <span>{registered_count}/{capacity} FILLED</span>
              <span>{available_seats} LEFT</span>
            </div>
            <div className="w-full bg-surface-400/50 rounded-full h-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  fillPercentage >= 90 ? 'bg-rose-500' : fillPercentage >= 75 ? 'bg-amber-500' : 'bg-lime-400'
                }`}
                style={{ width: `${fillPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-dark-500/10">
            <div>
              {isPast ? (
                <span className="text-[10px] font-mono text-dark-500 uppercase tracking-wider">Ended</span>
              ) : isSoldOut ? (
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Sold Out</span>
              ) : isDeadlinePassed ? (
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Reg Closed</span>
              ) : (
                <span className="text-[10px] font-mono text-lime-400 uppercase tracking-wider">● Open</span>
              )}
            </div>
            <span className="text-xs font-mono text-dark-400 group-hover:text-lime-400 transition-colors tracking-wider uppercase">
              Quick View →
            </span>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={event}
      />
    </>
  );
};

export default EventCard;
