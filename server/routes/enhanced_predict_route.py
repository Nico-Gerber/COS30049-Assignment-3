from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
import re
import logging

from model.model import predict_text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/predict", tags=["Prediction"])

# In-memory storage for demo (in production, use a database)
analysis_history = []

class InputText(BaseModel):
    text: str
    
    @validator('text')
    def validate_text(cls, v):
        if not v or not v.strip():
            raise ValueError('Text cannot be empty or only whitespace')
        
        if len(v.strip()) < 5:
            raise ValueError('Text must be at least 5 characters long')
        
        if len(v) > 10000:  # Reasonable limit
            raise ValueError('Text is too long (maximum 10,000 characters)')
        
        # Check for suspicious patterns
        if re.match(r'^[^a-zA-Z]*$', v.strip()):
            raise ValueError('Text must contain at least some alphabetic characters')
        
        return v.strip()

class AnalysisHistory(BaseModel):
    id: int
    text: str
    prediction: str
    confidence: float
    timestamp: datetime
    user_feedback: Optional[str] = None

@router.post("/")
def predict(data: InputText):
    """
    Predict if given text is misinformation or not.
    
    - **text**: Text content to analyze (5-10,000 characters)
    - Returns: prediction label, confidence score, and analysis ID
    """
    try:
        logger.info(f"Processing prediction request for text length: {len(data.text)}")
        
        # Additional server-side validation
        if len(data.text) > 280:
            logger.warning(f"Text exceeds typical tweet length: {len(data.text)} characters")
        
        # Preprocess text (basic cleaning)
        processed_text = data.text.strip()
        
        # Call AI model
        label, confidence = predict_text(processed_text)
        
        # Validate model output
        if confidence < 0 or confidence > 1:
            logger.error(f"Invalid confidence score from model: {confidence}")
            raise ValueError("Model returned invalid confidence score")
        
        # Save to history
        analysis_record = {
            "id": len(analysis_history) + 1,
            "text": data.text,
            "prediction": label,
            "confidence": float(confidence),  # Ensure it's JSON serializable
            "timestamp": datetime.now(),
            "user_feedback": None
        }
        analysis_history.append(analysis_record)
        
        logger.info(f"Prediction completed successfully. ID: {analysis_record['id']}, Prediction: {label}")
        
    except FileNotFoundError as e:
        logger.error(f"Model file not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI model is not available. Please try again later."
        )
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error in prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during prediction. Please try again."
        )

    return {
        "prediction": label,
        "confidence": confidence,
        "id": analysis_record["id"],
        "message": "Prediction completed successfully"
    }

# Note: History management endpoints have been moved to history_routes.py
# This keeps the prediction route focused on core functionality