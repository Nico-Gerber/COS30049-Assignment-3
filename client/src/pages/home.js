import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-gradient-to-b from-blue-50 to-blue-100">
      <h1 className="text-5xl font-bold text-blue-700 mb-4">
        Misinformation Detection App
      </h1>
      <p className="text-lg text-gray-700 max-w-2xl mb-8">
        This project helps identify whether a given piece of text is <b>Real</b> or <b>Fake</b> using a
        machine learning model trained on social media data.
      </p>
      <Link
        to="/detector"
        className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition-all"
      >
        Try the Detector
      </Link>
      <div className="mt-12 text-gray-500 text-sm">
        Built using React.js + FastAPI + Machine Learning
      </div>
    </div>
  );
}

export default Home;
