from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import predict_route, history_routes

app = FastAPI(
    title="Misinformation Detection API",
    description="FastAPI backend for the Misinformation Detection Web App",
    version="1.0"
)

# Enable CORS (allow React frontend to communicate)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(predict_route.router)
app.include_router(history_routes.router)

@app.get("/")
def root():
    return {"message": "FastAPI server is running!"}