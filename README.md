# GymSync – MERN Stack App

GymSync is a fitness management application built with the MERN stack (React Native + Node.js/Express + MongoDB).
It helps gyms manage attendance, progress reports, and dashboards in one place.

## Tech Stack

- Frontend: React Native
- Backend: Node.js + Express.js
- Database: MongoDB (Mongoose ODM)
- Other Tools: dotenv, nodemon, MongoDB Compass

## Project Structure
```
GYMSYNC/
├── frontend/                                       # directory to contain UI components and frameworks
│   ├── .vscode/
│   │ 
│   ├── app/                                        # main application entry point and route handling.
│   │ 
│   ├── assets/                                     # directory to keep in-use images, fonts and other assets
│   │  
│   ├── components/                                 # directory for reusable components 
│   │ 
│   ├── constants/                                  # centralized configuration values, API endpoints, and static constants.
│   │ 
│   ├── hooks/                                      # custom React hooks for shared logic across components.
│   │ 
│   ├── scripts/                                    # utility scripts for automation, setup, or build tasks.
│   │ 
│   ├── eslint.config.js
│   ├── tsconfig.json
│   ├── package-lock.json                   
│   └── package.json
│
├── config/
│   ├── file_structure.txt                          # detailed description of file structure of the project
│   ├── .env                                        # environmental variables
│   └── .env.example                                # .env example
│ 
├── backend/
│   ├── models/
│   │   └── users.js                                # model for user collection
│   │
│   ├── node_modules/
│   │
│   ├── routes/
│   │   └── userRoutes.js                           # routes to access the user collection
│   │ 
│   ├── test/
│   │   ├── userTest.js                             # test script to check the creation of user and other related cases
│   │   └── attendanceTest.js                       # test script to check the working of attendace updation
│   │
│   ├── info.txt                                    # init file
│   ├── index.js                                    # server file
│   ├── package-lock.json                   
│   └── package.json
│ 
├── ui_structure/
│   ├── adminUI/
│   │ 
│   ├── clientUI/
│   │ 
│   └── clientUI/
│ 
├── .gitignore                                      # files to be ignored when making a commit
├── README.md                                       # project documentation
└── gym_sync_full_app_architecture_mern_stack.md    # entire architecture of the project
```

## Setup & Installation
### Clone the repository
git clone https://github.com/yourusername/GymSync.git
cd GymSync

### Install dependencies
Backend
```
cd backend
npm install
```

Frontend
```
cd ../frontend
npm install
```

### Environment Variables

Create a .env file inside config/ folder:

```
MONGO_URI=mongodb://127.0.0.1:27017/gymsync
PORT=5000
```

### Running the Project
Start Backend (Express Server)
```
cd backend
npm run dev
```
Server runs on: http://localhost:5000

Start Frontend (React Native)
```
cd frontend
npm start
```

## Features

- Member Attendance Tracking
- Progress Report Management
- Admin Dashboard
- MongoDB Atlas/Compass support

## Scripts

In backend/package.json:

```
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

## License

This project is licensed under the MIT License.
