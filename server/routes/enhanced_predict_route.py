from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import os

from model.model import predict_text

router = APIRouter(prefix="/predict", tags=["Prediction"])

# In-memory storage for demo (in production, use a database)
analysis_history = []

class InputText(BaseModel):
    text: str

class AnalysisHistory(BaseModel):
    id: int
    text: str
    prediction: str
    confidence: float
    timestamp: datetime
    user_feedback: Optional[str] = None

@router.post("/")
def predict(data: InputText):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty")

    try:
        label, confidence = predict_text(data.text)
        
        # Save to history
        analysis_record = {
            "id": len(analysis_history) + 1,
            "text": data.text,
            "prediction": label,
            "confidence": confidence,
            "timestamp": datetime.now(),
            "user_feedback": None
        }
        analysis_history.append(analysis_record)
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return {"prediction": label, "confidence": confidence, "id": analysis_record["id"]}

# GET - Retrieve analysis history
@router.get("/history")
def get_analysis_history(limit: int = 10, offset: int = 0):
    """Get paginated analysis history"""
    total = len(analysis_history)
    items = analysis_history[offset:offset + limit]
    
    return {
        "total": total,
        "items": items,
        "limit": limit,
        "offset": offset
    }

# GET - Get specific analysis by ID
@router.get("/history/{analysis_id}")
def get_analysis_by_id(analysis_id: int):
    """Get a specific analysis by ID"""
    analysis = next((item for item in analysis_history if item["id"] == analysis_id), None)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

# GET - Get statistics
@router.get("/stats")
def get_statistics():
    """Get overall statistics about predictions"""
    if not analysis_history:
        return {"total_analyses": 0, "fake_count": 0, "real_count": 0, "avg_confidence": 0}
    
    fake_count = sum(1 for item in analysis_history if "fake" in item["prediction"].lower())
    real_count = len(analysis_history) - fake_count
    avg_confidence = sum(item["confidence"] for item in analysis_history) / len(analysis_history)
    
    return {
        "total_analyses": len(analysis_history),
        "fake_count": fake_count,
        "real_count": real_count,
        "avg_confidence": round(avg_confidence, 3)
    }

# PUT - Update user feedback for an analysis
@router.put("/history/{analysis_id}/feedback")
def update_feedback(analysis_id: int, feedback: dict):
    """Update user feedback for a specific analysis"""
    analysis = next((item for item in analysis_history if item["id"] == analysis_id), None)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    analysis["user_feedback"] = feedback.get("feedback", "")
    return {"message": "Feedback updated successfully", "analysis": analysis}

# DELETE - Remove an analysis from history
@router.delete("/history/{analysis_id}")
def delete_analysis(analysis_id: int):
    """Delete a specific analysis from history"""
    global analysis_history
    analysis = next((item for item in analysis_history if item["id"] == analysis_id), None)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    analysis_history = [item for item in analysis_history if item["id"] != analysis_id]
    return {"message": "Analysis deleted successfully"}

# DELETE - Clear all history
@router.delete("/history")
def clear_all_history():
    """Clear all analysis history"""
    global analysis_history
    count = len(analysis_history)
    analysis_history.clear()
    return {"message": f"Cleared {count} analyses from history"}