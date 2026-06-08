# CampusPass 🎟️

CampusPass is a production-ready, full-stack college event registration and ticketing platform. It automates user authentication, event scheduling, seat inventory checking, secure paid checkout (Razorpay), QR ticket entry generation, camera-based check-in gate verification, and analytics projections.

## 🚀 Key Features

*   **Secure Authentication**: JWT-based login and signup with password hashing.
*   **Inventory Enforcement**: Real-time seat allocation trackers preventing double-bookings.
*   **Gate Entry QR Pass**: High-fidelity digital pass ticket resembling a university boarding pass, with built-in printable sheets.
*   **Mobile Gate Camera Scanner**: Live camera barcode scanner (using `html5-qrcode`) with a manual typing fallback option.
*   **Admin Dashboard & CSV Exporter**: Published event controls, participant roster views, and client-side CSV downloads.

### 🏆 Hackathon Winning Features
1.  **AI Event Recommendation Engine**: Content-based filtering matching category overlaps and pricing thresholds to offer similar events.
2.  **Revenue Forecasting**: Time-series linear regression algorithm projecting earnings for next 3 months.
3.  **Attendance Heatmap**: Density visual grid binning peak attendance volume by weekday vs. hour of the day.
4.  **Digital Certificate Generator**: Verified certificate generation for students marked "Present" at ended events.
5.  **Gamified Leaderboard**: Global leaderboard scoring students on event participation (50 pts per attendance check-in).
6.  **Dark Mode Support**: Fluid, persistent HSL-tailored theme controls.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js, Vite, Tailwind CSS, Axios, Recharts, Lucide Icons, Canvas Confetti.
*   **Backend**: Node.js, Express.js, JWT, BcryptJS, Nodemailer, Razorpay SDK.
*   **Database**: Supabase PostgreSQL (via node-postgres `pg` pool).

---

## 📂 Project Structure

```text
EventManagement/
├── database/
│   ├── schema.sql           # Database schema definition (DDL)
│   └── seed.js             # Seeding script with initial users, events, and registrations
├── backend/
│   ├── config/             # Database connection setups
│   ├── middleware/         # Auth verify checks
│   ├── routes/             # Authentication, Events, Checkout, Analytics, Scanner APIs
│   ├── services/           # Nodemailer email configurations
│   ├── .env.example        # Environment variables template
│   └── server.js           # Server runner
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, EventCard, MetricCard, Modal
    │   ├── context/        # User Auth and Dark Mode Context state
    │   ├── pages/          # Home, Details, Auth, Student Hub, Admin Roster, Analytics, Scanner
    │   ├── services/       # Central Axios api client
    │   ├── App.jsx         # Routes definition
    │   └── main.jsx        # App mounting
    ├── index.html          # Web page metadata
    ├── postcss.config.js
    └── tailwind.config.js
```

---

## ⚙️ Local Development Setup

### 1. Database Setup (Supabase PostgreSQL)
1.  **Create a Project**: Log in to your **[Supabase Console](https://supabase.com)** and create a new project.
2.  **Get Connection String**:
    *   Navigate to **Project Settings** > **Database** in the Supabase Dashboard.
    *   Scroll down to the **Connection string** section.
    *   Select **URI** (or select the **Node.js** tab/URI string under **Transaction** mode or **Session** mode).
    *   Copy the URI connection string. It will look like this:
        ```text
        postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
        ```
        *(Note: If using connection poolers, you can also use port 5432 for direct connection depending on your network settings, but ensure you include the password you set during project creation).*
3.  **Schema Initialization**: You can either paste and execute the contents of [database/schema.sql](database/schema.sql) in the **SQL Editor** on the Supabase dashboard, or let the seed script initialize it automatically.

### 2. Backend Server Configuration
1.  Navigate into the `backend` folder:
    ```bash
    cd backend
    ```
2.  Create a `.env` file from the example:
    ```bash
    cp .env.example .env
    ```
3.  Fill in the variables. Set `DATABASE_URL` to your Supabase PostgreSQL connection string and ensure `DB_SSL=true` is enabled:
    ```env
    PORT=5000
    DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
    DB_SSL=true
    JWT_SECRET=supersecretjwtkeyforcampuspass2026
    RAZORPAY_KEY_ID=rzp_test_placeholder_key
    RAZORPAY_KEY_SECRET=placeholder_secret_key
    ```
    *(Note: If `RAZORPAY_KEY_ID` matches `rzp_test_placeholder_key`, the application automatically enters **Payment Simulation Mode**, allowing checkouts without real accounts).*
4.  Install backend packages:
    ```bash
    npm install
    ```
5.  Seed the database with pre-populated events, history logs, and test accounts:
    ```bash
    npm run seed
    ```
6.  Start the backend API server:
    ```bash
    npm run dev
    ```
    *The server starts listening on `http://localhost:5000`.*

### 3. Frontend App Setup
1.  In a new terminal window, navigate into the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install frontend packages:
    ```bash
    npm install
    ```
3.  Launch the Vite React development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.

---

## 🔑 Test Credentials (Pre-seeded Accounts)

Use the following logins to test different roles immediately after running `npm run seed`:

| Role | Email | Password | Features to Test |
| :--- | :--- | :--- | :--- |
| **Student** | `rahul@campuspass.com` | `student123` | Browse fests, buy paid passes in Test Mode, view QR ticket, download certificate, check rank |
| **Admin** | `admin@campuspass.com` | `admin123` | Create/Edit events, view rosters, export CSV, scan QR codes, view heatmaps & forecasting charts |

---

## 💳 Razorpay payment simulation & Manual QR scanning fallback
1.  **Razorpay Simulation**: During student registration for a paid event, if sandbox key is default, clicking "Simulate Success Payment" bypasses bank gates. It verifies signatures locally and prints the digital pass immediately.
2.  **Webcam Scanning Fallback**: In `/scanner`, if camera permissions are missing (e.g. localhost HTTP safety sandbox restrictions), admins can copy-paste the student's Ticket Number (e.g. `CP-HACK-SHARMA-001` from the dashboard/ticket view) and click **Verify** to simulate camera scans.
