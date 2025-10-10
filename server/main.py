from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import predict_route, stats_route, health_route

app = FastAPI(
    title="Misinformation Detection API",
    description="FastAPI backend for the Misinformation Detection Web App",
    version="1.0"
)

# Enable CORS (allow React frontend to communicate)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for stricter setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(predict_route.router)
app.include_router(stats_route.router)
app.include_router(health_route.router)

@app.get("/")
def root():
    return {"message": "FastAPI server is running!"}
