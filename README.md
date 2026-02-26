# 🏥 MyDoctor - Medical Platform

<div align="center">

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?style=flat&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=flat&logo=tailwind-css)
![Node](https://img.shields.io/badge/Node.js-18.0+-green?style=flat&logo=node.js)

**A Medical Platform Connecting Doctors with Patients**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Project Structure](#-project-structure) • [API Endpoints](#-api-endpoints)

</div>

---

## 📋 Overview

**MyDoctor** is a modern web application that enables patients to search for and consult doctors online. The platform facilitates connections between doctors and patients through an intuitive Arabic interface with full responsive design support.

---

## ✨ Features

### 👤 For Users (Patients)
- **Search for Doctors** - Fast search by name or specialization
- **Doctor Profiles** - View complete doctor information
- **Location Detection** - Find doctors near you
- **Personal Account** - Manage your information and favorites

### 👨‍⚕️ For Doctors
- **Professional Profile** - Create your doctor profile
- **Interactive Map Location** - Set your address easily using the interactive map
- **Working Hours** - Specify your availability times
- **Update Data** - Modify your information at any time

### 🔐 Security & Authentication
- Secure account registration (users and doctors)
- JWT-based authentication
- Protected routes
- Account deletion

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Usage |
|------------|---------|-------|
| ![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat) | 19.1.0 | UI Library |
| ![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?style=flat) | 5.4.21 | Build tool & dev server |
| ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=flat) | 4.0 | Styling |
| ![React Router](https://img.shields.io/badge/React_Router-6.28.0-CA4AEB?style=flat) | 6.28.0 | Navigation |
| ![Formik](https://img.shields.io/badge/Formik-2.4.5-#EA2B5D) | 2.4.5 | Form management |
| ![Yup](https://img.shields.io/badge/Yup-1.3.3-#C8364C) | 1.3.3 | Data validation |
| ![Axios](https://img.shields.io/badge/Axios-1.6.5-#5A2984) | 1.6.5 | HTTP requests |
| ![Leaflet](https://img.shields.io/badge/Leaflet-1.7.1-1-800000?style=flat&logo=leaflet) | 1.7.1 | Interactive maps |
| ![Lucide React](https://img.shields.io/badge/Lucide-latest-000000?style=flat) | latest | Icons |

### Backend
| Technology | Version | Usage |
|------------|---------|-------|
| ![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat&logo=node.js) | 18+ | Runtime environment |
| ![Express](https://img.shields.io/badge/Express-4.19.2-000000?style=flat&logo=express) | 4.19.2 | API framework |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat&logo=postgresql) | 15+ | Database |
| ![Sequelize](https://img.shields.io/badge/Sequelize-6.37.0-336791?style=flat&logo=sequelize) | 6.37.0 | ORM |
| ![JWT](https://img.shields.io/badge/JWT-ieee128?style=flat) | - | Authentication |
| ![Bcrypt](https://img.shields.io/badge/Bcrypt-js-2.4.3-000000?style=flat) | 2.4.3 | Password encryption |

---

## 📁 Project Structure

```
my-doctor/
├── 📱 mobile/              # React Native (old mobile version)
├── 🌐 web/                # React.js (main web application)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Alert.jsx      # Alert modals
│   │   │   ├── Button.jsx     # Custom buttons
│   │   │   ├── DoctorCard.jsx # Doctor card
│   │   │   ├── Header.jsx     # Navigation bar
│   │   │   ├── Input.jsx      # Input fields
│   │   │   ├── Loader.jsx     # Loading spinner
│   │   │   ├── LocationPicker.jsx # Map location picker
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── contexts/        # Context API
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── lib/             # Helper files
│   │   │   ├── axios.js       # HTTP configuration
│   │   │   ├── helpers.js     # Helper functions
│   │   │   └── urls.js        # API URLs
│   │   └── pages/           # Application pages
│   │       ├── Home.jsx       # Home page
│   │       ├── SignIn.jsx     # Sign in page
│   │       ├── SignUp.jsx     # Sign up page
│   │       ├── Doctors.jsx    # Doctor list
│   │       ├── DoctorDetails.jsx # Doctor details
│   │       ├── Profile.jsx    # User profile
│   │       └── UpdateProfile.jsx # Edit profile
│   ├── public/              # Static files
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── 🖥️ server/             # Backend Node.js/Express
    ├── controllers/         # Business logic
    ├── models/             # Data models
    ├── routes/              # API routes
    ├── middlewares/        # Middleware
    └── app.js               # Entry point
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+
- **npm** or **pnpm**
- **PostgreSQL** 12+

### 1. Clone the Project

```bash
git clone https://github.com/your-username/my-doctor.git
cd my-doctor
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install frontend dependencies
cd ../web
npm install
```

### 3. Setup Database

Create a PostgreSQL database and configure environment variables:

```bash
# server/.env
PORT=4000
DB_NAME=my_doctor_db
DB_USER=postgres
DB_PASS=your_secure_password
JWT_SECRET=a_long_secure_key_for_production
```

### 4. Run the Servers

```bash
# Terminal 1 - Backend server
cd server
node app.js

# Terminal 2 - Frontend
cd web
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **API Server**: http://localhost:4000

---

## 🎯 Available Scripts

### Server (`server/`)

```bash
node app.js      # Run the server
npm start       # Run in production mode
```

### Frontend (`web/`)

```bash
npm run client   # Run development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint      # Lint code with ESLint
```

---

## 🎨 Customization

### Theme Colors

The app uses the following primary colors (editable in `tailwind.config.js`):

```javascript
// Button gradients
from: #3b82f6 (blue)
to: #1e40af (dark blue)

// Background
from: bg-blue-50 (very light blue)
to: bg-indigo-50 (purple)
```

### Typography

The project uses the **Cairo** font for optimal Arabic language support.

---

## 📄 API Endpoints

### Authentication

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/account/signup` | Create new account |
| POST | `/account/login` | Sign in |
| GET | `/account/profile` | Get profile |
| PUT | `/account/update-profile` | Update profile |
| DELETE | `/account/delete-profile` | Delete account |

### Doctors

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/doctors?q=search` | Search doctors |

---

## 🎓 Usage Examples

### Searching for a Doctor
```javascript
// Frontend search
// Searches in: name, specialization, email
// Case-insensitive search
```

### Creating a Doctor Account
```javascript
// Registration data
{
  "name": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "password": "password123",
  "userType": true,  // true = doctor, false = regular user
  "specialization": "Cardiology",
  "address": "Tunis, Avenue Habib Bourguiba",
  "workingHours": "9 AM - 5 PM",
  "phone": "21612345678",
  "location": {
    "latitude": 36.8065,
    "longitude": 10.1815
  }
}
```

---

## 🔒 Security

- All passwords encrypted using bcrypt
- JWT tokens for authentication
- CSRF protection
- SQL Injection protection (Sequelize ORM)

---

## 📞 Support

For any questions or support, please open an issue on GitHub.

---

<div align="center">

**Built with React & Node.js**

![Star](https://img.shields.io/badge/Star-if%20you%20use%20this%20repository-steel-blue?style=flat)
![Fork](https://img.shields.io/badge/Fork-if%20you%20like%20this%20repository-lightgrey?style=flat)

⭐ If you like this project, give it a star!

</div>
