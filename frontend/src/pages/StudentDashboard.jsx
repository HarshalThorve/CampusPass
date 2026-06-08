import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  User, Calendar, MapPin, Award, CheckCircle, Ticket,
  Clock, IndianRupee, ChevronRight, Trophy, Download, CalendarRange
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Certificate states
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [certDetails, setCertDetails] = useState(null);

  // Gamified Leaderboard Mock Data (University-wide)
  const leaderboard = [
    { rank: 1, name: 'Ananya Iyer', points: 450, attended: 9 },
    { rank: 2, name: 'Rahul Sharma', points: 300, attended: 6, isCurrentUser: true }, // Sync with Rahul mock user
    { rank: 3, name: 'Vikram Malhotra', points: 250, attended: 5 },
    { rank: 4, name: 'Priya Patel', points: 150, attended: 3 },
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
        // Free event registration complete
        navigate(`/ticket/${data.ticket.id}`);
      }
    } catch (err) {
      console.error('Failed to retry payment:', err);
      alert(err.response?.data?.message || 'Failed to initiate checkout. Please try again.');
    }
  };

  const openCertificate = (reg) => {
    const issueDate = new Date(reg.event_date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    setCertDetails({
      studentName: user?.name,
      eventTitle: reg.title,
      category: reg.category,
      date: issueDate,
      certId: `CERT-CP-${reg.ticket_number || 'GEN'}`
    });
    setIsCertOpen(true);
  };

  // Group registrations
  const upcoming = registrations.filter(
    (r) => new Date(r.event_date) >= new Date() && r.payment_status === 'completed'
  );
  
  const past = registrations.filter(
    (r) => new Date(r.event_date) < new Date() || r.attendance_status === 'present'
  );

  const pendingPayment = registrations.filter((r) => r.payment_status === 'pending');

  const totalAttended = registrations.filter((r) => r.attendance_status === 'present').length;
  const totalPoints = totalAttended * 50;

  return (
    <div className="flex-1 bg-surface-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Header Widget */}
        <div className="bg-surface-300/40 border border-dark-500/15 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-lime-400 text-surface-950 flex items-center justify-center font-display text-2xl font-bold shadow-neon">
              {user?.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark-100 font-display">{user?.name}</h2>
              <p className="text-sm text-dark-400 font-mono">{user?.email}</p>
            </div>
          </div>
          
          {/* Stats Badges */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-surface-400/30 px-4 py-2.5 rounded-xl text-center border border-dark-500/10">
              <span className="block text-[10px] font-mono font-bold text-dark-500 uppercase tracking-wider">Registrations</span>
              <span className="text-xl font-bold text-dark-100 font-display">
                {registrations.length}
              </span>
            </div>
            <div className="bg-slate-100 dark:bg-dark-850 px-4 py-2.5 rounded-xl text-center border border-slate-200/50 dark:border-dark-800/40">
              <span className="block text-[10px] font-mono font-bold text-dark-500 uppercase tracking-wider">Attended</span>
              <span className="text-xl font-bold text-lime-400 font-display">
                {totalAttended}
              </span>
            </div>
            <div className="bg-slate-100 dark:bg-dark-850 px-4 py-2.5 rounded-xl text-center border border-slate-200/50 dark:border-dark-800/40">
              <span className="block text-[10px] font-mono font-bold text-dark-500 uppercase tracking-wider">Leaderboard Rank</span>
              <span className="text-xl font-bold text-lime-400 font-display flex items-center justify-center">
                <Trophy className="w-4.5 h-4.5 mr-1 text-amber-400" />
                #2
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tickets & History List */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Pending Payments Widget */}
            {pendingPayment.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-amber-600 dark:text-amber-400 flex items-center font-display">
                  <Clock className="w-5 h-5 mr-2" />
                  Action Required: Pending Checkouts
                </h3>
                <div className="space-y-3">
                  {pendingPayment.map((reg) => (
                    <div 
                      key={reg.registration_id} 
                      className="bg-amber-50/70 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/30 p-4 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-dark-200 text-sm">{reg.title}</h4>
                        <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2">
                          <span className="flex items-center">
                            <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                            {Math.round(reg.price)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePayRetry(reg)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Complete Payment
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Tickets */}
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-dark-100 font-display flex items-center">
                <Ticket className="w-5 h-5 mr-2 text-primary-500" />
                My Entry Passes (Upcoming)
              </h3>

              {loading ? (
                <div className="h-32 bg-white dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800 animate-pulse"></div>
              ) : upcoming.length === 0 ? (
                <div className="bg-white dark:bg-dark-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-dark-800">
                  <p className="text-slate-500 dark:text-dark-400 text-sm font-semibold">No upcoming registrations found.</p>
                  <Link to="/events" className="btn-primary mt-4 inline-block text-xs">Discover Campus Events</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcoming.map((reg) => (
                    <div 
                      key={reg.registration_id}
                      className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-primary-500/20 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800 dark:text-dark-100 font-display line-clamp-1">{reg.title}</h4>
                        </div>
                        <div className="space-y-1.5 mt-3 text-xs text-slate-500 dark:text-dark-400">
                          <p className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-2 text-primary-500" />
                            {new Date(reg.event_date).toLocaleDateString()}
                          </p>
                          <p className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-2 text-primary-500" />
                            <span className="line-clamp-1">{reg.venue}</span>
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-dark-850 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                          Paid Pass
                        </span>
                        <Link
                          to={`/ticket/${reg.ticket_id}`}
                          className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center"
                        >
                          View QR Code
                          <ChevronRight className="w-4 h-4 ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past & Attended History */}
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-dark-100 font-display flex items-center">
                <CalendarRange className="w-5 h-5 mr-2 text-primary-500" />
                Participation History
              </h3>

              {loading ? (
                <div className="h-32 bg-white dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800 animate-pulse"></div>
              ) : past.length === 0 ? (
                <div className="bg-white dark:bg-dark-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-dark-800">
                  <p className="text-slate-500 dark:text-dark-400 text-sm font-semibold">No past event records found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {past.map((reg) => (
                    <div 
                      key={reg.registration_id}
                      className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-4 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-dark-100 text-sm">{reg.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Date: {new Date(reg.event_date).toLocaleDateString()} | Venue: {reg.venue}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {reg.attendance_status === 'present' ? (
                          <>
                            <span className="flex items-center text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Attended
                            </span>
                            <button
                              onClick={() => openCertificate(reg)}
                              className="btn-accent px-3 py-1.5 text-xs flex items-center space-x-1"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Certificate</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-dark-850 px-2.5 py-1 rounded-full">
                            Absent
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-md">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-dark-100 font-display flex items-center mb-4 pb-3 border-b border-slate-100 dark:border-dark-850">
                <Trophy className="w-5 h-5 mr-2 text-amber-500" />
                Campus Leaderboard
              </h3>
              <p className="text-xs text-slate-400 font-medium mb-5">
                Earn 50 Points for every event check-in! Collect certificates to rank up.
              </p>

              <div className="space-y-4">
                {leaderboard.map((item) => (
                  <div 
                    key={item.rank}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      item.isCurrentUser 
                        ? 'bg-primary-50/70 border-primary-200 dark:bg-primary-950/15 dark:border-primary-900/30' 
                        : 'bg-white dark:bg-dark-900 border-slate-100 dark:border-dark-850'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                        item.rank === 1 ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
                        item.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-dark-800 dark:text-slate-300' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {item.rank}
                      </span>
                      <div>
                        <span className={`text-sm font-bold block ${
                          item.isCurrentUser ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-dark-200'
                        }`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.attended} Events checked-in
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold font-display text-slate-800 dark:text-dark-100">
                      {item.isCurrentUser ? totalPoints : item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Digital Certificate Modal */}
      <Modal 
        isOpen={isCertOpen} 
        onClose={() => setIsCertOpen(false)} 
        title="🎓 Digital Certificate"
      >
        {certDetails && (
          <div className="space-y-6">
            {/* The Certificate Canvas */}
            <div className="border-[12px] border-double border-primary-600 p-8 bg-amber-50/35 text-center relative dark:bg-dark-950 rounded-lg shadow-inner">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-primary-500/20 text-3xl font-display">✦</div>
              <div className="absolute top-2 right-2 text-primary-500/20 text-3xl font-display">✦</div>
              <div className="absolute bottom-2 left-2 text-primary-500/20 text-3xl font-display">✦</div>
              <div className="absolute bottom-2 right-2 text-primary-500/20 text-3xl font-display">✦</div>

              <h2 className="font-display font-extrabold text-2xl text-primary-700 dark:text-primary-400 tracking-wide uppercase">
                CampusPass
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                University Verification Certificate
              </p>

              <div className="my-8">
                <p className="text-xs italic text-slate-500 dark:text-dark-400">This is proudly presented to</p>
                <h3 className="text-3xl font-bold font-display text-slate-800 dark:text-dark-100 border-b border-primary-100 dark:border-primary-900/40 pb-2 w-fit mx-auto mt-4 min-w-[200px]">
                  {certDetails.studentName}
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-dark-300 max-w-md mx-auto leading-relaxed">
                for successfully attending and completing the campus event
                <strong className="block text-sm text-slate-800 dark:text-dark-200 mt-1 font-display">
                  {certDetails.eventTitle}
                </strong>
                under the <strong className="capitalize">{certDetails.category}</strong> category.
              </p>

              <div className="flex justify-between items-end mt-12 pt-4 border-t border-slate-200 dark:border-dark-850 text-left text-[10px] text-slate-400">
                <div>
                  <p>Issue Date: <strong>{certDetails.date}</strong></p>
                  <p className="mt-0.5">Verification ID: <strong>{certDetails.certId}</strong></p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-6 border-b border-slate-400 mx-auto"></div>
                  <p className="mt-1 font-semibold text-slate-500">Event Coordinator</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 justify-end">
              <button 
                onClick={() => setIsCertOpen(false)}
                className="btn-secondary text-xs"
              >
                Close View
              </button>
              <button 
                onClick={() => window.print()}
                className="btn-accent text-xs flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentDashboard;
