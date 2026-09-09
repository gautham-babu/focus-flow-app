from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    estimated_time = Column(String)
    priority = Column(String)
    category = Column(String)
    start_date = Column(String)
    completed = Column(Boolean, default=False)

class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"
    id = Column(Integer, primary_key=True, index=True)
    duration = Column(String)
    distraction = Column(String, default="")
    rating = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)