import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ticketService } from '../services/api';
import {
  Calendar, MapPin, Ticket, User, Mail, IndianRupee,
  ArrowLeft, Download, ShieldCheck, CheckCircle,
  ClipboardCheck, AlertCircle, Clock, BadgeCheck,
  QrCode, Info, Smartphone, Sparkles
} from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const TicketView = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-150, 150], [8, -8]);
  const rotateY = useTransform(x, [-150, 150], [-8, 8]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

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
        <div className="relative">
          <div className="w-12 h-12 border-2 border-[#FFB86C] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-[#FFB86C]/20 rounded-full" />
        </div>
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-[#FAF7F2]/50">
          Generating your pass...
        </p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex-1 max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-[#E76F51] text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold font-display text-[#FAF7F2]">
          {error || 'Ticket Not Found'}
        </h2>
        <Link to="/my-tickets" className="btn-primary mt-6 inline-block text-xs uppercase tracking-wider">
          Go to Dashboard
        </Link>
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
    event_price,
    checkin_time,
    attendance_status
  } = ticket;

  const formattedEventDate = new Date(event_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const eventDateObj = new Date(event_date);
  const isPast = eventDateObj < new Date();
  const daysUntil = Math.ceil((eventDateObj - new Date()) / (1000 * 60 * 60 * 24));

  const isCheckedIn = attendance_status === 'present';

  return (
    <div className="flex-1 py-8 px-4 md:px-20 print:bg-white print:py-0 print:px-0">

      {/* Page header */}
      <div className="max-w-5xl mx-auto mb-6 print:hidden">
        <Link
          to="/my-tickets"
          className="inline-flex items-center text-xs font-mono transition-colors uppercase tracking-wider text-[#FAF7F2]/50 hover:text-[#FFB86C]"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT: Ticket Card ── */}
          <div className="space-y-6">

            {/* Premium Gradient Border Card Wrapper */}
            <motion.div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="p-[1px] bg-gradient-to-tr from-[#E9C46A] via-[#F4A261]/40 to-white/[0.08] rounded-[22px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden cursor-pointer"
            >
              {/* Ticket Card Container */}
              <div
                id="ticket-pass"
                className="relative overflow-hidden print:shadow-none print:animate-none print:bg-white print:border print:border-slate-200 rounded-[20px] bg-[#1A1612] border border-white/10 backdrop-blur-2xl"
              >
                {/* Specular sheen flash animation */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent pointer-events-none z-20"
                  animate={{
                    x: ['-100%', '100%'],
                    y: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    repeatDelay: 3
                  }}
                />

                {/* Top accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-[#FFB86C] via-[#F4A261] to-[#E9C46A] print:from-[#FFB86C] print:to-[#E9C46A]" />

                {/* Ticket Stamp Icon Badge */}
                <div className="absolute top-4 right-4 print:hidden">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FFB86C]/10 border border-[#FFB86C]/20">
                    <Ticket className="w-5 h-5 rotate-12 text-[#FFB86C]/60" />
                  </div>
                </div>

                {/* Header Section */}
                <div className="px-6 pt-5 pb-5 relative border-b border-dashed border-white/10">
                  {/* Punch Holes left & right */}
                  <div className="absolute -left-3 bottom-[-10px] w-5 h-5 rounded-full z-10 bg-[#1A1612] border border-white/10 print:bg-white print:border-slate-200" />
                  <div className="absolute -right-3 bottom-[-10px] w-5 h-5 rounded-full z-10 bg-[#1A1612] border border-white/10 print:bg-white print:border-slate-200" />

                  <span className="block font-mono font-bold uppercase tracking-[0.15em] text-[#FFB86C] text-[10px]">
                    ◆ CampusPass Entry Ticket
                  </span>
                  <h1 className="font-bold line-clamp-2 mt-1.5 leading-tight text-[#FAF7F2] text-xl print:text-black font-display">
                    {event_title}
                  </h1>
                </div>

                {/* Ticket Body Content */}
                <div className="px-6 py-5 space-y-5">

                  {/* Attendee Info Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="block font-mono font-bold uppercase tracking-wider text-[#FAF7F2]/40 text-[9px]">
                        Attendee
                      </span>
                      <span className="flex items-center font-bold text-sm text-[#FAF7F2] print:text-black">
                        <User className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-[#FFB86C]" />
                        {user_name}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="block font-mono font-bold uppercase tracking-wider text-[#FAF7F2]/40 text-[9px]">
                        Email
                      </span>
                      <span className="flex items-center text-xs font-semibold text-[#FAF7F2]/80 truncate print:text-black">
                        <Mail className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-[#FFB86C]" />
                        {user_email}
                      </span>
                    </div>
                  </div>

                  {/* Date & Location Schedule Details */}
                  <div className="space-y-3 pt-3.5 border-t border-white/5">
                    <div className="flex items-start">
                      <Calendar className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-[#FFB86C]" />
                      <div>
                        <span className="block font-mono font-bold uppercase tracking-wider text-[#FAF7F2]/40 text-[9px] mb-0.5">
                          Schedule Date
                        </span>
                        <span className="font-semibold text-xs text-[#FAF7F2] print:text-black">
                          {formattedEventDate}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-[#FFB86C]" />
                      <div>
                        <span className="block font-mono font-bold uppercase tracking-wider text-[#FAF7F2]/40 text-[9px] mb-0.5">
                          Venue Location
                        </span>
                        <span className="font-semibold text-xs text-[#FAF7F2] print:text-black">
                          {event_venue}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket ID & Pricing Information */}
                  <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-white/5">
                    <div>
                      <span className="block font-mono font-bold uppercase tracking-wider text-[#FAF7F2]/40 text-[9px] mb-0.5">
                        Ticket Number
                      </span>
                      <code className="block tracking-wider font-mono font-bold text-[11px] text-[#FFB86C] print:text-black">
                        {ticket_number}
                      </code>
                    </div>
                    <div>
                      <span className="block font-mono font-bold uppercase tracking-wider text-[#FAF7F2]/40 text-[9px] mb-0.5">
                        Pass Price
                      </span>
                      <span className="flex items-center text-xs font-bold text-[#FAF7F2] print:text-black">
                        {parseFloat(event_price) === 0 ? (
                          <span className="text-[#8AC926] font-mono font-bold uppercase text-[11px] tracking-wide">
                            FREE Entry
                          </span>
                        ) : (
                          <>
                            <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-[#FFB86C]" />
                            {event_price}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* QR Code Graphic Section */}
                  <div className="flex flex-col items-center justify-center pt-5 mt-2 relative border-t border-dashed border-white/10">
                    {/* Punch Holes left & right (dashed level) */}
                    <div className="absolute -left-9 -top-3 w-5 h-5 rounded-full bg-[#1A1612] border border-white/10 print:bg-white print:border-slate-200" />
                    <div className="absolute -right-9 -top-3 w-5 h-5 rounded-full bg-[#1A1612] border border-white/10 print:bg-white print:border-slate-200" />

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden print:border print:border-slate-300 print:bg-white">
                      {/* Interactive glowing ring background */}
                      <motion.div 
                        className="absolute inset-0 bg-[#FFB86C]/10 rounded-2xl pointer-events-none"
                        animate={{ scale: [0.96, 1.08, 0.96], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <div className="bg-white rounded-xl p-2 relative overflow-hidden z-10 shadow-lg">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&ecc=H&data=${encodeURIComponent(ticket_number)}`}
                          alt="Ticket QR Code"
                          className="w-28 h-28 print:w-32 print:h-32"
                          style={{ borderRadius: '4px', display: 'block' }}
                        />
                        {/* Scanning Laser Sweep Animation */}
                        <motion.div 
                          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFB86C] to-transparent shadow-[0_0_8px_#FFB86C]"
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <span className="font-mono font-bold uppercase tracking-[0.15em] block text-[#FAF7F2]/45 text-[8px]">
                        Scan at Entrance · Do Not Share
                      </span>
                    </div>
                  </div>

                  {/* Attendance Check-in Status Badge */}
                  <div className="pt-2 text-center border-t border-white/5">
                    {isCheckedIn ? (
                      <div className="inline-flex items-center space-x-2 bg-[#8AC926]/10 text-[#8AC926] px-4 py-1.5 rounded-full font-mono font-bold border border-[#8AC926]/20 print:border-emerald-700 print:text-emerald-700 text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Checked-in · {new Date(checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-2 bg-[#FFB86C]/10 text-[#FFB86C] px-4 py-1.5 rounded-full font-mono font-bold border border-[#FFB86C]/25 print:border-amber-700 print:text-amber-700 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified · Entry Allowed</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Bottom branding watermark banner */}
                <div className="px-6 py-3 flex justify-between items-center border-t border-white/5 bg-white/[0.02]">
                  <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#FAF7F2]/40">
                    campuspass.io
                  </span>
                  <Sparkles className="w-3 h-3 text-[#FAF7F2]/30" />
                  <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#FAF7F2]/40">
                    campus events ticketing
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons Trigger */}
            <div className="space-y-3.5 print:hidden">
              <button
                onClick={handlePrint}
                className="w-full btn-primary py-3.5 text-xs flex items-center justify-center space-x-2 uppercase tracking-wider font-bold shadow-[0_4px_20px_rgba(255,184,108,0.3)]"
              >
                <Download className="w-4 h-4" />
                <span>Download Ticket PDF</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT: Info Panels ── */}
          <div className="space-y-6 print:hidden">

            {/* Event Summary Detail Box */}
            <div className="custom-card relative overflow-hidden">
              <div className="flex items-center mb-4 border-b border-white/5 pb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 bg-[#FFB86C]/10 border border-[#FFB86C]/20">
                  <Info className="w-4.5 h-4.5 text-[#FFB86C]" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#FAF7F2] font-display">
                    Event Summary
                  </h2>
                  <p className="text-xs text-[#FAF7F2]/60">
                    Quick overview of your booking
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Countdown Badge */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2.5 text-[#FFB86C]" />
                    <span className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]/60">
                      {isCheckedIn ? 'Attendance' : isPast ? 'Event Status' : 'Event In'}
                    </span>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-[#FFB86C]">
                    {isCheckedIn ? '✓ Attended' :
                     isPast ? 'Completed' :
                     daysUntil === 0 ? 'Today!' :
                     daysUntil === 1 ? 'Tomorrow' :
                     `${daysUntil} days`}
                  </span>
                </div>

                {/* Info parameters list */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Event', value: event_title, icon: Ticket },
                    { label: 'Venue', value: event_venue, icon: MapPin },
                    { label: 'Date', value: new Date(event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), icon: Calendar },
                    { label: 'Amount Paid', value: parseFloat(event_price) === 0 ? 'Free' : `₹${event_price}`, icon: IndianRupee },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="flex items-center mb-1 text-[#FAF7F2]/40 text-[8px] uppercase tracking-wider font-mono font-bold">
                        <Icon className="w-3 h-3 mr-1 text-[#FFB86C]/60" />
                        {label}
                      </span>
                      <p className="font-bold truncate text-xs text-[#FAF7F2]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Interactive Entry Guide Instructions */}
            <div className="custom-card relative overflow-hidden">
              <div className="flex items-center mb-4 border-b border-white/5 pb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 bg-[#FFB86C]/10 border border-[#FFB86C]/20">
                  <ClipboardCheck className="w-4.5 h-4.5 text-[#FFB86C]" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#FAF7F2] font-display">
                    Entry Guide
                  </h2>
                  <p className="text-xs text-[#FAF7F2]/60">
                    What to do on event day
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { step: '01', icon: Smartphone, title: 'Open this ticket', desc: 'Navigate to My Tickets → View QR Code on your phone.' },
                  { step: '02', icon: QrCode, title: 'Show QR at gate', desc: 'The event scanner will verify your unique QR code for entry.' },
                  { step: '03', icon: BadgeCheck, title: 'Get checked in', desc: 'After scan, your attendance is logged and entry is confirmed.' },
                ].map(({ step, icon: Icon, title, desc }) => (
                  <div key={step} className="flex items-start p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 bg-[#FFB86C]/10 border border-[#FFB86C]/20">
                      <Icon className="w-4 h-4 text-[#FFB86C]" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-xs text-[#FAF7F2] mb-0.5">
                        <span className="text-[#FFB86C] mr-1">{step}.</span>{title}
                      </p>
                      <p className="text-[11px] leading-relaxed text-[#FAF7F2]/60">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Essential Alert Warnings Notice Card */}
            <div className="p-5 rounded-2xl bg-[#FFB86C]/5 border border-[#FFB86C]/20 backdrop-blur-xl">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0 text-[#FFB703]" />
                <div className="flex-1">
                  <p className="font-mono font-bold mb-3 uppercase tracking-wider text-[#FFB703] text-[10px]">
                    Important Entry Notes
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Carry a valid college ID alongside this ticket.',
                      'This QR code is unique to you — do not share it.',
                      'Entry closes 15 minutes after event start time.',
                      'The ticket is non-transferable and non-refundable.',
                    ].map((note, i) => (
                      <li key={i} className="flex items-start text-xs leading-relaxed text-[#FAF7F2]/75">
                        <span className="mr-2 font-black text-[#FFB703] font-mono">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
          {/* ── END RIGHT COLUMN ── */}

        </div>
      </div>
    </div>
  );
};

export default TicketView;
