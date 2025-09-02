# Gym Sync – Full App Architecture (React Native + Node.js/Express + MongoDB)

## 📱 App Overview
**Gym Sync** is a mobile-first app for gyms, built with **React Native** (frontend), **Node.js/Express** (backend API), and **MongoDB** (database). It supports 3 roles:
- **Admin** (gym owner/manager)
- **Trainer**
- **Member**

All roles use the same mobile app, but features vary by role. Authentication is handled via **JWT (JSON Web Tokens)**, and API is secured with role-based middleware.

---

## 🔑 Authentication & Authorization
- **Auth Flow**: Email + password → JWT issued → Stored securely in AsyncStorage.
- **Role-based Guards**:
  - `Admin`: Full access
  - `Trainer`: Limited to classes, assigned members
  - `Member`: Own attendance, progress, classes
- **Middleware**: Express middleware checks role from JWT before allowing API access.

---

## 🖥️ Screens (React Native)

### Common Screens (All Roles)
- **Login / Signup / Forgot Password**
- **Dashboard** (role-specific content)
- **Profile & Settings**

### Admin Screens
- Dashboard → KPIs: Total Members, Active Trainers, Class Bookings
- Manage Trainers (add, update, remove)
- Manage Members
- Attendance Reports (filter by date, member, trainer)
- Progress Reports
- Class Scheduling (create, edit, assign trainers)

### Trainer Screens
- Dashboard → Assigned Members, Today’s Classes
- Manage Attendance (mark members present/absent)
- Member Progress Tracking (log workouts, update stats)
- Class Management (view, edit assigned classes)

### Member Screens
- Dashboard → Upcoming Classes, Attendance Record
- Class Booking → Browse & Join Classes
- Attendance History → Calendar-style view
- Progress Report → Weight, BMI, workout logs, graphs

---

## 📊 Backend (Node.js/Express)
### API Endpoints (REST)

**Auth Routes**
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

**Admin Routes**
- `POST /trainers`
- `GET /trainers`
- `POST /members`
- `GET /members`
- `GET /reports/attendance`
- `GET /reports/progress`
- `POST /classes`
- `PUT /classes/:id`

**Trainer Routes**
- `GET /classes/assigned`
- `POST /attendance/mark`
- `PUT /progress/:memberId`

**Member Routes**
- `GET /classes`
- `POST /classes/join`
- `GET /attendance`
- `GET /progress`

---

## 🗄️ Database Schema (MongoDB)

### Users Collection
```json
{
  "_id": ObjectId,
  "name": String,
  "email": String,
  "passwordHash": String,
  "role": "admin" | "trainer" | "member",
  "assignedTrainer": ObjectId (if member),
  "createdAt": Date
}
```

### Classes Collection
```json
{
  "_id": ObjectId,
  "name": String,
  "schedule": Date,
  "trainerId": ObjectId,
  "members": [ObjectId],
  "capacity": Number
}
```

### Attendance Collection
```json
{
  "_id": ObjectId,
  "memberId": ObjectId,
  "classId": ObjectId,
  "status": "present" | "absent",
  "date": Date
}
```

### Progress Collection
```json
{
  "_id": ObjectId,
  "memberId": ObjectId,
  "date": Date,
  "weight": Number,
  "bmi": Number,
  "workoutLog": String
}
```

---

## 📊 Charts & Reports

- **Attendance Reports** (Admin/Trainer)
  - Daily, Weekly, Monthly attendance (line/bar charts)
  - Member attendance heatmap

- **Progress Reports** (Admin/Trainer/Member)
  - Weight/BMI trendline
  - Workout frequency graph

---

## 🏗️ Folder Structure

### React Native (Frontend)
```
/gym-sync-app
  /src
    /components
    /screens
      /admin
      /trainer
      /member
    /navigation
    /context (Auth + Role providers)
    /services (API calls)
```

### Node.js (Backend)
```
/gym-sync-api
  /src
    /controllers
    /routes
    /models
    /middlewares (auth, role guards)
    /utils (jwt, bcrypt, error handlers)
```

---

## 📅 MVP Development Timeline

### Week 1-2
- Setup project (React Native + Express + MongoDB Atlas)
- Auth system with JWT

### Week 3-4
- Admin: Trainer/Member Management
- Trainer: Attendance & Progress APIs
- Member: Class Booking + Attendance History

### Week 5
- Reporting (charts with Victory Native / Recharts)
- Polished UI & role-based dashboards

### Week 6
- Testing & Deployment (Heroku/Render for API, MongoDB Atlas, Expo for app)

---

✅ With this, you’ll have a **MERN-stack Gym Sync app** with full role-based dashboards, attendance tracking, progress reports, and scheduling.

