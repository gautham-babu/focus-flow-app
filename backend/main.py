from fastapi import FastAPI

app = FastAPI(title="Focus Flow API")

@app.get("/")
def read_root():
    return {"message": "Focus Flow Backend is running."}