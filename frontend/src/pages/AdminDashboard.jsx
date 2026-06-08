import React, { useState, useEffect } from 'react';
import { eventService, registrationService } from '../services/api';
import Modal from '../components/Modal';
import { 
  Plus, Edit, Trash2, Users, Download, Calendar, MapPin, 
  IndianRupee, Tag, ShieldCheck, AlertCircle, Info 
} from 'lucide-react';

const AdminDashboard = () => {
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
    registration_deadline: ''
  });

  const [formError, setFormError] = useState('');

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

  useEffect(() => {
    loadEvents();
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
      image: '',
      registration_deadline: ''
    });
    setFormError('');
    setIsEventModalOpen(true);
  };

  const openEditModal = (event) => {
    setFormMode('edit');
    setEventIdToEdit(event.id);
    
    // Format dates to fit input datetime-local (YYYY-MM-DDThh:mm)
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
      registration_deadline: formatDateForInput(event.registration_deadline)
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate pricing and capacity
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

    try {
      const eventPayload = {
        ...formData,
        price: priceNum,
        capacity: capacityNum
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
    if (!window.confirm('Are you sure you want to delete this event? This action will cancel all registered tickets.')) {
      return;
    }

    try {
      await eventService.delete(id);
      loadEvents();
    } catch (err) {
      console.error('Delete event failed:', err);
      alert(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  const exportRosterToCSV = () => {
    if (roster.length === 0) return;

    // Headers
    const headers = ['Registration ID', 'Student Name', 'Email', 'Ticket Number', 'Payment Status', 'Attendance Status', 'Registered At', 'Checkin Time'];
    
    // Map rows
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

    // Create CSV content string
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    // Trigger download
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
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-dark-100 font-display">
            Event Management Console
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Publish, edit, delete campus events and audit rosters.
          </p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center space-x-2 text-sm"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Main events table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-dark-800 shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-slate-400 font-semibold">Loading events schedule...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center">
            <Info className="w-12 h-12 text-slate-300 dark:text-dark-800 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-dark-400 font-medium">No events registered yet.</p>
            <button onClick={openCreateModal} className="btn-secondary mt-4 text-xs">Create First Event</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-dark-850/50 border-b border-slate-200 dark:border-dark-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Event Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Pass Price</th>
                  <th className="px-6 py-4">Tickets Filled</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-850 text-sm">
                {events.map((event) => (
                  <tr 
                    key={event.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-dark-900/40 transition-colors"
                  >
                    {/* Title & Venue */}
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-dark-200 block">{event.title}</span>
                        <span className="text-xs text-slate-400 font-semibold flex items-center mt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {event.venue} | {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    
                    {/* Category */}
                    <td className="px-6 py-4 capitalize font-semibold text-xs text-slate-600 dark:text-dark-300">
                      {event.category}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-dark-200">
                      {parseFloat(event.price) === 0 ? (
                        <span className="text-emerald-500 font-semibold text-xs">FREE</span>
                      ) : (
                        <span className="flex items-center">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                          {Math.round(event.price)}
                        </span>
                      )}
                    </td>

                    {/* Tickets stats */}
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-dark-200">
                          {event.registered_count} / {event.capacity}
                        </span>
                        <div className="w-24 bg-slate-100 dark:bg-dark-850 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className="bg-primary-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, (event.registered_count / event.capacity) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={() => openRosterModal(event)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                          title="View Registrations"
                        >
                          <Users className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. Create/Edit Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={formMode === 'create' ? 'Create Campus Event' : 'Update Event Details'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {formError && (
            <div className="flex items-center space-x-2 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40 p-3 rounded-lg text-rose-500 text-xs font-semibold">
              <AlertCircle className="w-4.5 h-4.5" />
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
              className="input-field text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="label-field">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="input-field text-sm"
              >
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="academic">Academic</option>
              </select>
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
                  className="input-field pl-8 text-sm"
                />
                <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date & Time */}
            <div>
              <label className="label-field">Event Schedule (Date/Time)</label>
              <input
                type="datetime-local"
                name="date"
                required
                value={formData.date}
                onChange={handleFormChange}
                className="input-field text-sm"
              />
            </div>

            {/* Registration Deadline */}
            <div>
              <label className="label-field">Registration Deadline</label>
              <input
                type="datetime-local"
                name="registration_deadline"
                required
                value={formData.registration_deadline}
                onChange={handleFormChange}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Venue */}
            <div>
              <label className="label-field">Location Venue</label>
              <input
                type="text"
                name="venue"
                required
                value={formData.venue}
                onChange={handleFormChange}
                placeholder="e.g. Campus Grounds"
                className="input-field text-sm"
              />
            </div>

            {/* Capacity */}
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
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* Banner image url */}
          <div>
            <label className="label-field">Banner Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleFormChange}
              placeholder="e.g. https://images.unsplash.com/photo-..."
              className="input-field text-sm"
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
              className="input-field text-sm"
            ></textarea>
          </div>

          {/* Footer buttons */}
          <div className="flex space-x-3 justify-end pt-4 border-t border-slate-100 dark:border-dark-850">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs"
            >
              {formMode === 'create' ? 'Publish Event' : 'Save Updates'}
            </button>
          </div>

        </form>
      </Modal>

      {/* 2. Roster Modal */}
      <Modal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        title={selectedEvent ? ` Roster: ${selectedEvent.title}` : 'Registrations'}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-semibold">
              {roster.length} Successful Registrations
            </span>
            {roster.length > 0 && (
              <button
                onClick={exportRosterToCSV}
                className="btn-accent text-xs flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export to CSV</span>
              </button>
            )}
          </div>

          {rosterLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-400 font-medium">Fetching participant list...</p>
            </div>
          ) : roster.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-dark-600 text-sm">
              No active registrations found for this event.
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-dark-800 rounded-xl overflow-hidden max-h-[50vh] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dark-850/50 border-b border-slate-200 dark:border-dark-800 text-slate-500 font-bold uppercase">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Ticket</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-850 text-slate-600 dark:text-dark-300">
                  {roster.map((row) => (
                    <tr key={row.registration_id}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800 dark:text-dark-200">{row.user_name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{row.user_email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] font-bold text-primary-600 dark:text-primary-400">
                        {row.ticket_number || 'N/A'}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.payment_status === 'completed' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-500'
                        }`}>
                          {row.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.attendance_status === 'present' ? (
                          <span className="flex items-center text-emerald-500 font-bold text-[10px]">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            Present
                          </span>
                        ) : (
                          <span className="text-slate-400">Absent</span>
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

export default AdminDashboard;
