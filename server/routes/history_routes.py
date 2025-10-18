from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["History"])

# Import the shared analysis_history from enhanced_predict_route
# This will be imported from enhanced_predict_route to maintain data consistency
def get_analysis_history():
    """Import analysis_history from enhanced_predict_route"""
    from routes.enhanced_predict_route import analysis_history
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
        from routes import enhanced_predict_route
        
        analysis = next((item for item in enhanced_predict_route.analysis_history if item["id"] == analysis_id), None)
        if not analysis:
            logger.warning(f"Analysis with ID {analysis_id} not found for deletion")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis with ID {analysis_id} not found"
            )
        
        enhanced_predict_route.analysis_history = [
            item for item in enhanced_predict_route.analysis_history 
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
        from routes import enhanced_predict_route
        
        count = len(enhanced_predict_route.analysis_history)
        enhanced_predict_route.analysis_history.clear()
        
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