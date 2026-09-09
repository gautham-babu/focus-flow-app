from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskBase(BaseModel):
    title: str
    estimated_time: str
    priority: str = "Medium"
    category: str = "work"
    start_date: str
    completed: Optional[bool] = False

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int

    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    duration: str
    distraction: Optional[str] = ""
    rating: int

class SessionResponse(SessionCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True