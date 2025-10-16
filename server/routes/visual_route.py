from fastapi import APIRouter

router = APIRouter(prefix="/visual-data", tags=["VisualData"])


@router.get("/")
def get_visual_data():
    """Return sample visual data compatible with frontend Chart.js usage.

    Structure:
    {
      "classDistribution": { labels: [...], datasets: [...] },
      "confidenceTrend": { labels: [...], datasets: [...] }
    }
    """
    # Minimal example data. In production, compute from dataset or model logs.
    class_distribution = {
        "labels": ["Real", "Fake"],
        "datasets": [
            {
                "data": [65, 35],
                "backgroundColor": ["#22c55e", "#ef4444"],
            }
        ],
    }

    confidence_trend = {
        "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
        "datasets": [
            {
                "label": "Avg Confidence",
                "data": [0.82, 0.79, 0.84, 0.81],
                "borderColor": "#3b82f6",
                "fill": False,
            }
        ],
    }

    return {"classDistribution": class_distribution, "confidenceTrend": confidence_trend}
