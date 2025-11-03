from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging
import re
import math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["History"])

# Import the shared analysis_history from predict_route
# This will be imported from predict_route to maintain data consistency
def get_analysis_history():
    """Import analysis_history from predict_route"""
    from routes.predict_route import analysis_history
    return analysis_history

class FeedbackUpdate(BaseModel):
    feedback: str

# GET - Retrieve analysis history
@router.get("/")
def get_analysis_history_endpoint(limit: int = 10, offset: int = 0):
    """
    Get paginated analysis history
    
    - **limit**: Number of records to return (default: 10)
    - **offset**: Number of records to skip (default: 0)
    - Returns: Paginated list of analysis records
    """
    try:
        analysis_history = get_analysis_history()
        total = len(analysis_history)
        items = analysis_history[offset:offset + limit]
        
        logger.info(f"Retrieved {len(items)} history items (total: {total}, offset: {offset}, limit: {limit})")
        
        return {
            "total": total,
            "items": items,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
    except Exception as e:
        logger.error(f"Error retrieving history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analysis history"
        )

# GET - Get specific analysis by ID
@router.get("/{analysis_id}")
def get_analysis_by_id(analysis_id: int):
    """
    Get a specific analysis by ID
    
    - **analysis_id**: The ID of the analysis to retrieve
    - Returns: Detailed analysis record
    """
    try:
        analysis_history = get_analysis_history()
        analysis = next((item for item in analysis_history if item["id"] == analysis_id), None)
        
        if not analysis:
            logger.warning(f"Analysis with ID {analysis_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis with ID {analysis_id} not found"
            )
        
        logger.info(f"Retrieved analysis with ID {analysis_id}")
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving analysis {analysis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analysis"
        )

# GET - Get statistics
@router.get("/stats/summary")
def get_statistics():
    """
    Get overall statistics about predictions
    
    - Returns: Summary statistics including totals, counts, and averages
    """
    try:
        analysis_history = get_analysis_history()
        
        if not analysis_history:
            return {
                "total_analyses": 0,
                "fake_count": 0,
                "real_count": 0,
                "avg_confidence": 0,
                "recent_analyses": 0
            }
        
        fake_count = sum(1 for item in analysis_history if "fake" in item["prediction"].lower())
        real_count = len(analysis_history) - fake_count
        avg_confidence = sum(item["confidence"] for item in analysis_history) / len(analysis_history)
        
        # Count recent analyses (last 24 hours)
        from datetime import datetime, timedelta
        recent_cutoff = datetime.now() - timedelta(hours=24)
        recent_analyses = sum(
            1 for item in analysis_history 
            if datetime.fromisoformat(item["timestamp"].replace('Z', '+00:00') if isinstance(item["timestamp"], str) else str(item["timestamp"])) > recent_cutoff
        )
        
        stats = {
            "total_analyses": len(analysis_history),
            "fake_count": fake_count,
            "real_count": real_count,
            "avg_confidence": round(avg_confidence, 3),
            "recent_analyses": recent_analyses
        }
        
        logger.info(f"Generated statistics: {stats}")
        return stats
        
    except Exception as e:
        logger.error(f"Error generating statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate statistics"
        )

# PUT - Update user feedback for an analysis
@router.put("/{analysis_id}/feedback")
def update_feedback(analysis_id: int, feedback_data: FeedbackUpdate):
    """
    Update user feedback for a specific analysis
    
    - **analysis_id**: The ID of the analysis to update
    - **feedback**: The feedback content to add
    - Returns: Updated analysis record
    """
    try:
        analysis_history = get_analysis_history()
        analysis = next((item for item in analysis_history if item["id"] == analysis_id), None)
        
        if not analysis:
            logger.warning(f"Analysis with ID {analysis_id} not found for feedback update")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis with ID {analysis_id} not found"
            )
        
        # Update feedback
        analysis["user_feedback"] = feedback_data.feedback.strip()
        
        logger.info(f"Updated feedback for analysis {analysis_id}")
        return {
            "message": "Feedback updated successfully",
            "analysis": analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating feedback for analysis {analysis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update feedback"
        )

# DELETE - Remove an analysis from history
@router.delete("/{analysis_id}")
def delete_analysis(analysis_id: int):
    """
    Delete a specific analysis from history
    
    - **analysis_id**: The ID of the analysis to delete
    - Returns: Confirmation message
    """
    try:
        # Import and modify the global analysis_history
        from routes import predict_route
        
        analysis = next((item for item in predict_route.analysis_history if item["id"] == analysis_id), None)
        if not analysis:
            logger.warning(f"Analysis with ID {analysis_id} not found for deletion")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis with ID {analysis_id} not found"
            )
        
        predict_route.analysis_history = [
            item for item in predict_route.analysis_history 
            if item["id"] != analysis_id
        ]
        
        logger.info(f"Deleted analysis with ID {analysis_id}")
        return {
            "message": "Analysis deleted successfully",
            "deleted_id": analysis_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting analysis {analysis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete analysis"
        )

# DELETE - Clear all history
@router.delete("/")
def clear_all_history():
    """
    Clear all analysis history
    
    - Returns: Confirmation message with count of cleared records
    """
    try:
        # Import and modify the global analysis_history
        from routes import predict_route
        
        count = len(predict_route.analysis_history)
        predict_route.analysis_history.clear()
        
        logger.info(f"Cleared all analysis history ({count} records)")
        return {
            "message": f"Cleared {count} analyses from history",
            "cleared_count": count
        }
        
    except Exception as e:
        logger.error(f"Error clearing all history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear history"
        )

# GET - Search history by text content
@router.get("/search/{query}")
def search_history(query: str, limit: int = 10):
    """
    Search analysis history by text content
    
    - **query**: Search term to look for in analysis text
    - **limit**: Maximum number of results to return
    - Returns: Matching analysis records
    """
    try:
        analysis_history = get_analysis_history()
        query_lower = query.lower().strip()
        
        if not query_lower:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search query cannot be empty"
            )
        
        # Search in text content
        matches = [
            item for item in analysis_history
            if query_lower in item["text"].lower()
        ][:limit]
        
        logger.info(f"Search for '{query}' returned {len(matches)} results")
        return {
            "query": query,
            "matches": matches,
            "total_matches": len(matches),
            "limit": limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching history for '{query}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search history"
        )

# NEW: compute and return distinctive words (word-shift / log-odds) from in-memory analysis_history
@router.get("/distinct-words")
def get_distinct_words(limit: int = 40, min_count: int = 2):
    """
    Compute distinctive words (log-odds) from the shared analysis_history.
    Returns JSON shaped like:
    {
      "items": [{ "word": "vaccine", "logodds": 2.31, "count_real": 10, "count_fake": 1, "sum": 11 }, ...],
      "top_by_label": { "real": [...], "fake": [...] }
    }
    """
    try:
        analysis_history = get_analysis_history()
        if not analysis_history:
            return {"items": [], "top_by_label": {"real": [], "fake": []}}

        # tokenization helper (simple, same as frontend)
        tok_re = re.compile(r"\b[a-z0-9']+\b", re.I)
        def tokenize_text(s):
            if not s:
                return []
            return list({t.lower() for t in tok_re.findall(str(s))})

        cnt_real = {}
        cnt_fake = {}
        total_real = 0
        total_fake = 0

        for it in analysis_history:
            label_raw = str(it.get("label") or it.get("prediction") or it.get("result") or "").lower()
            # determine label: 'real' or 'fake' (best-effort)
            if "fake" in label_raw or label_raw == "0" or label_raw == "false":
                lbl = "fake"
            elif "real" in label_raw or label_raw == "1" or label_raw == "true":
                lbl = "real"
            else:
                # fallbacks
                if it.get("is_fake") in (True, "true", "1"):
                    lbl = "fake"
                elif it.get("is_fake") in (False, "false", "0"):
                    lbl = "real"
                else:
                    # skip if unknown
                    continue

            toks = tokenize_text(it.get("text") or it.get("content") or it.get("tweet") or it.get("post") or "")
            if not toks:
                continue
            if lbl == "real":
                total_real += 1
                for w in toks:
                    cnt_real[w] = cnt_real.get(w, 0) + 1
            else:
                total_fake += 1
                for w in toks:
                    cnt_fake[w] = cnt_fake.get(w, 0) + 1

        total_real = max(1, total_real)
        total_fake = max(1, total_fake)
        prior = 0.01

        all_words = set(list(cnt_real.keys()) + list(cnt_fake.keys()))
        results = []
        for w in all_words:
            cr = cnt_real.get(w, 0)
            cf = cnt_fake.get(w, 0)
            s = cr + cf
            if s < min_count:
                continue
            A = cr + prior
            B = cf + prior
            # avoid divide by zero: use totals minus A/B
            denomA = max(1e-9, (total_real - cr + prior))
            denomB = max(1e-9, (total_fake - cf + prior))
            oddsA = A / denomA
            oddsB = B / denomB
            # signed log-odds: positive => associated with real, negative => fake
            logodds = math.log(max(1e-9, oddsA / oddsB))
            results.append({
                "word": w,
                "logodds": float(logodds),
                "count_real": int(cr),
                "count_fake": int(cf),
                "sum": int(s)
            })

        # sort by absolute association strength
        results.sort(key=lambda x: abs(x["logodds"]), reverse=True)
        top = results[:limit]

        # split into top_by_label for compatibility with frontend WordShiftDiverging
        real_list = []
        fake_list = []
        for r in top:
            if r["logodds"] >= 0:
                real_list.append({"word": r["word"], "log_odds": float(r["logodds"]), "count": r["count_real"] or r["sum"]})
            else:
                # present fake side values as positive magnitude for chart but keep sign in items
                fake_list.append({"word": r["word"], "log_odds": float(abs(r["logodds"])), "count": r["count_fake"] or r["sum"]})

        return {
            "items": top,
            "top_by_label": {
                "real": real_list,
                "fake": fake_list
            },
            "total_real": total_real,
            "total_fake": total_fake
        }

    except Exception as e:
        logger.error(f"Error computing distinct words: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to compute distinct words")