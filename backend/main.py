from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

import models, schemas
from database import engine, SessionLocal

# Unified session table
class PomodoroSession(models.Base):
    __tablename__ = "pomodoro_sessions"
    id = Column(Integer, primary_key=True, index=True)
    duration = Column(String)
    distraction = Column(String, default="")
    rating = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)

class SessionCreate(BaseModel):
    duration: str
    distraction: Optional[str] = ""
    rating: int

class SessionResponse(SessionCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Focus Flow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Focus Flow Backend is running!"}

# Task Routes
@app.post("/tasks/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks/", response_model=List[schemas.TaskResponse])
def read_tasks(db: Session = Depends(get_db)):
    return db.query(models.Task).all()

# Session Routes sorted newest first by date
@app.post("/sessions/", response_model=SessionResponse)
def create_session(session: SessionCreate, db: Session = Depends(get_db)):
    db_session = PomodoroSession(
        duration=session.duration,
        distraction=session.distraction,
        rating=session.rating,
        created_at=datetime.utcnow()
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@app.get("/sessions/", response_model=List[SessionResponse])
def read_sessions(db: Session = Depends(get_db)):
    return db.query(PomodoroSession).order_by(PomodoroSession.created_at.desc()).all()

@app.patch("/tasks/{task_id}/toggle", response_model=schemas.TaskResponse)
def toggle_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.completed = not task.completed
    db.commit()
    db.refresh(task)
    return task