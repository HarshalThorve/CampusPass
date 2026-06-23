const API_BASE_URL = 'http://localhost:5000/api';

import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token into requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  googleLogin: async (name, email) => {
    const response = await api.post('/auth/google-login', { name, email });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Events endpoints
export const eventService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/events', { params: filters });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  create: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },
  update: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  }
};

// Registrations endpoints
export const registrationService = {
  create: async (eventId) => {
    const response = await api.post('/registrations/create', { eventId });
    return response.data;
  },
  verifyPayment: async (paymentData) => {
    const response = await api.post('/registrations/verify-payment', paymentData);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/registrations/history');
    return response.data;
  },
  cancel: async (registrationId) => {
    const response = await api.delete(`/registrations/${registrationId}/cancel`);
    return response.data;
  },
  getByEventId: async (eventId) => {
    const response = await api.get(`/registrations/event/${eventId}`);
    return response.data;
  }
};

// Tickets endpoints
export const ticketService = {
  getById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },
  getByRegistrationId: async (regId) => {
    const response = await api.get(`/tickets/registration/${regId}`);
    return response.data;
  }
};

// Attendance endpoints
export const attendanceService = {
  scan: async (ticketNumber) => {
    const response = await api.post('/attendance/scan', { ticketNumber });
    return response.data;
  },
  getByEventId: async (eventId) => {
    const response = await api.get(`/attendance/event/${eventId}`);
    return response.data;
  }
};

// Analytics endpoints
export const analyticsService = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  }
};

// Certificates endpoints
export const certificateService = {
  check: async (registrationId) => {
    const response = await api.get(`/certificates/check/${registrationId}`);
    return response.data;
  },
  issue: async (registrationId) => {
    const response = await api.post(`/certificates/issue/${registrationId}`);
    return response.data;
  },
  getSettings: async () => {
    const response = await api.get('/certificates/settings');
    return response.data;
  },
  updateSettings: async (settingsData) => {
    const response = await api.put('/certificates/settings', settingsData);
    return response.data;
  }
};

export default api;
