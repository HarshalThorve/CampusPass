import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService, registrationService } from '../services/api';
import EventCard from '../components/EventCard';
import { Calendar, MapPin, Users, IndianRupee, ArrowLeft, Hourglass, ShieldAlert, Sparkles } from 'lucide-react';

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
      alert('Admins cannot register for events.');
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
      alert(err || 'Failed to register. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClick = async () => {
    if (!userRegistration) return;
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    setActionLoading(true);
    try {
      const response = await registrationService.cancel(userRegistration.registration_id);
      alert(response.message);
      setUserRegistration(null);
      const updatedEvent = await eventService.getById(id);
      setEvent(updatedEvent);
    } catch (err) {
      console.error('Cancel registration error:', err);
      alert(err || 'Failed to cancel registration.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="w-10 h-10 border-2 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-dark-500 font-mono text-sm uppercase tracking-wider">Loading...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-400 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-dark-100">{error || 'Event Not Found'}</h2>
        <Link to="/events" className="btn-primary mt-6 inline-block text-xs px-6 py-2.5">BACK TO EVENTS</Link>
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

  const getCategoryBadgeClass = () => {
    switch (category.toLowerCase()) {
      case 'technical': return 'badge-tech';
      case 'cultural': return 'badge-cultural';
      case 'sports': return 'badge-sports';
      case 'academic': return 'badge-academic';
      default: return 'px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full bg-dark-500/20 text-dark-300 border border-dark-500/20';
    }
  };

  const fillPercentage = capacity > 0 ? Math.round((registered_count / capacity) * 100) : 0;

  return (
    <div className="flex-1 bg-surface-950">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Link
          to="/events"
          className="inline-flex items-center text-xs font-mono text-dark-400 hover:text-lime-400 transition-colors tracking-wider uppercase"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to events
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner */}
          <div className="relative h-80 md:h-96 w-full rounded-2xl overflow-hidden border border-dark-500/15 bg-surface-400/30">
            <img
              src={image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'}
              alt={title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/30 to-transparent"></div>
          </div>

          {/* Info Card */}
          <div className="bg-surface-300/40 border border-dark-500/15 p-6 rounded-2xl space-y-4">
            <span className={getCategoryBadgeClass()}>{category}</span>
            <h1 className="text-3xl font-display font-bold text-dark-100">{title}</h1>
            <div className="bg-surface-400/30 p-4 rounded-xl">
              <h4 className="text-sm font-mono font-bold text-dark-200 mb-2 uppercase tracking-wider">About</h4>
              <p className="text-sm text-dark-400 leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-300/40 border border-dark-500/15 p-6 rounded-2xl space-y-6 sticky top-24">

            {/* Price */}
            <div className="flex justify-between items-center pb-4 border-b border-dark-500/10">
              <span className="text-xs font-mono text-dark-500 uppercase tracking-wider">Pass Price</span>
              <span className="text-2xl font-display font-bold text-dark-100 flex items-center">
                {parseFloat(price) === 0 ? (
                  <span className="text-lime-400">FREE</span>
                ) : (
                  <>
                    <IndianRupee className="w-5 h-5 mr-0.5 text-lime-400" />
                    {price}
                  </>
                )}
              </span>
            </div>

            {/* Info */}
            <div className="space-y-4 text-sm">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-lime-400/70 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-dark-200 text-xs font-mono uppercase tracking-wider">Date & Time</h4>
                  <p className="text-xs text-dark-400 mt-0.5">{fullEventDate}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-lime-400/70 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-dark-200 text-xs font-mono uppercase tracking-wider">Venue</h4>
                  <p className="text-xs text-dark-400 mt-0.5">{venue}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Hourglass className="w-5 h-5 text-lime-400/70 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-dark-200 text-xs font-mono uppercase tracking-wider">Deadline</h4>
                  <p className="text-xs text-dark-400 mt-0.5">{fullDeadlineDate}</p>
                </div>
              </div>

              {/* Capacity */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-dark-500 mb-1.5 tracking-wider uppercase">
                  <span>Capacity</span>
                  <span>{available_seats} of {capacity} left</span>
                </div>
                <div className="w-full bg-surface-400/50 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-lime-400 rounded-full transition-all duration-500" style={{ width: `${fillPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-dark-500/10">
              {user && user.role === 'admin' ? (
                <div className="space-y-3">
                  <div className="bg-dark-500/10 border border-dark-500/15 rounded-xl p-4 text-center">
                    <p className="text-[10px] font-mono font-bold text-dark-400 uppercase tracking-wider">Admin View</p>
                    <p className="text-[10px] text-dark-500 mt-1">Admins manage events via the Dashboard.</p>
                  </div>
                  <Link to="/admin" className="w-full btn-primary flex items-center justify-center text-xs py-3">
                    ADMIN DASHBOARD
                  </Link>
                </div>
              ) : userRegistration ? (
                userRegistration.payment_status === 'completed' ? (
                  <div className="space-y-3">
                    <div className="bg-lime-400/10 border border-lime-400/20 text-lime-400 p-3 rounded-xl text-xs font-mono text-center uppercase tracking-wider">
                      ✓ Registered
                    </div>
                    <Link
                      to={`/ticket/${userRegistration.ticket_id}`}
                      className="w-full btn-primary flex items-center justify-center text-xs py-3"
                    >
                      VIEW TICKET QR
                    </Link>
                    {!isDeadlinePassed && (
                      <button
                        onClick={handleCancelClick}
                        disabled={actionLoading}
                        className="w-full text-dark-500 hover:text-rose-400 text-[10px] font-mono py-1.5 text-center transition-colors uppercase tracking-wider"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-xs font-mono text-center uppercase tracking-wider">
                      ⚠ Payment Pending
                    </div>
                    <button
                      onClick={handleRegisterClick}
                      disabled={actionLoading}
                      className="w-full btn-primary text-xs py-3"
                    >
                      {actionLoading ? 'PROCESSING...' : 'PAY NOW'}
                    </button>
                  </div>
                )
              ) : (
                <button
                  onClick={handleRegisterClick}
                  disabled={isEventPast || isSoldOut || isDeadlinePassed || actionLoading}
                  className={`w-full py-3.5 text-xs font-mono font-bold rounded-full text-center flex items-center justify-center uppercase tracking-wider transition-all ${
                    isEventPast ? 'bg-dark-500/20 text-dark-500 cursor-not-allowed'
                    : isSoldOut ? 'bg-rose-500/10 text-rose-400 cursor-not-allowed'
                    : isDeadlinePassed ? 'bg-amber-500/10 text-amber-400 cursor-not-allowed'
                    : 'btn-primary'
                  }`}
                >
                  {actionLoading ? 'PROCESSING...' : isEventPast ? 'EVENT ENDED' : isSoldOut ? 'SOLD OUT' : isDeadlinePassed ? 'REG CLOSED' : user ? 'CONFIRM & REGISTER' : 'SIGN IN TO BOOK'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-dark-500/10 mt-12">
          <div className="flex items-center space-x-2 mb-8">
            <div className="p-1.5 rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-dark-100">
                Similar Events <span className="text-[10px] font-mono px-2 py-0.5 bg-lime-400 text-surface-950 rounded-full ml-1.5 uppercase tracking-wider">AI</span>
              </h2>
              <p className="text-[10px] font-mono text-dark-500 tracking-wider uppercase">Category & price matching</p>
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
