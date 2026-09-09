from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware # Add this
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import engine, SessionLocal

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Focus Flow API")

# Add CORS configuration here
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Focus Flow Backend is running!"}

# to create a new task
@app.post("/tasks/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    # Create the database model instance
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# to view all tasks
@app.get("/tasks/", response_model=List[schemas.TaskResponse])
def read_tasks(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).all()
    return tasks