
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="LabMate AI",
    description="Engineering Lab Preparation Assistant",
    version="1.0.0"
)

# Allow our frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the data we expect from the frontend
class ExperimentRequest(BaseModel):
    experiment: str

@app.get("/")
def home():
    return {
        "message": "Welcome to LabMate AI!",
        "status": "Backend is running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/generate")
def generate_guide(request: ExperimentRequest):
    return {
        "experiment": request.experiment,
        "message": "Experiment received successfully!",
        "status": "success"
    }
