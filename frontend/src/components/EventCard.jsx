import { Link } from 'react-router-dom';
import { Calendar, MapPin, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionLink = motion(Link);

const CATEGORY_STYLES = {
  technical: { bg: 'rgba(233,196,106,0.2)', border: 'rgba(233,196,106,0.4)', color: '#E9C46A', label: 'Tech' },
  cultural:  { bg: 'rgba(244,162,97,0.2)', border: 'rgba(244,162,97,0.4)', color: '#F4A261', label: 'Cultural' },
  sports:    { bg: 'rgba(138,201,38,0.2)', border: 'rgba(138,201,38,0.4)', color: '#8AC926', label: 'Sports' },
  academic:  { bg: 'rgba(132,165,157,0.2)', border: 'rgba(132,165,157,0.4)', color: '#84A59D', label: 'Academic' },
};

const CATEGORY_IMAGES = {
  technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  cultural: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  sports: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
  academic: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80'
};

const EventCard = ({ event, className = '' }) => {
  const {
    id, title, description, date, venue, category, price,
    capacity, image, registered_count, available_seats, registration_deadline
  } = event;

  const eventDate = new Date(date);
  const deadlineDate = new Date(registration_deadline);
  const now = new Date();

  const isDeadlinePassed = now > deadlineDate;
  const isSoldOut = available_seats <= 0;
  const isPast = now > eventDate;

  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const catKey = (category || '').toLowerCase();
  const catStyle = CATEGORY_STYLES[catKey] || {
    bg: 'rgba(255,184,108,0.2)', border: 'rgba(255,184,108,0.4)', color: '#FFB86C', label: category
  };

  const fillPercentage = capacity > 0
    ? Math.min(100, Math.round(((registered_count || 0) / capacity) * 100))
    : 0;

  let statusText = '● OPEN';
  let statusColor = 'text-[#8AC926]';
  if (isPast) {
    statusText = '● ENDED';
    statusColor = 'text-[#E76F51]';
  } else if (isSoldOut) {
    statusText = '● SOLD OUT';
    statusColor = 'text-[#E76F51]';
  } else if (isDeadlinePassed) {
    statusText = '● CLOSED';
    statusColor = 'text-[#FFB703]';
  }

  const isFree = parseFloat(price) === 0;

  return (
    <MotionLink
      to={`/event/${id}`}
      className={`group flex flex-col custom-card overflow-hidden no-underline w-full ${className}`}
      whileHover={{ 
        y: -6, 
        scale: 1.015,
        transition: { duration: 0.2 }
      }}
    >
      {/* Image Area (200px) */}
      <div className="relative h-[200px] w-full overflow-hidden rounded-xl border border-white/[0.08] select-none">
        <img
          src={image || CATEGORY_IMAGES[catKey] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
          alt={title}
          className="h-full w-full object-cover opacity-85 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
          loading="lazy"
        />
        {/* Soft Vignette Overlay to blend edges & pop badges */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            background: 'linear-gradient(to bottom, rgba(26, 22, 18, 0.45) 0%, transparent 40%, transparent 60%, rgba(26, 22, 18, 0.85) 100%)' 
          }}
        />

        {/* Category Badge (bottom-left) */}
        <span
          className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md z-10"
          style={{ backgroundColor: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}` }}
        >
          {catStyle.label}
        </span>

        {/* Price Badge (top-right) */}
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold font-sans flex items-center select-none text-[#1A1612] z-10"
          style={{
            background: isFree
              ? 'linear-gradient(135deg, #8AC926, #E9C46A)'
              : 'linear-gradient(135deg, #FFB86C, #E9C46A)',
            boxShadow: '0 4px 12px rgba(255, 184, 108, 0.4)'
          }}
        >
          {isFree ? (
            <span>FREE</span>
          ) : (
            <span className="flex items-center">
              <IndianRupee className="w-3 h-3 mr-0.5" />
              {Math.round(price)}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-[#FAF7F2] font-sans font-bold text-[17px] mb-1.5 leading-tight group-hover:text-[#FFB86C] transition-colors duration-200">
          {title}
        </h3>

        {/* Description (2-line clamp) */}
        <p className="text-[13px] line-clamp-2 leading-[1.5] text-[rgba(250,247,242,0.5)] mb-4">
          {description}
        </p>

        {/* Info Rows */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-[13px] text-[rgba(250,247,242,0.6)]">
            <Calendar className="w-3.5 h-3.5 mr-2 text-[#FFB86C]" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center text-[13px] text-[rgba(250,247,242,0.6)]">
            <MapPin className="w-3.5 h-3.5 mr-2 text-[#FFB86C]" />
            <span className="truncate">{venue}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Progress Section */}
        <div className="mt-auto">
          <div className="flex justify-between items-center text-[12px] text-[rgba(250,247,242,0.4)] mb-1.5 uppercase font-semibold tracking-wider">
            <span>{registered_count}/{capacity} FILLED</span>
            <span>{available_seats} LEFT</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${fillPercentage}%` }} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className={`text-[12px] font-semibold tracking-wider uppercase ${statusColor}`}>
            {statusText}
          </span>
          <span className="text-[12px] text-[rgba(250,247,242,0.4)] group-hover:text-[#FFB86C] transition-colors duration-200 uppercase font-semibold">
            View Details →
          </span>
        </div>
      </div>
    </MotionLink>
  );
};

export default EventCard;
