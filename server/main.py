from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import predict_route, visual_route

app = FastAPI(
    title="Misinformation Detection API",
    description="FastAPI backend for the Misinformation Detection Web App",
    version="1.0"
)

# Enable CORS (allow React frontend to communicate)
app.add_middleware(
    CORSMiddleware,
    # Allow the common dev frontend origins (localhost and 127.0.0.1)
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(predict_route.router)
app.include_router(visual_route.router)

@app.get("/")
def root():
    return {"message": "FastAPI server is running!"}
