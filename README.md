# Focus Flow

Focus Flow is a full-stack productivity application designed to help users manage their time, maintain focus using the Pomodoro technique, and track their daily tasks. The application features a clean, minimalist user interface with a custom-built circular timer and persistent state management.

---

## Key Features

* **Advanced Timer System**: Features both a standard 25-minute Pomodoro timer and a highly customizable standard timer with dynamic SVG progress visualization.
* **Persistent State**: The timer continues to run seamlessly in the background while navigating between different sections of the application.
* **Session Logging & Reflection**: Upon completing a focus session, users are prompted to log their focus rating (1–10) and note any distractions, providing actionable data for productivity tracking.
* **Session History**: A detailed log of past focus sessions, including duration, date, ratings, and distraction notes.
* **Task Management**: A dedicated task board to organize, track, filter, and complete daily objectives.
* **Analytics**: Data visualization components tracking daily goals, session counts, peak focus hours, weekly volume, and overall focus time.

---

## Technology Stack

### Frontend
* **Framework**: React 19
* **Build Tool**: Vite
* **Routing**: React Router DOM (`react-router-dom` v7)
* **State Management**: React Context API
* **Styling**: Pure CSS with responsive design principles and a custom minimalist color palette

### Backend
* **Framework**: Python / FastAPI
* **Database**: SQLite with SQLAlchemy ORM
* **Server**: Uvicorn
* **Communication**: RESTful API endpoints for session and task management

---

## Prerequisites

Before running the application, ensure you have the following installed on your system:
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended) and npm
* [Python](https://www.python.org/) (v3.8 or higher)

---

## Installation and Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd focus-flow-app
```

### 2. Backend Setup
Navigate to the `backend` directory and set up a Python virtual environment:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:
* **Windows (PowerShell / Command Prompt)**:
  ```powershell
  venv\Scripts\activate
  ```
* **macOS / Linux**:
  ```bash
  source venv/bin/activate
  ```

Install the required Python dependencies:
```bash
pip install -r requirements.txt
```

Start the FastAPI server:
```bash
uvicorn main:app --reload
```
The backend API will run at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
Open a new terminal window, navigate to the `frontend` directory, and install the required Node modules:

```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend application will run at `http://localhost:5173` (or the port specified in your Vite output).

---

## Project Structure

```text
├── backend/
│   ├── database.py           # SQLite database engine and session configuration
│   ├── main.py               # FastAPI application entry point and routes
│   ├── models.py             # SQLAlchemy database models
│   ├── requirements.txt      # Python dependencies
│   └── schemas.py            # Pydantic validation schemas
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components (Navbar, PomodoroTimer, Analytics, etc.)
    │   ├── pages/            # Application routes (DashboardPage, TimerPage, TasksPage, AnalyticsPage)
    │   ├── App.jsx           # Main application wrapper and router
    │   ├── App.css           # Global stylesheet and custom UI styling
    │   ├── index.css         # Base resets and typography
    │   └── main.jsx          # React DOM root mounting
    ├── package.json          # Node.js dependencies and scripts
    └── vite.config.js        # Vite build and plugin configuration
```

---

## API Endpoints

### Tasks
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/tasks/` | Retrieves all tasks |
| `POST` | `/tasks/` | Creates a new task |
| `PATCH` | `/tasks/{task_id}/toggle` | Toggles the completion status of a task |
| `DELETE` | `/tasks/{task_id}` | Deletes a task |

### Sessions
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/sessions/` | Retrieves logged focus sessions (ordered newest first) |
| `POST` | `/sessions/` | Logs a completed session (`duration`, `rating`, `distraction`) |

---

## Future Enhancements

* **Real-time Synchronization**: Implementation of WebSockets to synchronize active timer states across multiple tabs and devices.
* **Authentication**: User accounts to securely store personal task boards and long-term historical analytics.
* **Audio Notifications & Ambient Sounds**: Gentle chimes upon session completion and optional background white noise / lo-fi audio tracks.