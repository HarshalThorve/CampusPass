import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registrationService } from '../services/api';
import { X, Calendar, Clock, MapPin, Users, IndianRupee } from 'lucide-react';

const EventModal = ({ isOpen, onClose, event }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userRegistration, setUserRegistration] = useState(null);
  const [loadingReg, setLoadingReg] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && user && user.role === 'student' && event) {
      const checkRegistration = async () => {
        setLoadingReg(true);
        try {
          const history = await registrationService.getHistory();
          const existing = history.find(reg => reg.event_id === event.id);
          setUserRegistration(existing || null);
        } catch (err) {
          console.error('Failed to fetch registration history:', err);
        } finally {
          setLoadingReg(false);
        }
      };
      checkRegistration();
    }
  }, [isOpen, user, event]);

  if (!isOpen || !event) return null;

  const {
    id, title, description, date, venue, category, price,
    capacity, image, registered_count, available_seats, registration_deadline
  } = event;

  const eventDateObj = new Date(date);
  const now = new Date();
  const isDeadlinePassed = now > new Date(registration_deadline);
  const isSoldOut = available_seats <= 0;
  const isEventPast = now > eventDateObj;

  const formattedDate = eventDateObj.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  const formattedTime = eventDateObj.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const handleRegisterClick = async () => {
    if (!user) {
      onClose();
      navigate(`/login?redirect=/events`);
      return;
    }
    if (user.role === 'admin') {
      alert('Admins cannot register for events.');
      return;
    }
    setActionLoading(true);
    try {
      const data = await registrationService.create(event.id);
      if (data.isPaid) {
        onClose();
        navigate(`/payment`, {
          state: {
            registrationId: data.registrationId,
            orderId: data.orderId,
            amount: data.amount,
            keyId: data.keyId,
            eventTitle: event.title,
            eventPrice: event.price
          }
        });
      } else {
        onClose();
        navigate(`/ticket/${data.ticket.id}`);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      alert(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Button state
  let buttonText = 'SELECT TICKETS';
  let buttonDisabled = false;
  let buttonClass = 'btn-primary';

  if (actionLoading || loadingReg) {
    buttonText = 'PROCESSING...';
    buttonDisabled = true;
    buttonClass = 'bg-dark-500/30 text-dark-400 cursor-not-allowed rounded-full font-mono font-bold text-xs tracking-wider uppercase px-8 py-3.5';
  } else if (userRegistration) {
    if (userRegistration.payment_status === 'completed') {
      buttonText = 'VIEW TICKET';
      buttonClass = 'bg-lime-400 hover:bg-lime-300 text-surface-950 rounded-full font-mono font-bold text-xs tracking-wider uppercase px-8 py-3.5 shadow-neon transition-all';
    } else {
      buttonText = 'COMPLETE PAYMENT';
      buttonClass = 'bg-amber-500 hover:bg-amber-400 text-surface-950 rounded-full font-mono font-bold text-xs tracking-wider uppercase px-8 py-3.5 transition-all';
    }
  } else if (isEventPast) {
    buttonText = 'EVENT ENDED';
    buttonDisabled = true;
    buttonClass = 'bg-dark-500/20 text-dark-500 cursor-not-allowed rounded-full font-mono font-bold text-xs tracking-wider uppercase px-8 py-3.5';
  } else if (isSoldOut) {
    buttonText = 'SOLD OUT';
    buttonDisabled = true;
    buttonClass = 'bg-rose-500/10 text-rose-400 cursor-not-allowed rounded-full font-mono font-bold text-xs tracking-wider uppercase px-8 py-3.5';
  } else if (isDeadlinePassed) {
    buttonText = 'REG CLOSED';
    buttonDisabled = true;
    buttonClass = 'bg-amber-500/10 text-amber-400 cursor-not-allowed rounded-full font-mono font-bold text-xs tracking-wider uppercase px-8 py-3.5';
  }

  const handleAction = () => {
    if (userRegistration && userRegistration.payment_status === 'completed') {
      onClose();
      navigate(`/ticket/${userRegistration.ticket_id}`);
    } else {
      handleRegisterClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-950/80 backdrop-blur-lg transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl bg-surface-300 border border-dark-500/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 sm:h-72 w-full flex-shrink-0 bg-surface-500">
          <img
            src={image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'}
            alt={title}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-300 via-surface-950/40 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-surface-950/50 text-dark-200 hover:text-lime-400 hover:bg-surface-950/70 backdrop-blur-sm transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Badge */}
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block px-3 py-1 bg-surface-950/60 backdrop-blur-md text-dark-200 text-[10px] font-mono font-bold uppercase tracking-[0.2em] rounded-full mb-3 border border-dark-500/20">
              {category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-dark-100 leading-tight">
              {title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-surface-300">

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
            {[
              { icon: Calendar, label: 'DATE', value: formattedDate },
              { icon: Clock, label: 'TIME', value: formattedTime },
              { icon: MapPin, label: 'VENUE', value: venue },
              { icon: Users, label: 'ATTENDEES', value: `${registered_count} / ${capacity}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-surface-400/50 p-4 rounded-2xl border border-dark-500/10 flex flex-col">
                <Icon className="w-5 h-5 text-lime-400/70 mb-2" />
                <span className="text-[10px] font-mono font-semibold text-dark-500 uppercase tracking-[0.2em] mb-0.5">{label}</span>
                <span className="text-sm font-bold text-dark-100 line-clamp-1">{value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-dark-100 mb-3 font-display">About this event</h3>
            <p className="text-sm text-dark-400 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to={`/event/${id}`}
              onClick={onClose}
              className="text-xs font-mono text-dark-400 hover:text-lime-400 transition-colors tracking-wider uppercase"
            >
              View Full Details Page →
            </Link>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-6 bg-surface-300 border-t border-dark-500/10 flex items-center justify-between flex-shrink-0">
          <div>
            {parseFloat(price) === 0 ? (
              <div className="text-xl font-mono font-bold text-lime-400">FREE</div>
            ) : (
              <>
                <div className="text-[10px] font-mono text-dark-500 uppercase tracking-[0.2em]">From</div>
                <div className="text-xl font-display font-bold text-dark-100 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-0.5 text-lime-400" />
                  {price}
                  <span className="text-xs text-dark-500 font-mono ml-1.5">/ person</span>
                </div>
              </>
            )}
          </div>

          {user && user.role === 'admin' ? (
            <div className="bg-dark-500/10 text-dark-400 px-4 py-2 rounded-full text-[10px] font-mono font-bold border border-dark-500/15 uppercase tracking-wider">
              Admin View
            </div>
          ) : (
            <button
              onClick={handleAction}
              disabled={buttonDisabled}
              className={buttonClass}
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
