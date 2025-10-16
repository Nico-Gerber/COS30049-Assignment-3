import React, { useState } from "react";
import api from "../services/api";
import { Bar } from "react-chartjs-2";

function Detector() {
  const [inputText, setInputText] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [error, setError] = useState("");

  const handleDetect = async () => {
    setError("");
    if (!inputText.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }

    try {
      const response = await api.post("/predict", { text: inputText });
      setPrediction(response.data.prediction);
      setConfidence(response.data.confidence);
    } catch (err) {
      console.error(err);
      setError("Error connecting to the backend API.");
    }
  };

  const chartData = {
    labels: ["Real", "Fake"],
    datasets: [
      {
        label: "Confidence Level",
        data:
          prediction === "Fake"
            ? [100 - confidence * 100, confidence * 100]
            : [confidence * 100, 100 - confidence * 100],
        backgroundColor: ["#22c55e", "#ef4444"],
      },
    ],
  };

  return (
    <div className="p-8 text-center bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">
        Misinformation Detector
      </h1>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="w-full max-w-2xl p-4 border rounded-lg shadow-sm mb-4"
        placeholder="Enter or paste text here..."
        rows="6"
      ></textarea>
      <div>
        <button
          onClick={handleDetect}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Detect Misinformation
        </button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {prediction && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">
            Prediction:{" "}
            <span
              className={
                prediction === "Fake" ? "text-red-600" : "text-green-600"
              }
            >
              {prediction}
            </span>
          </h2>
          <p className="text-gray-600 mb-6">
            Confidence: {(confidence * 100).toFixed(2)}%
          </p>
          <div className="max-w-lg mx-auto">
            <Bar data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Detector;
