from pydantic import BaseModel
from datetime import date
from typing import Optional

# Base properties for a task
class TaskBase(BaseModel):
    title: str
    estimated_pomodoros: int = 1
    priority: str = "Medium"
    category: str = "work"
    start_date: Optional[date] = None

# For creating a task - uses base properties
class TaskCreate(TaskBase):
    pass

# For returning a task - adds ID from database
class TaskResponse(TaskBase):
    id: int

    class Config:
        from_attributes = True