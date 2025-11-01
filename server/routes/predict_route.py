from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
import re
import logging

import model.model as model

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
        
        if re.match(r'^[^a-zA-Z]*$', v.strip()):
            raise ValueError('Text must contain at least some alphabetic characters')
        
        return v.strip()


def get_word_contributions(text: str) -> dict:
    try:
        # ensure model artifacts are loaded (no-op if already loaded)
        model._ensure_loaded()
    except FileNotFoundError:
        logger.warning("Model artifacts not found when computing word contributions")
        return {}

    if model._clf is None or model._vectorizer is None:
        logger.warning("_clf or _vectorizer is None (model not loaded)")
        return {}

    try:
        processed_text = model.preprocess_text(text)
        logger.debug(f"Processed text: {processed_text!r}")

        X = model._vectorizer.transform([processed_text])
        input_vector = X.toarray()[0]
        nonzero_count = int((input_vector > 0).sum())
        logger.debug(f"Input vector sum: {float(input_vector.sum())}, nonzero features: {nonzero_count}")

        # get feature names if available (not available for HashingVectorizer)
        feature_names = None
        if hasattr(model._vectorizer, "get_feature_names_out"):
            feature_names = model._vectorizer.get_feature_names_out()
            logger.debug(f"Feature names length: {len(feature_names)}")
        else:
            logger.warning("Vectorizer has no get_feature_names_out (e.g. HashingVectorizer). Can't map indices to tokens.")

        # classifier coefficients
        coef = None
        if hasattr(model._clf, "coef_"):
            coef = model._clf.coef_[0]
        else:
            logger.warning("Classifier has no coef_ attribute; contributions will be zeroed.")

        contributions = {}
        if nonzero_count == 0:
            logger.info("No known vocabulary tokens found in input -> empty contributions")
            return {}

        for idx, value in enumerate(input_vector):
            if value > 0:
                word = feature_names[idx] if feature_names is not None and idx < len(feature_names) else f"idx_{idx}"
                contrib = float((coef[idx] if coef is not None else 0.0) * value)
                contributions[word] = contrib

        # optional: sort by absolute contribution
        contributions = dict(sorted(contributions.items(), key=lambda kv: -abs(kv[1])))

        return contributions

    except Exception as e:
        logger.exception("Error computing word contributions")
        return {}



@router.post("/")
def predict(data: InputText):
    try:
        logger.info(f"Processing prediction request for text length: {len(data.text)}")
        
        if len(data.text) > 280:
            logger.warning(f"Text exceeds typical tweet length: {len(data.text)} characters")
        
        processed_text = data.text.strip()
        
        # Call your existing prediction function
        label, confidence = model.predict_text(processed_text)
        
        if confidence < 0 or confidence > 1:
            logger.error(f"Invalid confidence score from model: {confidence}")
            raise ValueError("Model returned invalid confidence score")
        
        # Calculate word contributions
        word_contributions = get_word_contributions(processed_text)
        
        # Save to history
        analysis_record = {
            "id": len(analysis_history) + 1,
            "text": data.text,
            "prediction": label,
            "confidence": float(confidence),
            "timestamp": datetime.now(),
            "user_feedback": None,
            "word_contributions": word_contributions
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
        "word_contributions": word_contributions,
        "message": "Prediction completed successfully"
    }
