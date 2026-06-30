-- CampusPass Database Schema

-- Drop tables if they exist (ordered by dependencies)
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS certificate_settings CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student', -- 'student', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP NOT NULL, -- Date and time
    venue VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    capacity INTEGER NOT NULL,
    image VARCHAR(1000), -- Banner image URL
    registration_deadline TIMESTAMP NOT NULL,
    issues_certificate BOOLEAN DEFAULT true,
    certificate_institution VARCHAR(200) DEFAULT 'CampusPass Institute',
    certificate_signatory_name VARCHAR(200) DEFAULT 'Admin User',
    certificate_signatory_title VARCHAR(200) DEFAULT 'Event Coordinator',
    certificate_footer_text VARCHAR(500) DEFAULT 'This certificate is digitally verified by CampusPass.',
    certificate_theme VARCHAR(50) DEFAULT 'cream',
    certificate_background_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations Table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    attendance_status VARCHAR(20) NOT NULL DEFAULT 'absent', -- 'absent', 'present'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_event UNIQUE (user_id, event_id)
);

-- Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'pending', 'successful', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets Table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE UNIQUE,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    qr_code TEXT NOT NULL, -- QR code payload/data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE UNIQUE,
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_registrations_user_event ON registrations(user_id, event_id);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_event_id ON payments(event_id);
CREATE INDEX idx_tickets_number ON tickets(ticket_number);
CREATE INDEX idx_attendance_checkin_time ON attendance(checkin_time);

-- Certificates Table
CREATE TABLE certificates (
    id            SERIAL PRIMARY KEY,
    registration_id INTEGER UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
    user_id       INTEGER REFERENCES users(id),
    event_id      INTEGER REFERENCES events(id),
    certificate_id VARCHAR(50) UNIQUE NOT NULL,
    issued_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_event ON certificates(event_id);

-- Certificate Settings Table
CREATE TABLE certificate_settings (
    id                SERIAL PRIMARY KEY,
    institution_name  VARCHAR(200) DEFAULT 'CampusPass Institute',
    organizer_name    VARCHAR(200) DEFAULT 'Admin User',
    organizer_title   VARCHAR(200) DEFAULT 'Event Coordinator',
    footer_text       VARCHAR(500) DEFAULT 'This certificate is digitally verified by CampusPass.',
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO certificate_settings 
    (institution_name, organizer_name, organizer_title, footer_text)
VALUES 
    ('CampusPass Institute', 'Admin User', 'Event Coordinator', 'This certificate is digitally verified by CampusPass.')
ON CONFLICT DO NOTHING;
