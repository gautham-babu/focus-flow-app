from fastapi import FastAPI
import models
from database import engine

# to create database tables automatically
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Focus Flow API")

@app.get("/")
def read_root():
    return {"message": "Focus Flow Backend is running!"}