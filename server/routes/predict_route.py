from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/predict", tags=["Prediction"])

class InputText(BaseModel):
    text: str

@router.post("/")
def predict(data: InputText):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty")
    
    # Temporary mock output (you’ll connect your ML model later)
    return {
        "prediction": "Fake",
        "confidence": 0.87
    }
