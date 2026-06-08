import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ticketService } from '../services/api';
import { 
  Calendar, MapPin, Ticket, User, Mail, IndianRupee, 
  ArrowLeft, Download, ShieldCheck, CheckCircle
} from 'lucide-react';

const TicketView = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await ticketService.getById(id);
        setTicket(data);
      } catch (err) {
        console.error('Error fetching ticket:', err.message);
        setError('Failed to fetch ticket. Make sure you are authorized.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 dark:text-dark-400 font-semibold">Generating your pass...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex-1 max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-rose-500 text-5xl mb-4">⚠</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-dark-100">{error || 'Ticket Not Found'}</h2>
        <Link to="/dashboard" className="btn-primary mt-6 inline-block text-xs">Go to Dashboard</Link>
      </div>
    );
  }

  const {
    ticket_number,
    user_name,
    user_email,
    event_title,
    event_date,
    event_venue,
    event_category,
    event_price,
    checkin_time,
    attendance_status
  } = ticket;

  // Format dates
  const formattedEventDate = new Date(event_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="flex-1 bg-slate-50 dark:bg-dark-950 transition-colors duration-200 py-10 print:bg-white print:py-0">
      
      {/* Back button (Hidden in Print) */}
      <div className="max-w-md mx-auto px-4 mb-6 print:hidden">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-sm font-semibold text-slate-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dashboard
        </Link>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6">
        
        {/* Ticket Boarding Pass Card */}
        <div 
          id="ticket-pass" 
          className="relative bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl overflow-hidden shadow-2xl animate-float print:shadow-none print:border-slate-300 print:animate-none"
        >
          
          {/* Top colored stripe */}
          <div className="h-4 bg-gradient-to-r from-primary-600 to-primary-500"></div>

          {/* Ticket Header */}
          <div className="p-6 pb-4 border-b border-dashed border-slate-200 dark:border-dark-800 flex justify-between items-center relative">
            
            {/* Dashed line punches on edges */}
            <div className="absolute -left-3 bottom-0 w-6 h-6 rounded-full bg-slate-50 dark:bg-dark-950 border-r border-slate-200 dark:border-dark-800 print:bg-white"></div>
            <div className="absolute -right-3 bottom-0 w-6 h-6 rounded-full bg-slate-50 dark:bg-dark-950 border-l border-slate-200 dark:border-dark-800 print:bg-white"></div>

            <div>
              <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">CampusPass Ticket</span>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-dark-100 font-display line-clamp-1 mt-0.5">{event_title}</h3>
            </div>
            <Ticket className="w-8 h-8 text-primary-500/20 rotate-12 flex-shrink-0" />
          </div>

          {/* Ticket Body details */}
          <div className="p-6 space-y-4">
            
            {/* Participant info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Attendee</span>
                <span className="text-sm font-bold text-slate-700 dark:text-dark-200 flex items-center mt-1">
                  <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {user_name}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-dark-300 flex items-center mt-1.5 line-clamp-1">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {user_email}
                </span>
              </div>
            </div>

            {/* Event details */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-dark-850">
              
              <div className="flex items-start text-xs">
                <Calendar className="w-4 h-4 text-primary-500 mr-2.5 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Schedule</span>
                  <span className="font-semibold text-slate-700 dark:text-dark-200">{formattedEventDate}</span>
                </div>
              </div>

              <div className="flex items-start text-xs">
                <MapPin className="w-4 h-4 text-primary-500 mr-2.5 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Location Venue</span>
                  <span className="font-semibold text-slate-700 dark:text-dark-200">{event_venue}</span>
                </div>
              </div>

            </div>

            {/* Ticket number and Price */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-dark-850">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ticket Number</span>
                <code className="text-xs font-extrabold text-primary-600 dark:text-primary-400 mt-1.5 block tracking-wider">
                  {ticket_number}
                </code>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pass Price</span>
                <span className="text-sm font-extrabold text-slate-700 dark:text-dark-200 mt-1 flex items-center">
                  {parseFloat(event_price) === 0 ? (
                    <span className="text-emerald-500 text-xs font-semibold uppercase">FREE Entry</span>
                  ) : (
                    <>
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                      {event_price}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center pt-3 border-t border-dashed border-slate-200 dark:border-dark-800 mt-2 relative">
              
              {/* Punch holes */}
              <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-slate-50 dark:bg-dark-950 border-r border-slate-200 dark:border-dark-800 print:bg-white"></div>
              <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-slate-50 dark:bg-dark-950 border-l border-slate-200 dark:border-dark-800 print:bg-white"></div>

              <div className="p-2 bg-white border border-slate-200 dark:border-dark-850 rounded-xl print:border-slate-300 print:bg-white">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(ticket_number)}`} 
                  alt="Ticket QR Code" 
                  className="w-36 h-36 print:w-36 print:h-36 print:opacity-100"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 tracking-widest">Scan at Entrance</span>
            </div>

            {/* Attendance indicator footer */}
            <div className="pt-2.5 border-t border-slate-100 dark:border-dark-850 mt-2.5 text-center">
              {attendance_status === 'present' ? (
                <div className="inline-flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
                  <CheckCircle className="w-4 h-4" />
                  <span>Checked-in at {new Date(checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 px-3.5 py-1.5 rounded-full text-xs font-bold border border-primary-100 dark:border-primary-900/30">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ticket Verified: Entry Allowed</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Print / Save Ticket Action (Hidden in Print) */}
        <button
          onClick={handlePrint}
          className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center space-x-2 print:hidden shadow-lg shadow-primary-500/10"
        >
          <Download className="w-4.5 h-4.5" />
          <span>Download Ticket PDF</span>
        </button>

      </div>
    </div>
  );
};

export default TicketView;
