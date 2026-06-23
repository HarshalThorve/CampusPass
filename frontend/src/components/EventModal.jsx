import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registrationService } from '../services/api';
import Toast from '../components/Toast';
import { X, Calendar, Clock, MapPin, Users, IndianRupee } from 'lucide-react';

const EventModal = ({ isOpen, onClose, event }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userRegistration, setUserRegistration] = useState(null);
  const [loadingReg, setLoadingReg] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });

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
      setToast({ message: 'Admins cannot register for events.', type: 'error' });
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
      setToast({ message: err.response?.data?.message || 'Failed to register. Please try again.', type: 'error' });
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
    buttonClass = 'bg-[#312620] text-[#8A7560] cursor-not-allowed rounded-full font-mono font-bold text-xs tracking-wider uppercase px-8 py-3.5';
  } else if (userRegistration) {
    if (userRegistration.payment_status === 'completed') {
      buttonText = 'VIEW TICKET';
      buttonClass = 'bg-[#F4A261] hover:bg-[#F4A261] text-[#0E0E0E] rounded-full font-mono font-bold text-xs tracking-wider uppercase px-8 py-3.5 shadow-neon transition-all';
    } else {
      buttonText = 'COMPLETE PAYMENT';
      buttonClass = 'bg-[#F4A261] hover:bg-[#FFD166] text-[#0E0E0E] rounded-full font-mono font-bold text-xs tracking-wider uppercase px-8 py-3.5 transition-all';
    }
  } else if (isEventPast) {
    buttonText = 'EVENT ENDED';
    buttonDisabled = true;
    buttonClass = 'bg-white/5 text-[#8A7560] cursor-not-allowed rounded-full font-mono font-bold text-xs tracking-wider uppercase px-8 py-3.5 border border-white/5';
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
    <>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl glass-strong rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-40 sm:h-52 md:h-60 w-full flex-shrink-0" style={{ background: '#0E0E0E' }}>
          <img
            src={image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'}
            alt={title}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E]/40 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#0E0E0E]/70 text-[#8A7560] hover:text-[#F4A261] hover:bg-[#0E0E0E]/90 backdrop-blur-sm transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Badge */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
            <span className="inline-block px-3 py-1 bg-[#0E0E0E]/70 backdrop-blur-md text-[#F8F9FA]/80 text-[10px] font-mono font-bold uppercase tracking-[0.2em] rounded-full mb-2 border border-white/10">
              {category}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-[#F8F9FA] leading-tight">
              {title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-transparent">

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
            {[
              { icon: Calendar, label: 'DATE', value: formattedDate },
              { icon: Clock, label: 'TIME', value: formattedTime },
              { icon: MapPin, label: 'VENUE', value: venue },
              { icon: Users, label: 'ATTENDEES', value: `${registered_count} / ${capacity}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 flex flex-col">
                <Icon className="w-4 h-4 text-[#F4A261]/70 mb-1.5" />
                <span className="text-[9px] font-mono font-semibold text-[#8A7560] uppercase tracking-[0.2em] mb-0.5">{label}</span>
                <span className="text-xs sm:text-sm font-bold text-[#F8F9FA] line-clamp-1">{value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="text-xs text-[#8A7560] leading-relaxed line-clamp-3 mb-4">
            {description}
          </p>

          <div className="flex justify-center">
            <Link
              to={`/event/${id}`}
              onClick={onClose}
              className="text-[10px] sm:text-xs font-mono text-[#8A7560] hover:text-[#F4A261] transition-colors tracking-wider uppercase"
            >
              View Full Details Page →
            </Link>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-6 bg-transparent border-t border-white/5 flex items-center justify-between flex-shrink-0">
          <div>
            {parseFloat(price) === 0 ? (
              <div className="text-xl font-mono font-bold text-[#F4A261]">FREE</div>
            ) : (
              <>
                <div className="text-[10px] font-mono text-[#8A7560] uppercase tracking-[0.2em]">From</div>
                <div className="text-xl font-display font-bold text-[#F8F9FA] flex items-center">
                  <IndianRupee className="w-4 h-4 mr-0.5 text-[#F4A261]" />
                  {price}
                  <span className="text-xs text-[#8A7560] font-mono ml-1.5">/ person</span>
                </div>
              </>
            )}
          </div>

          {user && user.role === 'admin' ? (
            <div className="bg-white/5 text-[#8A7560] px-4 py-2 rounded-full text-[10px] font-mono font-bold border border-white/10 uppercase tracking-wider">
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
    </>
  );
};

export default EventModal;
