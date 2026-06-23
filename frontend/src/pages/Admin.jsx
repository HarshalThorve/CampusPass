import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eventService, registrationService, certificateService } from '../services/api';
import Modal from '../components/Modal';
import CustomDropdown from '../components/CustomDropdown';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import {
  Plus, Edit, Trash2, Users, Download, MapPin,
  IndianRupee, ShieldCheck, AlertCircle, Info, Ticket, Calendar
} from 'lucide-react';

const CERT_ELIGIBLE = ['technical', 'academic', 'sports'];

const Admin = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  // Selected Event & Roster states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // Form states for Create/Edit event
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [eventIdToEdit, setEventIdToEdit] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: 'technical',
    price: '0',
    capacity: '100',
    image: '',
    registration_deadline: '',
    issues_certificate: undefined,
    certificate_institution: '',
    certificate_signatory_name: '',
    certificate_signatory_title: '',
    certificate_footer_text: '',
    certificate_theme: 'cream',
    certificate_background_url: ''
  });

  const [settings, setSettings] = useState({
    institution_name: '',
    organizer_name: '',
    organizer_title: '',
    footer_text: ''
  });
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAll();
      setEvents(data);
    } catch (err) {
      console.error('Error loading events:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await certificateService.getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error loading certificate settings:', err.message);
    }
  };

  const saveSettings = async () => {
    setSettingsError('');
    setSettingsSuccess(false);
    try {
      await certificateService.updateSettings(settings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSettingsError(err.response?.data?.error || 'Failed to save certificate settings.');
    }
  };

  useEffect(() => {
    loadEvents();
    loadSettings();
  }, []);

  const openCreateModal = () => {
    setFormMode('create');
    setFormData({
      title: '',
      description: '',
      date: '',
      venue: '',
      category: 'technical',
      price: '0',
      capacity: '100',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      registration_deadline: '',
      issues_certificate: undefined,
      certificate_institution: settings.institution_name || 'CampusPass Institute',
      certificate_signatory_name: settings.organizer_name || 'Admin User',
      certificate_signatory_title: settings.organizer_title || 'Event Coordinator',
      certificate_footer_text: settings.footer_text || 'This certificate is digitally verified by CampusPass.',
      certificate_theme: 'cream',
      certificate_background_url: ''
    });
    setFormError('');
    setIsEventModalOpen(true);
  };

  const openEditModal = (event) => {
    setFormMode('edit');
    setEventIdToEdit(event.id);

    const formatDateForInput = (dateStr) => {
      const d = new Date(dateStr);
      const pad = (num) => String(num).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormData({
      title: event.title,
      description: event.description,
      date: formatDateForInput(event.date),
      venue: event.venue,
      category: event.category,
      price: String(Math.round(event.price)),
      capacity: String(event.capacity),
      image: event.image || '',
      registration_deadline: formatDateForInput(event.registration_deadline),
      issues_certificate: event.issues_certificate,
      certificate_institution: event.certificate_institution || settings.institution_name || 'CampusPass Institute',
      certificate_signatory_name: event.certificate_signatory_name || settings.organizer_name || 'Admin User',
      certificate_signatory_title: event.certificate_signatory_title || settings.organizer_title || 'Event Coordinator',
      certificate_footer_text: event.certificate_footer_text || settings.footer_text || 'This certificate is digitally verified by CampusPass.',
      certificate_theme: event.certificate_theme || 'cream',
      certificate_background_url: event.certificate_background_url || ''
    });
    setFormError('');
    setIsEventModalOpen(true);
  };

  const openRosterModal = async (event) => {
    setSelectedEvent(event);
    setRoster([]);
    setRosterLoading(true);
    setIsRosterModalOpen(true);

    try {
      const data = await registrationService.getByEventId(event.id);
      setRoster(data);
    } catch (err) {
      console.error('Failed to load roster:', err.message);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      if (name === 'category') {
        const defaultImages = [
          'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
          ''
        ];

        if (defaultImages.includes(prev.image)) {
          const categoryImages = {
            technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
            sports: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
            cultural: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
            academic: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'
          };
          updated.image = categoryImages[value] || categoryImages.technical;
        }
      }
      return updated;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const priceNum = parseFloat(formData.price);
    const capacityNum = parseInt(formData.capacity);

    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Price must be a valid positive number.');
      return;
    }

    if (isNaN(capacityNum) || capacityNum <= 0) {
      setFormError('Capacity must be a positive integer.');
      return;
    }

    if (new Date(formData.registration_deadline) > new Date(formData.date)) {
      setFormError('Registration deadline must be before the event date.');
      return;
    }

    const defaultCertValue = CERT_ELIGIBLE.includes((formData.category || '').toLowerCase());

    try {
      const eventPayload = {
        ...formData,
        price: priceNum,
        capacity: capacityNum,
        issues_certificate: formData.issues_certificate ?? defaultCertValue
      };

      if (formMode === 'create') {
        await eventService.create(eventPayload);
      } else {
        await eventService.update(eventIdToEdit, eventPayload);
      }

      setIsEventModalOpen(false);
      loadEvents();
    } catch (err) {
      console.error('Form submission failed:', err);
      setFormError(err.response?.data?.message || 'Failed to submit event details.');
    }
  };

  const handleDeleteEvent = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDeleteEvent = async () => {
    const id = deleteTarget;
    setDeleteTarget(null);
    try {
      await eventService.delete(id);
      loadEvents();
      setToast({ message: 'Event deleted successfully.', type: 'success' });
    } catch (err) {
      console.error('Delete event failed:', err);
      setToast({ message: err.response?.data?.message || 'Failed to delete event.', type: 'error' });
    }
  };

  const exportRosterToCSV = () => {
    if (roster.length === 0) return;

    const headers = ['Registration ID', 'Student Name', 'Email', 'Ticket Number', 'Payment Status', 'Attendance Status', 'Registered At', 'Checkin Time'];
    const rows = roster.map(item => [
      item.registration_id,
      `"${item.user_name.replace(/"/g, '""')}"`,
      item.user_email,
      item.ticket_number || 'N/A',
      item.payment_status.toUpperCase(),
      item.attendance_status.toUpperCase(),
      new Date(item.registered_at).toLocaleString(),
      item.checkin_time ? new Date(item.checkin_time).toLocaleString() : 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CampusPass_Roster_${selectedEvent.title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex-1 px-4 md:px-20 py-10">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action will cancel all registered tickets."
        confirmLabel="Delete"
        onConfirm={confirmDeleteEvent}
        onCancel={() => setDeleteTarget(null)}
        danger
      />

      {/* Header Row */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] font-display">
            Event Management Console
          </h1>
          <p className="text-sm text-[rgba(250,247,242,0.5)] mt-1 font-sans">
            Publish, edit, delete campus events and audit rosters.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreateModal}
          className="btn-primary btn-shimmer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </motion.button>
      </motion.div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="custom-card p-4 flex items-center justify-between">
          <div>
            <span className="block text-[rgba(250,247,242,0.35)] text-[11px] font-semibold uppercase tracking-wider">Active Events</span>
            <span className="block text-[#FAF7F2] text-2xl font-display font-bold mt-1">{events.length}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FFB86C]/10 text-[#FFB86C] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="custom-card p-4 flex items-center justify-between">
          <div>
            <span className="block text-[rgba(250,247,242,0.35)] text-[11px] font-semibold uppercase tracking-wider">Total Capacity</span>
            <span className="block text-[#FAF7F2] text-2xl font-display font-bold mt-1">
              {events.reduce((sum, e) => sum + e.capacity, 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E9C46A]/10 text-[#E9C46A] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="custom-card p-4 flex items-center justify-between">
          <div>
            <span className="block text-[rgba(250,247,242,0.35)] text-[11px] font-semibold uppercase tracking-wider">Total Registered</span>
            <span className="block text-[#FAF7F2] text-2xl font-display font-bold mt-1">
              {events.reduce((sum, e) => sum + (e.registered_count || 0), 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#8AC926]/10 text-[#8AC926] flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Events Table Container — rounded glass card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#FFB86C', borderTopColor: 'transparent' }}></div>
            <p className="text-sm text-[rgba(250,247,242,0.5)] font-mono">Loading events schedule...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center">
            <Info className="w-12 h-12 text-[#c8a96e] mx-auto mb-3 opacity-80" />
            <p className="text-[rgba(250,247,242,0.5)] font-sans m-0">No events registered yet.</p>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={openCreateModal} 
              className="btn-ghost mt-4 text-xs uppercase"
            >
              Create First Event
            </motion.button>
          </div>
        ) : (
          <>
            {/* Mobile Cards (Below md) */}
            <div className="md:hidden p-4 space-y-4">
              {events.map((event, index) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                  className="bg-white/[0.04] border border-white/10 rounded-xl p-4 space-y-3"
                >
                  <div>
                    <span className="font-bold text-[#FAF7F2] block">{event.title}</span>
                    <span className="text-xs text-[rgba(250,247,242,0.5)] font-sans flex items-center mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-[#FFB86C]" />
                      {event.venue} · {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <span className="capitalize px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[rgba(250,247,242,0.7)]">{event.category}</span>
                    <span className="font-bold text-[#FFB86C]">
                      {parseFloat(event.price) === 0 ? 'FREE' : `₹${Math.round(event.price)}`}
                    </span>
                    <span className="text-[rgba(250,247,242,0.5)]">{event.registered_count}/{event.capacity} filled</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openRosterModal(event)} 
                      className="flex-1 btn-ghost py-2 text-[10px] min-h-[38px]"
                    >
                      <Users className="w-4 h-4 mr-1.5 inline" /> Roster
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      onClick={() => openEditModal(event)} 
                      className="p-2 border border-white/10 rounded-lg text-[rgba(250,247,242,0.5)] hover:text-[#FFB86C] hover:bg-white/[0.06] flex items-center justify-center" 
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      onClick={() => handleDeleteEvent(event.id)} 
                      className="p-2 border border-white/10 rounded-lg text-[rgba(250,247,242,0.5)] hover:text-[#E76F51] hover:bg-[#E76F51]/10 flex items-center justify-center" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table (md and above) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr 
                    style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <th style={{ padding: '14px 24px', color: 'rgba(250,247,242,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace' }}>Event Details</th>
                    <th style={{ padding: '14px 24px', color: 'rgba(250,247,242,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace' }}>Category</th>
                    <th style={{ padding: '14px 24px', color: 'rgba(250,247,242,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace' }}>Pass Price</th>
                    <th style={{ padding: '14px 24px', color: 'rgba(250,247,242,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace' }}>Tickets Filled</th>
                    <th style={{ padding: '14px 24px', color: 'rgba(250,247,242,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-sm text-[rgba(250,247,242,0.75)]">
                  {events.map((event, index) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                      className="transition-colors duration-150"
                      style={{ cursor: 'default' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,184,108,0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Title & Venue */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-[#FAF7F2] block font-display">{event.title}</span>
                          <span className="text-xs text-[rgba(250,247,242,0.4)] font-sans flex items-center mt-1">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-[#FFB86C]" />
                            {event.venue} | {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 capitalize font-semibold text-xs text-[rgba(250,247,242,0.6)]">
                        {event.category}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-bold text-[#FAF7F2]">
                        {parseFloat(event.price) === 0 ? (
                          <span className="font-semibold text-xs text-[#8AC926]">FREE</span>
                        ) : (
                          <span className="flex items-center">
                            <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                            {Math.round(event.price)}
                          </span>
                        )}
                      </td>

                      {/* Tickets stats */}
                      <td className="px-6 py-4">
                        <div className="w-[120px]">
                          <span className="font-semibold text-[#FAF7F2] text-xs">
                            {event.registered_count} / {event.capacity}
                          </span>
                          <div className="progress-track mt-1.5">
                            <motion.div
                              className="progress-fill"
                              initial={{ width: '0%' }}
                              animate={{ width: `${Math.min(100, (event.registered_count / event.capacity) * 100)}%` }}
                              transition={{ duration: 0.8, delay: 0.3 + index * 0.05, ease: 'easeOut' }}
                              style={{
                                minWidth: event.registered_count > 0 ? '4px' : '0'
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                          {/* Roster button */}
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.93 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            onClick={() => openRosterModal(event)}
                            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86C] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              border: '1px solid rgba(255,255,255,0.08)',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(250,247,242,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255,184,108,0.12)';
                              e.currentTarget.style.borderColor = 'rgba(255,184,108,0.3)';
                              e.currentTarget.style.color = '#FFB86C';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                              e.currentTarget.style.color = 'rgba(250,247,242,0.4)';
                            }}
                            title="View Registrations"
                          >
                            <Users className="w-4 h-4" />
                          </motion.button>
                          {/* Edit button */}
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.93 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            onClick={() => openEditModal(event)}
                            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9C46A] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              border: '1px solid rgba(255,255,255,0.08)',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(250,247,242,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(233,196,106,0.12)';
                              e.currentTarget.style.borderColor = 'rgba(233,196,106,0.3)';
                              e.currentTarget.style.color = '#E9C46A';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                              e.currentTarget.style.color = 'rgba(250,247,242,0.4)';
                            }}
                            title="Edit Event"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          {/* Delete button */}
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.93 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            onClick={() => handleDeleteEvent(event.id)}
                            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E76F51] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              border: '1px solid rgba(255,255,255,0.08)',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(250,247,242,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(231,111,81,0.12)';
                              e.currentTarget.style.borderColor = 'rgba(231,111,81,0.3)';
                              e.currentTarget.style.color = '#E76F51';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                              e.currentTarget.style.color = 'rgba(250,247,242,0.4)';
                            }}
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={formMode === 'create' ? 'Create Campus Event' : 'Update Event Details'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-center space-x-2 bg-[#E76F51]/10 border border-[#E76F51]/20 p-3 rounded-xl text-[#E76F51] text-xs font-mono">
              <AlertCircle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="label-field">Event Name</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleFormChange}
              placeholder="e.g. HackSummit 2026"
              className="input-field w-full text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="label-field">Category</label>
              <CustomDropdown
                value={formData.category}
                onChange={(val) => handleFormChange({ target: { name: 'category', value: val } })}
                options={[
                  { value: 'technical', label: 'Technical' },
                  { value: 'cultural', label: 'Cultural' },
                  { value: 'sports', label: 'Sports' },
                  { value: 'academic', label: 'Academic' }
                ]}
              />
            </div>

            {/* Ticket Price */}
            <div>
              <label className="label-field">Price (INR)</label>
              <div className="relative">
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleFormChange}
                  placeholder="0 for FREE"
                  className="input-field pl-9 w-full text-sm"
                />
                <IndianRupee className="absolute left-3.5 top-3.5 w-4 h-4 text-[rgba(250,247,242,0.45)]" />
              </div>
            </div>
          </div>

          {/* Certificate Toggle */}
          <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="issues_certificate"
                checked={formData.issues_certificate ?? CERT_ELIGIBLE.includes((formData.category || '').toLowerCase())}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  issues_certificate: e.target.checked
                }))}
                className="w-4 h-4 rounded bg-white/[0.06] border-white/10 text-[#FFB86C] focus:ring-[#FFB86C]/40 accent-[#FFB86C]"
              />
              <label htmlFor="issues_certificate" className="text-xs font-mono font-semibold text-[#FAF7F2] cursor-pointer select-none">
                {(formData.issues_certificate ?? CERT_ELIGIBLE.includes((formData.category || '').toLowerCase()))
                  ? '✅ Certificates will be issued to attendees'
                  : '🚫 No certificates for this event'}
              </label>
            </div>
            {(formData.category || '').toLowerCase() === 'cultural' && (
              <p className="text-[10px] text-[#FFB703] mt-2 font-mono flex items-center mb-0">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                Cultural events do not issue certificates by default. Enable manually only if appropriate.
              </p>
            )}
          </div>

          {/* Certificate Template Fields */}
          {(formData.issues_certificate ?? CERT_ELIGIBLE.includes((formData.category || '').toLowerCase())) && (
            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-3">
              <p className="text-xs font-mono font-bold text-[#FAF7F2] uppercase tracking-wider mb-1">
                🎓 Custom Certificate Template
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field !text-[10px]">Institution Name</label>
                  <input
                    type="text"
                    name="certificate_institution"
                    required
                    value={formData.certificate_institution}
                    onChange={handleFormChange}
                    placeholder="e.g. PHCET Department of IT"
                    className="input-field w-full py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="label-field !text-[10px]">Signatory / Host Name</label>
                  <input
                    type="text"
                    name="certificate_signatory_name"
                    required
                    value={formData.certificate_signatory_name}
                    onChange={handleFormChange}
                    placeholder="e.g. Dr. John Doe"
                    className="input-field w-full py-2 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field !text-[10px]">Signatory Title</label>
                  <input
                    type="text"
                    name="certificate_signatory_title"
                    required
                    value={formData.certificate_signatory_title}
                    onChange={handleFormChange}
                    placeholder="e.g. HOD Computer Department"
                    className="input-field w-full py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="label-field !text-[10px]">Footer Text</label>
                  <input
                    type="text"
                    name="certificate_footer_text"
                    required
                    value={formData.certificate_footer_text}
                    onChange={handleFormChange}
                    placeholder="e.g. Digitally verified by CampusPass."
                    className="input-field w-full py-2 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="label-field !text-[10px]">Certificate Design / Theme</label>
                  <CustomDropdown
                    value={formData.certificate_theme}
                    onChange={(val) => handleFormChange({ target: { name: 'certificate_theme', value: val } })}
                    className="input-field w-full py-2 text-xs"
                    options={[
                      { value: 'cream', label: 'Classic Cream (Default)' },
                      { value: 'dark', label: 'Midnight Gold (Dark)' },
                      { value: 'blue', label: 'Royal Indigo (Blue)' },
                      { value: 'emerald', label: 'Luxury Emerald (Green)' },
                      { value: 'custom', label: 'Custom Template Image' }
                    ]}
                  />
                </div>
                {formData.certificate_theme === 'custom' ? (
                  <div>
                    <label className="label-field !text-[10px]">Background Image URL</label>
                    <input
                      type="url"
                      name="certificate_background_url"
                      required
                      value={formData.certificate_background_url}
                      onChange={handleFormChange}
                      placeholder="e.g. https://domain.com/cert-bg.png"
                      className="input-field w-full py-2 text-xs"
                    />
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Event Schedule (Date/Time)</label>
              <input
                type="datetime-local"
                name="date"
                required
                value={formData.date}
                onChange={handleFormChange}
                className="input-field w-full text-sm"
              />
            </div>

            <div>
              <label className="label-field">Registration Deadline</label>
              <input
                type="datetime-local"
                name="registration_deadline"
                required
                value={formData.registration_deadline}
                onChange={handleFormChange}
                className="input-field w-full text-sm"
              />
            </div>
          </div>

          {/* Venue & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Location Venue</label>
              <input
                type="text"
                name="venue"
                required
                value={formData.venue}
                onChange={handleFormChange}
                placeholder="e.g. Campus Grounds"
                className="input-field w-full text-sm"
              />
            </div>

            <div>
              <label className="label-field">Max Capacity (Seats)</label>
              <input
                type="number"
                name="capacity"
                required
                min="1"
                value={formData.capacity}
                onChange={handleFormChange}
                placeholder="e.g. 150"
                className="input-field w-full text-sm"
              />
            </div>
          </div>

          {/* Banner URL */}
          <div>
            <label className="label-field">Banner Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleFormChange}
              placeholder="e.g. https://images.unsplash.com/photo-..."
              className="input-field w-full text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label-field">Event Description</label>
            <textarea
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Provide event details, itinerary, prizes..."
              className="input-field w-full text-sm"
            ></textarea>
          </div>

          {/* Footer buttons */}
          <div className="flex space-x-3 justify-end pt-4 border-t border-white/10">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsEventModalOpen(false)}
              className="btn-ghost text-xs"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary text-xs btn-shimmer"
            >
              {formMode === 'create' ? 'Publish Event' : 'Save Updates'}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Roster Modal */}
      <Modal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        title={selectedEvent ? `Roster: ${selectedEvent.title}` : 'Registrations'}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[rgba(250,247,242,0.45)] font-mono">
              {roster.length} Successful Registrations
            </span>
            {roster.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={exportRosterToCSV}
                className="btn-primary py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider btn-shimmer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </motion.button>
            )}
          </div>

          {rosterLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderColor: '#FFB86C', borderTopColor: 'transparent' }}></div>
              <p className="text-xs text-[rgba(250,247,242,0.45)] font-mono">Fetching participant list...</p>
            </div>
          ) : roster.length === 0 ? (
            <div className="py-12 text-center text-[rgba(250,247,242,0.45)] text-sm font-mono">
              No active registrations found for this event.
            </div>
          ) : (
            <div className="border border-white/10 rounded-xl overflow-hidden max-h-[50vh] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/[0.04] border-b border-white/10 text-[rgba(250,247,242,0.45)] font-mono font-bold uppercase">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Ticket</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-[rgba(250,247,242,0.7)]">
                  {roster.map((row) => (
                    <tr key={row.registration_id}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#FAF7F2]">{row.user_name}</div>
                        <div className="text-[10px] text-[rgba(250,247,242,0.45)] mt-0.5">{row.user_email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] font-bold text-[#FFB86C]">
                        {row.ticket_number || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.payment_status === 'completed'
                            ? 'bg-[#8AC926]/10 text-[#8AC926]'
                            : 'bg-[#FFB703]/10 text-[#FFB703]'
                        }`}>
                          {row.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.attendance_status === 'present' ? (
                          <span className="flex items-center text-[#8AC926] font-bold text-[10px]">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            Present
                          </span>
                        ) : (
                          <span className="text-[rgba(250,247,242,0.4)]">Absent</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Admin;
