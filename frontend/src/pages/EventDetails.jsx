import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService, registrationService } from '../services/api';
import EventCard from '../components/EventCard';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { Calendar, MapPin, IndianRupee, ArrowLeft, Hourglass, ShieldAlert, Sparkles } from 'lucide-react';

const CATEGORY_STYLES = {
  technical: { bg: 'rgba(233,196,106,0.15)', border: 'rgba(233,196,106,0.3)', color: '#E9C46A' },
  cultural:  { bg: 'rgba(244,162,97,0.15)', border: 'rgba(244,162,97,0.3)', color: '#F4A261' },
  sports:    { bg: 'rgba(138,201,38,0.15)', border: 'rgba(138,201,38,0.3)', color: '#8AC926' },
  academic:  { bg: 'rgba(132,165,157,0.15)', border: 'rgba(132,165,157,0.3)', color: '#84A59D' },
};

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventData = await eventService.getById(id);
        setEvent(eventData);

        if (user && user.role === 'student') {
          const history = await registrationService.getHistory();
          const existing = history.find(reg => reg.event_id === parseInt(id));
          setUserRegistration(existing || null);
        }

        const allEvents = await eventService.getAll({ upcomingOnly: 'true' });
        const filtered = allEvents.filter(e => e.id !== parseInt(id));
        const scored = filtered.map(e => {
          let score = 0;
          if (e.category === eventData.category) score += 3;
          const priceDiff = Math.abs(parseFloat(e.price) - parseFloat(eventData.price));
          if (priceDiff < 50) score += 2;
          else if (priceDiff < 200) score += 1;
          return { ...e, similarityScore: score };
        });
        const sorted = scored.sort((a, b) => b.similarityScore - a.similarityScore);
        setRecommendations(sorted.slice(0, 3));
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to fetch event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user]);

  const handleRegisterClick = async () => {
    if (!user) {
      navigate(`/login?redirect=/event/${id}`);
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
        navigate(`/ticket/${data.ticket.id}`);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setToast({ message: err.response?.data?.message || err || 'Failed to register. Please try again.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (!userRegistration) return;
    setShowCancelConfirm(true);
  };

  const confirmCancel = async () => {
    setShowCancelConfirm(false);
    setActionLoading(true);
    try {
      const response = await registrationService.cancel(userRegistration.registration_id);
      setToast({ message: response.message, type: 'success' });
      setUserRegistration(null);
      const updatedEvent = await eventService.getById(id);
      setEvent(updatedEvent);
    } catch (err) {
      console.error('Cancel registration error:', err);
      setToast({ message: err.response?.data?.message || err || 'Failed to cancel registration.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-transparent">
        <div className="w-10 h-10 border-2 border-[#FFB86C] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[rgba(250,247,242,0.55)] font-mono text-sm uppercase tracking-wider">Loading details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
        <ShieldAlert className="w-16 h-16 text-[#E76F51] mx-auto mb-4" />
        <h2 className="text-2xl font-sans font-bold text-[#FAF7F2]">{error || 'Event Not Found'}</h2>
        <Link to="/events" className="btn-primary mt-6 inline-block text-xs px-6 py-2.5 no-underline">
          BACK TO EVENTS
        </Link>
      </div>
    );
  }

  const {
    title, description, date, venue, category, price,
    capacity, image, registered_count, available_seats, registration_deadline
  } = event;

  const eventDate = new Date(date);
  const deadlineDate = new Date(registration_deadline);
  const now = new Date();
  const isDeadlinePassed = now > deadlineDate;
  const isSoldOut = available_seats <= 0;
  const isEventPast = now > eventDate;

  const fullEventDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const fullDeadlineDate = deadlineDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const catStyle = CATEGORY_STYLES[category.toLowerCase()] || {
    bg: 'rgba(255,184,108,0.15)', border: 'rgba(255,184,108,0.3)', color: '#FFB86C'
  };

  const fillPercentage = capacity > 0 ? Math.round((registered_count / capacity) * 100) : 0;

  return (
    <div className="flex-1 bg-[#1A1612] px-4 md:px-20 py-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />
      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Cancel Registration"
        message="Are you sure you want to cancel your registration? This cannot be undone."
        confirmLabel="Cancel Ticket"
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
        danger
      />

      {/* Back Button Link */}
      <div className="max-w-7xl mx-auto mb-6">
        <Link
          to="/events"
          className="inline-flex items-center text-xs font-mono text-[rgba(250,247,242,0.45)] hover:text-[#FFB86C] no-underline transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to events
        </Link>
      </div>

      {/* 2-Column layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side (Banner & Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Banner */}
          <div className="relative h-80 md:h-[380px] w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 select-none">
            <img
              src={image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'}
              alt={title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1612] via-[#1A1612]/30 to-transparent"></div>
          </div>

          {/* Description Card */}
          <div className="custom-card space-y-4">
            <span
              className="badge-pill uppercase tracking-wider"
              style={{ backgroundColor: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}` }}
            >
              {category}
            </span>
            <h1 className="text-3xl font-extrabold text-[#FAF7F2] font-sans m-0">{title}</h1>
            
            <div className="bg-white/[0.04] p-5 rounded-xl border border-white/5">
              <h4 className="text-xs font-mono font-bold text-[#FAF7F2] mb-3 uppercase tracking-wider">// ABOUT THE EVENT</h4>
              <p className="text-sm text-[rgba(250,247,242,0.7)] leading-relaxed whitespace-pre-line m-0 font-sans">{description}</p>
            </div>
          </div>
        </div>

        {/* Right Side (Checkout Panel) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20">
          <div className="custom-card space-y-6">
            {/* Price Detail */}
            <div className="flex justify-between items-center pb-4 border-b border-white/[0.08]">
              <span className="text-xs font-mono text-[rgba(250,247,242,0.45)] uppercase tracking-wider">Pass Price</span>
              <span className="text-2xl font-bold text-[#FAF7F2] flex items-center">
                {parseFloat(price) === 0 ? (
                  <span className="text-[#8AC926]">FREE</span>
                ) : (
                  <>
                    <IndianRupee className="w-5 h-5 mr-0.5 text-[#FFB86C]" />
                    <span>{price}</span>
                  </>
                )}
              </span>
            </div>

            {/* Quick Specs Grid */}
            <div className="space-y-4 text-[13px] font-sans">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-[#FFB86C] mr-3 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-[#FAF7F2] text-xs font-mono uppercase tracking-wider m-0">Date & Time</h4>
                  <p className="text-xs text-[rgba(250,247,242,0.55)] mt-1.5 m-0 leading-relaxed">{fullEventDate}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-[#FFB86C] mr-3 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-[#FAF7F2] text-xs font-mono uppercase tracking-wider m-0">Venue</h4>
                  <p className="text-xs text-[rgba(250,247,242,0.55)] mt-1.5 m-0 leading-relaxed">{venue}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Hourglass className="w-5 h-5 text-[#FFB86C] mr-3 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-[#FAF7F2] text-xs font-mono uppercase tracking-wider m-0">Deadline</h4>
                  <p className="text-xs text-[rgba(250,247,242,0.55)] mt-1.5 m-0 leading-relaxed">{fullDeadlineDate}</p>
                </div>
              </div>

              {/* Progress seat stats */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-[rgba(250,247,242,0.45)] mb-1.5 tracking-wider uppercase font-semibold">
                  <span>Capacity</span>
                  <span>{available_seats} of {capacity} left</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${fillPercentage}%` }} />
                </div>
              </div>
            </div>

            {/* Checkouts / Booking Actions */}
            <div className="pt-4 border-t border-white/[0.08]">
              {user && user.role === 'admin' ? (
                <div className="space-y-3">
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center font-sans">
                    <p className="text-[10px] font-mono font-bold text-[rgba(250,247,242,0.45)] uppercase tracking-wider m-0">Admin View</p>
                    <p className="text-[11px] text-[rgba(250,247,242,0.45)] mt-1.5 m-0">Admins manage events via the Dashboard.</p>
                  </div>
                  <Link to="/admin" className="w-full btn-primary text-xs py-3 no-underline font-bold uppercase">
                    ADMIN DASHBOARD
                  </Link>
                </div>
              ) : userRegistration ? (
                userRegistration.payment_status === 'completed' ? (
                  <div className="space-y-3">
                    <div className="bg-[#8AC926]/10 border border-[#8AC926]/20 text-[#8AC926] p-3 rounded-xl text-xs font-mono text-center uppercase tracking-wider font-semibold">
                      ✓ Registered
                    </div>
                    <Link
                      to={`/ticket/${userRegistration.ticket_id}`}
                      className="w-full btn-primary text-xs py-3 no-underline font-bold uppercase"
                    >
                      VIEW TICKET QR
                    </Link>
                    {!isDeadlinePassed && (
                      <button
                        onClick={handleCancelClick}
                        disabled={actionLoading}
                        className="w-full text-[rgba(250,247,242,0.45)] hover:text-[#E76F51] text-[10px] font-mono py-2 text-center transition-colors uppercase tracking-wider bg-transparent border-none cursor-pointer"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-[#FFB703]/10 border border-[#FFB703]/20 text-[#FFB703] p-3 rounded-xl text-xs font-mono text-center uppercase tracking-wider font-semibold animate-pulse">
                      ⚠ Payment Pending
                    </div>
                    <button
                      onClick={handleRegisterClick}
                      disabled={actionLoading}
                      className="w-full btn-primary text-xs py-3 font-bold uppercase"
                    >
                      {actionLoading ? 'PROCESSING...' : 'PAY NOW'}
                    </button>
                  </div>
                )
              ) : (
                <button
                  onClick={handleRegisterClick}
                  disabled={isEventPast || isSoldOut || isDeadlinePassed || actionLoading}
                  className={`w-full py-3 text-xs font-mono font-bold rounded-lg text-center flex items-center justify-center uppercase tracking-wider transition-all cursor-pointer border-none ${
                    isEventPast ? 'bg-white/5 text-[rgba(250,247,242,0.4)] cursor-not-allowed border border-white/5'
                    : isSoldOut ? 'bg-[#E76F51]/10 text-[#E76F51] cursor-not-allowed border border-[#E76F51]/10'
                    : isDeadlinePassed ? 'bg-[#FFB703]/10 text-[#FFB703] cursor-not-allowed border border-[#FFB703]/10'
                    : 'btn-primary'
                  }`}
                >
                  {actionLoading ? 'PROCESSING...'
                    : isEventPast ? 'EVENT ENDED'
                    : isSoldOut ? 'SOLD OUT'
                    : isDeadlinePassed ? 'REG CLOSED'
                    : user ? 'CONFIRM & REGISTER'
                    : 'SIGN IN TO BOOK'}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Recommendations Slider */}
      {recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto py-16 border-t border-white/[0.08] mt-12">
          <div className="flex items-center space-x-2.5 mb-8">
            <div className="p-2 rounded-lg bg-[#FFB86C]/10 text-[#FFB86C] border border-[#FFB86C]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-sans font-bold text-[#FAF7F2] m-0">
                Similar Events
              </h2>
              <p className="text-[10px] font-mono text-[rgba(250,247,242,0.45)] tracking-wider uppercase m-0 mt-0.5">Category & price matching</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <EventCard key={rec.id} event={rec} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default EventDetails;
