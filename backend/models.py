from sqlalchemy import Column, Integer, String, Date, Boolean
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