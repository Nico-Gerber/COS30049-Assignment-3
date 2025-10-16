import os
import pickle
import re
import string
from typing import Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(__file__)
VECT_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")
CLF_PATH = os.path.join(BASE_DIR, "logistic_regression.pkl")


def _load_pickle(path: str):
    with open(path, "rb") as f:
        return pickle.load(f)


# lazy-loaded objects
_vectorizer = None
_clf = None


def _ensure_loaded():
    global _vectorizer, _clf
    if _vectorizer is None:
        if not os.path.exists(VECT_PATH) or not os.path.exists(CLF_PATH):
            raise FileNotFoundError("Model artifacts not found. Expected vectorizer.pkl and logistic_regression.pkl in server/model/")
        _vectorizer = _load_pickle(VECT_PATH)
    if _clf is None:
        _clf = _load_pickle(CLF_PATH)


def preprocess_text(text: str) -> str:
    """
    Enhanced preprocessing for text before model prediction.
    
    Args:
        text: Raw input text
        
    Returns:
        Preprocessed text ready for model input
    """
    # Convert to lowercase
    text = text.lower()
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Handle URLs (replace with placeholder)
    text = re.sub(r'http[s]?://\S+', 'URL_PLACEHOLDER', text)
    text = re.sub(r'www\.\S+', 'URL_PLACEHOLDER', text)
    
    # Handle mentions and hashtags (keep the content but normalize)
    text = re.sub(r'@\w+', 'USER_MENTION', text)
    text = re.sub(r'#(\w+)', r'\1', text)  # Keep hashtag content
    
    # Handle excessive punctuation
    text = re.sub(r'[!]{2,}', '!', text)
    text = re.sub(r'[?]{2,}', '?', text)
    text = re.sub(r'[.]{2,}', '...', text)
    
    # Remove extra punctuation but keep sentence structure
    text = re.sub(r'[^\w\s!?.,]', ' ', text)
    
    # Handle repeated characters (e.g., "soooo" -> "so")
    text = re.sub(r'(.)\1{2,}', r'\1\1', text)
    
    # Clean up final spacing
    text = text.strip()
    
    return text

def postprocess_prediction(label: str, confidence: float) -> Tuple[str, float]:
    """
    Postprocess model output for better user experience.
    
    Args:
        label: Raw model prediction
        confidence: Raw confidence score
        
    Returns:
        Processed label and confidence
    """
    # Normalize label names for consistent display
    label_mapping = {
        'fake': 'Fake News',
        'real': 'Real News',
        'true': 'Real News',
        'false': 'Fake News',
        '0': 'Real News',
        '1': 'Fake News',
        0: 'Real News',
        1: 'Fake News'
    }
    
    # Convert label to string and normalize
    label_str = str(label).lower().strip()
    processed_label = label_mapping.get(label_str, str(label))
    
    # Ensure confidence is in valid range
    confidence = max(0.0, min(1.0, float(confidence)))
    
    # Round confidence to 3 decimal places for consistency
    confidence = round(confidence, 3)
    
    return processed_label, confidence

def predict_text(text: str) -> Tuple[str, float]:
    """
    Enhanced prediction function with preprocessing and postprocessing.
    
    Args:
        text: Input text to analyze
        
    Returns:
        Tuple of (prediction_label, confidence_score)
    """
    try:
        logger.info(f"Starting prediction for text of length: {len(text)}")
        
        # Ensure models are loaded
        _ensure_loaded()
        
        # Preprocess the input text
        processed_text = preprocess_text(text)
        logger.info(f"Text preprocessed. Original length: {len(text)}, Processed length: {len(processed_text)}")
        
        # Transform text using the vectorizer
        X = _vectorizer.transform([processed_text])
        
        # Get predicted label
        label = _clf.predict(X)[0]
        
        # Calculate confidence score
        confidence = 0.0
        if hasattr(_clf, "predict_proba"):
            probs = _clf.predict_proba(X)[0]
            confidence = float(max(probs))
            logger.info(f"Prediction probabilities: {probs}")
        else:
            # Fallback to decision function
            if hasattr(_clf, "decision_function"):
                score = _clf.decision_function(X)
                # Convert to 0-1 confidence using sigmoid
                import math
                
                def _sigmoid(x):
                    return 1 / (1 + math.exp(-x))
                
                confidence = float(_sigmoid(float(score)))
            else:
                logger.warning("Classifier has no predict_proba or decision_function method")
                confidence = 0.5  # Default neutral confidence
        
        # Postprocess the results
        processed_label, processed_confidence = postprocess_prediction(label, confidence)
        
        logger.info(f"Prediction completed: {processed_label} (confidence: {processed_confidence})")
        
        return processed_label, processed_confidence
        
    except Exception as e:
        logger.error(f"Error in predict_text: {e}")
        raise e
