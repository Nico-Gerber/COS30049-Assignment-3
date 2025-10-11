from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from model.model import predict_text

router = APIRouter(prefix="/predict", tags=["Prediction"])


class InputText(BaseModel):
    text: str


@router.post("/")
def predict(data: InputText):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty")

    try:
        label, confidence = predict_text(data.text)
    except FileNotFoundError as e:
        # Model artifacts missing; return 500 with helpful message
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return {"prediction": label, "confidence": confidence}