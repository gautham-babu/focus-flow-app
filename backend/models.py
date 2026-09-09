from sqlalchemy import Column, Integer, String, Date
from database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    estimated_pomodoros = Column(Integer, default=1)
    priority = Column(String, default="Medium") # High, Medium, Low
    category = Column(String, default="work") # work, study, personal
    start_date = Column(Date)