# GymSync - Fitness Management System

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6+-green)](https://www.mongodb.com/)
[![React Native](https://img.shields.io/badge/React_Native-v0.72+-blue)](https://reactnative.dev/)

A comprehensive MERN-based fitness management application that enables gym administrators to track member attendance, manage workout schedules, monitor progress, and streamline gym operations with support for both local and cloud databases.

## Features

### User Management
- **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- **User Registration & Login** - Complete user account management
- **Profile Management** - Update membership types, personal info
- **Password Management** - Change password, account deletion
- **Session Management** - Logout, logout from all devices

### Attendance System
- **Daily Attendance Tracking** - Mark attendance for current day
- **Historical Records** - View attendance by date range or day name
- **Duplicate Prevention** - Prevents multiple check-ins per day
- **Attendance Count** - Auto-increment attendance counter

### Workout Management
- **200+ Exercises Database** - Comprehensive exercise library
- **Weekly Schedule** - Pre-configured 6-day workout plan
  - Monday: Legs Day
  - Tuesday: Upper Body + Abs
  - Wednesday: Inner & Outer Thighs + Back
  - Thursday: Core + Cardio
  - Friday: Legs Day
  - Saturday: Upper Body + Abs
  - Sunday: Rest Day
- **Custom Workout Plans** - Generate personalized workouts based on:
  - Workout type (Strength, Cardio, Flexibility, Balance)
  - Difficulty level (Beginner, Intermediate, Advanced)
  - Target muscle groups
  - Available equipment
  - Desired duration
- **Exercise Filtering** - Search by type, muscle, equipment, difficulty
- **Calorie Estimation** - Automatic calorie burn calculation
- **Duration Tracking** - Estimated workout duration

### Admin Features
- **Member Management** - View all registered users
- **Dashboard** - Overview of gym statistics
- **Reports** - Attendance and progress tracking

## Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **React Hooks** - State management
- **Expo** - Development framework
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Database
- **MongoDB** - NoSQL database
- **MongoDB Atlas** - Cloud database (optional)
- **MongoDB Compass** - Database GUI

### Development Tools
- **nodemon** - Auto-restart server
- **dotenv** - Environment variables
- **ESLint** - Code linting
- **Postman** - API testing

## Architecture

### System Architecture

```
                                              ┌─────────────────────┐
                                              │   CLIENT LAYER      │
                                              │  • React Native     │
                                              │  • HTTP REST API    │
                                              └──────────┬──────────┘
                                                         │
                                                         ▼
                                              ┌─────────────────────┐
                                              │   API GATEWAY       │
                                              │  • Express Server   │
                                              │  • Middleware       │
                                              │  • CORS & Auth      │
                                              └──────────┬──────────┘
                                                         │
                                                         ▼
                                              ┌─────────────────────┐
                                              │ APPLICATION LAYER   │
                                              │  • User Routes      │
                                              │  • Exercise Routes  │
                                              │  • JWT Auth         │
                                              │  • bcrypt Hashing   │
                                              └──────────┬──────────┘
                                                         │
                                                         ▼
                                              ┌─────────────────────┐
                                              │   DATA LAYER        │
                                              │  • Mongoose Models  │
                                              │  • User Model       │
                                              │  • Exercise Model   │
                                              └──────────┬──────────┘
                                                         │
                                                         ▼
                                              ┌─────────────────────┐
                                              │   DATABASE          │
                                              │  • User Collection  │
                                              │  • Exercise Coll.   │
                                              │  • Embedded Attend. │
                                              └─────────────────────┘
```

## Project Structure

```
GYMSYNC/
├── frontend/                     # React Native mobile app
│   ├── app/                      # Main application routes
│   ├── assets/                   # Images, fonts, icons
│   ├── components/               # Reusable UI components
│   ├── constants/                # API endpoints, config
│   ├── hooks/                    # Custom React hooks
│   ├── scripts/                  # Utility scripts
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      # Node.js/Express server
│   ├── models/                   # Mongoose schemas
│   │   ├── user.js               # User model
│   │   └── excercise.js          # Exercise model
│   ├── routes/                   # API routes
│   │   ├── userRoutes.js         # User endpoints
│   │   └── excerciseRoutes.js    # Exercise endpoints
│   ├── test/                     # Test scripts
│   │   ├── userTest.js
│   │   └── attendanceTest.js
│   ├── index.js                  # Server entry point
│   └── package.json
│
├── config/                       # Configuration files
│   ├── .env                      # Environment variables
│   ├── .env.example              # Env template
│   └── file_structure.txt        # Detailed structure
│
├── ui_structure/                 # UI/UX designs
│   ├── adminUI/
│   ├── clientUI/
│   └── trainerUI/
│
├── .gitignore
├── README.md
└── gym_sync_full_app_architecture_mern_stack.md
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- Git

### Clone Repository

```bash
git clone https://github.com/RiyaTorgal/GymSync.git
cd GymSync
```

### Backend Setup

```bash
cd backend
npm install
```

### Frontend Setup

```bash
cd ../frontend
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the `config/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://127.0.0.1:27017/gym_sync

# JWT Configuration
JWT_SECRET=gym-sync-secret-key-2024
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:19006
```

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Start MongoDB service
mongod --dbpath /path/to/data/directory
```

**Option 2: MongoDB Atlas**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

## Usage

### Start Backend Server

```bash
cd backend
npm run dev
```

Server runs on: `http://localhost:5000`

### Start Frontend App

```bash
cd frontend
npm start
```

Expo DevTools opens at: `http://localhost:19006`

### Access Points

- **API Base URL**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/health`
- **API Docs**: `http://localhost:5000/`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "membershipType": "Monthly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": { /* user object */ },
  "token": "jwt_token_here"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile (Protected)
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/users/logout
Authorization: Bearer <token>
```

### Attendance Endpoints

#### Mark Today's Attendance
```http
POST /api/users/attendance/today
Authorization: Bearer <token>
```

#### Mark Attendance for Specific Date
```http
POST /api/users/attendance
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-10-13"
}
```

#### Get Attendance Records
```http
GET /api/users/attendance?startDate=2024-10-01&endDate=2024-10-31
Authorization: Bearer <token>
```

### Exercise Endpoints

#### Get All Exercises
```http
GET /api/exercises/all
```

#### Get Weekly Schedule
```http
GET /api/exercises/weekly-schedule
```

**Response:**
```json
{
  "success": true,
  "schedule": {
    "Monday": {
      "name": "Legs Day",
      "type": "Strength",
      "exercises": [ /* exercise list */ ],
      "totalCalories": 350,
      "estimatedDuration": "45 min",
      "exerciseCount": 8
    },
    // ... other days
  }
}
```

#### Get Exercises by Type
```http
GET /api/exercises/type/Strength
```

#### Get Exercises by Muscle
```http
GET /api/exercises/muscle/Chest
```

#### Get Exercises by Difficulty
```http
GET /api/exercises/difficulty/Beginner
```

#### Create Custom Workout Plan
```http
POST /api/exercises/workout-plan
Content-Type: application/json

{
  "workoutType": "Strength",
  "difficulty": "Intermediate",
  "duration": 30,
  "targetMuscles": ["Chest", "Triceps"],
  "equipment": ["Dumbbell", "Barbell"],
  "exerciseCount": 6
}
```

### Profile Management Endpoints

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "membershipType": "Annual"
}
```

#### Change Password
```http
PUT /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

#### Delete Account
```http
DELETE /api/users/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "password123"
}
```

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  membershipType: Enum["Monthly", "Quarterly", "Annual"],
  joinDate: Date,
  attendanceCount: Number,
  attendance: [
    {
      date: Date,
      dayName: String,
      classType: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Exercise Collection

```javascript
{
  _id: ObjectId,
  ID: Number (unique),
  Name: String,
  Type: Enum["Strength", "Cardio", "Plyometric", "HIIT", ...],
  Section: Enum["Upper Body", "Lower Body", "Core", ...],
  Muscle: String,
  Equipment: String,
  Difficulty: Enum["Beginner", "Intermediate", "Advanced"],
  Instructions: String,
  Sets: Number,
  Reps: String,
  RestTime: String,
  CaloriesPerSet: Number,
  TargetMuscleGroups: [String],
  IsActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

### Run Backend Tests

```bash
cd backend
node test/userTest.js
node test/attendanceTest.js
```

### Test Coverage
- User registration and login
- Attendance marking and retrieval
- Exercise queries
- JWT authentication
- Password hashing

### Manual Testing with Postman

Import the API collection and test all endpoints with proper authentication headers.

## Diagrams

### User Flow Diagram
Shows the complete user journey through the application:

![User Flow Diagram](https://github.com/RiyaTorgal/GymSync/blob/main/img/diagrams/user%20flow%20diag.png)

### Sequence Diagram

Shows the flow of authentication, attendance marking, and schedule retrieval:

![Sequence Diagram](https://github.com/RiyaTorgal/GymSync/blob/main/img/diagrams/activity%20diag.png)

### Entity Relationship Diagram

Shows database structure and relationships:

![ERD](https://github.com/RiyaTorgal/GymSync/blob/main/img/diagrams/entity%20relationship%20diag.png)

### Cloud Architecture Diagram

Shows system components and data flow:

![Architecture](https://github.com/RiyaTorgal/GymSync/blob/main/img/diagrams/architechture%20diag.png)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React Native Documentation](https://reactnative.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)

## Project Status

**Current Version:** 1.0.0

**Status:** Active Development

**Last Updated:** October 2024

---

**Made with ❤️ for fitness enthusiasts**
