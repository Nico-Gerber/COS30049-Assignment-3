import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Pie, Line } from "react-chartjs-2";

function Insights() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    api
      .get("/visual-data")
      .then((res) => setChartData(res.data))
      .catch((err) => console.error("Error fetching chart data", err));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-blue-700 text-center mb-8">
        Model Insights & Visualizations
      </h1>

      {chartData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Dataset Class Distribution
            </h2>
            <Pie data={chartData.classDistribution} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Model Confidence Over Predictions
            </h2>
            <Line data={chartData.confidenceTrend} />
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Loading visual data...</p>
      )}
    </div>
  );
}

export default Insights;
