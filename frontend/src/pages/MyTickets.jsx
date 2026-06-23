import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { registrationService, certificateService } from '../services/api';
import { useAuth } from '../context/AuthContext';

import { QRCodeSVG } from 'qrcode.react';
import CertificateModal from '../components/CertificateModal';
import Toast from '../components/Toast';
import {
  Calendar, MapPin, Award, Ticket,
  Clock, IndianRupee, Trophy, CalendarRange, Flame
} from 'lucide-react';

// Removed SmallQRPlaceholder as we now use QRCodeSVG

const CountUp = ({ end, duration = 2000, suffix = '', prefix = '' }) => {
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
  
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'error' });

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  const baseLeaderboard = [
    { name: 'Ananya Iyer', points: 450, attended: 9 },
    { name: 'Vikram Malhotra', points: 250, attended: 5 },
    { name: 'Priya Patel', points: 150, attended: 3 },
    { name: 'Arjun Desai', points: 100, attended: 2 },
    { name: 'Rahul Sharma', points: 50, attended: 1 }
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await registrationService.getHistory();
        setRegistrations(data);
      } catch (err) {
        console.error('Error fetching registrations:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handlePayRetry = async (reg) => {
    try {
      const data = await registrationService.create(reg.event_id);
      if (data.isPaid) {
        navigate('/payment', {
          state: {
            registrationId: data.registrationId,
            orderId: data.orderId,
            amount: data.amount,
            keyId: data.keyId,
            eventTitle: reg.title,
            eventPrice: Math.round(reg.price)
          }
        });
      } else {
        navigate(`/ticket/${data.ticket.id}`);
      }
    } catch (err) {
      console.error('Failed to retry payment:', err);
      setToast({ message: err.response?.data?.message || 'Failed to initiate checkout. Please try again.', type: 'error' });
    }
  };

  const CERT_ELIGIBLE = ['technical', 'academic', 'sports'];

  const isCertEligible = (category, issues_certificate) =>
    CERT_ELIGIBLE.includes((category || '').toLowerCase()) &&
    issues_certificate !== false;

  const handleCertificate = async (registrationId) => {
    try {
      const certData = await certificateService.issue(registrationId);
      setCertificateData(certData);
      setShowCertificateModal(true);
    } catch (err) {
      console.error('Certificate error:', err);
      setToast({ message: err.response?.data?.error || 'Could not generate certificate.', type: 'error' });
    }
  };

  const upcoming = registrations.filter(
    (r) => new Date(r.event_date) >= new Date() && r.payment_status === 'completed'
  );

  const past = registrations.filter(
    (r) => new Date(r.event_date) < new Date() || r.attendance_status === 'present'
  );

  const pendingPayment = registrations.filter((r) => r.payment_status === 'pending');

  const totalAttended = registrations.filter((r) => r.attendance_status === 'present').length;
  const totalPoints = totalAttended * 50;

  const userInLeaderboard = baseLeaderboard.some(
    (item) => item.name.toLowerCase() === user?.name?.toLowerCase()
  );

  const finalBaseLeaderboard = [...baseLeaderboard];
  if (user && !userInLeaderboard) {
    finalBaseLeaderboard[4] = { name: user.name, points: 0, attended: 0 };
  }

  const leaderboard = finalBaseLeaderboard.map(item => {
    const isCurrentUser = user?.name?.toLowerCase() === item.name.toLowerCase();
    return {
      ...item,
      isCurrentUser,
      points: isCurrentUser ? totalPoints : item.points,
      attended: isCurrentUser ? totalAttended : item.attended
    };
  })
  .sort((a, b) => b.points - a.points)
  .map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  const currentUserRank = leaderboard.find(item => item.isCurrentUser)?.rank || 5;

  return (
    <div className="min-h-screen flex-1 px-4 md:px-20 py-10">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'error' })}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="custom-card flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FFB86C]/10 blur-[100px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex items-center gap-6 z-10">
            <div className="relative">
              {/* Progress Ring */}
              <svg className="absolute -inset-2 w-[68px] h-[68px] -rotate-90">
                <circle cx="34" cy="34" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle cx="34" cy="34" r="32" fill="none" stroke="#FFB86C" strokeWidth="3" strokeDasharray="200" strokeDashoffset="40" strokeLinecap="round" />
              </svg>
              <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#FFB86C] to-[#E9C46A] text-[#1A1612] font-[800] text-[20px] flex items-center justify-center select-none shadow-[0_0_20px_rgba(255,184,108,0.4)]">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : ''}
              </div>
            </div>
            <div>
              <h2 className="text-[#FAF7F2] text-[24px] font-display font-[700] mb-0.5">{user?.name}</h2>
              <div className="flex items-center gap-3">
                <p className="text-[rgba(250,247,242,0.45)] text-[13px] m-0 font-sans">{user?.email}</p>
                <div className="flex items-center text-[#FFB703] text-[11px] font-bold bg-[#FFB703]/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#FFB703]/20">
                  <Flame className="w-4 h-4 text-[#f5a623] inline mr-1" />
                  3 Week Streak
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {[
              { label: 'Registrations', value: registrations.length, countUp: true },
              { label: 'Attended', value: totalAttended, countUp: true },
              { label: 'Leaderboard Rank', value: currentUserRank, icon: true },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/[0.06] border border-white/10 rounded-[10px] px-5 py-3 text-center min-w-[110px]"
              >
                <span className="block text-[rgba(250,247,242,0.4)] text-[11px] font-[600] uppercase tracking-wider">
                  {stat.label}
                </span>
                <span className="flex items-center justify-center text-[#FAF7F2] text-[22px] font-[700] mt-1">
                  {stat.icon && <Trophy className="w-4 h-4 mr-1.5 text-[#FFB86C]" />}
                  {stat.countUp ? (
                    <CountUp end={stat.value} />
                  ) : (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      #{stat.value}
                    </motion.span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 items-start">
          
          {/* Left Column (Passes & History) */}
          <div className="space-y-6">
            
            {/* Pending Payments Section */}
            {pendingPayment.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#FFB703] flex items-center uppercase tracking-wide">
                  <Clock className="w-5 h-5 mr-2 text-[#FFB703]" />
                  Pending Checkouts
                </h3>
                <div className="space-y-3">
                  {pendingPayment.map((reg) => (
                    <div
                      key={reg.registration_id}
                      className="bg-[#FFB703]/10 border border-[#FFB703]/20 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-[#FAF7F2] text-sm">{reg.title}</h4>
                        <div className="flex items-center text-xs text-[rgba(250,247,242,0.55)] mt-1">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-[#FFB86C]" />
                          {Math.round(reg.price)}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handlePayRetry(reg)}
                        className="btn-primary py-2 px-4 text-xs uppercase btn-shimmer"
                      >
                        Complete Payment
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Entry Passes (Upcoming) */}
            <div className="space-y-4">
              <h3 className="text-[18px] font-[700] text-[#FAF7F2] flex items-center select-none font-sans uppercase">
                <Ticket className="w-5 h-5 mr-2 text-[#FFB86C]" />
                My Entry Passes
              </h3>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-32 custom-skeleton rounded-2xl" />
                  <div className="h-32 custom-skeleton rounded-2xl" />
                </div>
              ) : upcoming.length === 0 ? (
                <div className="custom-card p-8 text-center">
                  <Ticket className="w-12 h-12 text-[#c8a96e] mx-auto mb-3 opacity-80" />
                  <p className="text-[rgba(250,247,242,0.45)] text-sm font-sans m-0">No upcoming registrations found.</p>
                  <Link to="/events" className="btn-primary mt-4 text-xs font-bold uppercase no-underline btn-shimmer">
                    Discover Campus Events
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcoming.map((reg, index) => (
                    <motion.div
                      key={reg.registration_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      whileHover={{ 
                        y: -6, 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      className="custom-card p-5 flex flex-col justify-between hover:bg-white/[0.12] transition-all duration-200"
                      style={{ borderLeft: '3px solid #FFB86C' }}
                    >
                      <div className="flex gap-4">
                        <QRCodeSVG value={reg.ticket_id} size={50} bgColor="transparent" fgColor="#FFB86C" />
                        <div className="flex-1">
                          <h4 className="font-bold text-base text-[#FAF7F2] line-clamp-1 mb-2 font-display">{reg.title}</h4>
                          <div className="space-y-1.5 text-[12px] text-[rgba(250,247,242,0.55)] font-sans">
                            <p className="flex items-center m-0">
                              <Calendar className="w-3.5 h-3.5 mr-2 text-[#FFB86C]" />
                              {new Date(reg.event_date).toLocaleDateString()}
                            </p>
                            <p className="flex items-center m-0">
                              <MapPin className="w-3.5 h-3.5 mr-2 text-[#FFB86C]" />
                              <span className="line-clamp-1">{reg.venue}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 mt-4 flex justify-between items-center border-t border-white/5">
                        <span 
                          className="font-sans font-semibold tracking-wide text-[#FFB86C] text-[11px] px-2.5 py-1 rounded-full uppercase"
                          style={{
                            background: 'rgba(255,184,108,0.1)',
                            border: '1px solid rgba(255,184,108,0.25)'
                          }}
                        >
                          PAID PASS
                        </span>
                        <Link
                          to={`/ticket/${reg.ticket_id}`}
                          className="flex items-center font-semibold text-[#FFB86C] text-[13px] no-underline hover:underline transition-all duration-200 hover:[text-shadow:0_0_10px_rgba(255,184,108,0.4)]"
                        >
                          View QR Code →
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Participation History */}
            <div className="space-y-4">
              <h3 className="text-[18px] font-[700] text-[#FAF7F2] flex items-center select-none font-sans uppercase">
                <CalendarRange className="w-5 h-5 mr-2 text-[#FFB86C]" />
                Participation History
              </h3>

              {loading ? (
                <div className="space-y-3">
                  <div className="h-16 custom-skeleton rounded-xl" />
                  <div className="h-16 custom-skeleton rounded-xl" />
                </div>
              ) : past.length === 0 ? (
                <div className="custom-card p-8 text-center">
                  <CalendarRange className="w-12 h-12 text-[#c8a96e] mx-auto mb-3 opacity-80" />
                  <p className="text-[rgba(250,247,242,0.45)] text-sm font-sans m-0">No past event records found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {past.map((reg, index) => (
                    <motion.div
                      key={reg.registration_id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.35 }}
                      className="custom-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4"
                    >
                      <div>
                        <h4 className="font-bold text-[#FAF7F2] text-sm">{reg.title}</h4>
                        <p className="text-[13px] text-[rgba(250,247,242,0.4)] mt-0.5 font-sans mb-0">
                          {new Date(reg.event_date).toLocaleDateString()} · {reg.venue}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {reg.attendance_status === 'present' ? (
                          <>
                            <span className="badge-pill bg-[#8AC926]/12 border border-[#8AC926]/25 text-[#8AC926]">
                              Attended
                            </span>
                            {isCertEligible(reg.category, reg.issues_certificate) ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCertificate(reg.registration_id)}
                                className="btn-ghost text-xs py-1.5 px-3 border-[#FFB86C] text-[#FFB86C] hover:bg-[#FFB86C]/10 font-sans"
                              >
                                <Award className="w-3.5 h-3.5 mr-1" />
                                <span>Certificate</span>
                              </motion.button>
                            ) : (
                              <span className="text-xs text-[rgba(250,247,242,0.4)] italic font-sans">
                                no certificate
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="badge-pill bg-white/5 border border-white/10 text-[rgba(250,247,242,0.4)]">
                            Absent
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Leaderboard Sidebar) */}
          <div className="custom-card">
            <h3 className="text-[17px] font-[700] text-[#FAF7F2] flex items-center mb-1 select-none font-sans uppercase">
              <Trophy className="w-5 h-5 mr-2 text-[#FFB86C]" />
              Campus Leaderboard
            </h3>
            <p className="text-xs text-[rgba(250,247,242,0.45)] font-sans mb-6">
              Earn 50 points for every event check-in.
            </p>

            <div className="space-y-3">
              {leaderboard.map((item, index) => (
                <motion.div
                  key={item.rank}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    borderColor: item.isCurrentUser ? [
                      'rgba(255,184,108,0.2)',
                      'rgba(255,184,108,0.4)',
                      'rgba(255,184,108,0.2)'
                    ] : undefined
                  }}
                  transition={{
                    opacity: { delay: index * 0.08, duration: 0.35 },
                    x: { delay: index * 0.08, duration: 0.35 },
                    borderColor: item.isCurrentUser ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined
                  }}
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  className={`flex items-center justify-between p-3.5 rounded-lg border ${
                    item.isCurrentUser
                      ? 'bg-[rgba(255,184,108,0.08)] border-[#FFB86C]/20'
                      : item.rank === 1
                      ? 'bg-[rgba(245,166,35,0.05)] border-white/5 hover:border-[#FFB86C]/12'
                      : 'bg-white/5 border-white/5 hover:border-[#FFB86C]/12'
                  }`}
                  style={item.isCurrentUser ? {
                    background: 'rgba(255,184,108,0.08)',
                    borderRadius: '10px'
                  } : {}}
                >
                  <div className="flex items-center space-x-3">
                    {item.rank === 1 ? (
                      <motion.span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold select-none bg-gradient-to-br from-[#FFB86C] to-[#E9C46A] text-[#1A1612] shadow-[0_4px_12px_rgba(255,184,108,0.4)]"
                        animate={{
                          boxShadow: [
                            '0 0 8px rgba(255,184,108,0.3)',
                            '0 0 20px rgba(255,184,108,0.6)',
                            '0 0 8px rgba(255,184,108,0.3)'
                          ]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {item.rank}
                      </motion.span>
                    ) : (
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold select-none ${
                          item.rank === 2
                            ? 'bg-white/10 text-[rgba(250,247,242,0.7)]'
                            : item.rank === 3
                            ? 'bg-white/10 text-[rgba(250,247,242,0.7)]'
                            : 'bg-transparent text-[rgba(250,247,242,0.4)] border border-white/[0.06]'
                        }`}
                      >
                        {item.rank}
                      </span>
                    )}
                    <div>
                      <span className={`text-sm font-bold block ${item.isCurrentUser ? 'text-[#FFB86C]' : 'text-[#FAF7F2]'}`}>
                        {item.name}
                      </span>
                      <span className="text-xs text-[rgba(250,247,242,0.4)] font-sans">
                        {item.attended} events checked-in
                      </span>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${item.isCurrentUser ? 'text-[#FFB86C] font-bold' : 'text-[#FFB86C]'}`}>
                    {item.points} pts
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        certificateData={certificateData}
      />
    </div>
  );
};

export default MyTickets;
