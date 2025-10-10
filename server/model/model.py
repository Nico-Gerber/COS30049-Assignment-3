import os
import pickle
from typing import Tuple

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


def predict_text(text: str) -> Tuple[str, float]:
    """Predict label for a single text and return (label, confidence).

    The classifier is assumed to implement predict_proba.
    """
    _ensure_loaded()
    X = _vectorizer.transform([text])
    # Get predicted label
    label = _clf.predict(X)[0]
    # confidence: max probability if predict_proba exists
    confidence = None
    if hasattr(_clf, "predict_proba"):
        probs = _clf.predict_proba(X)[0]
        confidence = float(max(probs))
    else:
        # fallback to decision_function (not normalized)
        if hasattr(_clf, "decision_function"):
            score = _clf.decision_function(X)
            # convert to a 0-1 like confidence using sigmoid
            import math

            def _sigmoid(x):
                return 1 / (1 + math.exp(-x))

            confidence = float(_sigmoid(float(score)))
        else:
            confidence = 0.0

    return str(label), confidence
