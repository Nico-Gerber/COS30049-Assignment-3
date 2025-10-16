import React from "react";

function About() {
  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-blue-700 mb-6 text-center">
        About the Project
      </h1>

      <div className="max-w-4xl mx-auto text-gray-700 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-2">🎯 Project Overview</h2>
          <p>
            This web application is designed to detect misinformation in social
            media posts using a trained machine learning model. The project
            integrates natural language processing (NLP) techniques to classify
            content as <b>Real</b> or <b>Fake</b>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">🧠 Machine Learning Model</h2>
          <p>
            Our model was trained using <b>TF-IDF vectorization</b> and{" "}
            <b>Logistic Regression</b> on a labelled dataset of tweets. The model
            achieves high accuracy and processes inputs in real-time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">💡 Technologies Used</h2>
          <ul className="list-disc pl-6">
            <li>Frontend: React.js, Chart.js, TailwindCSS</li>
            <li>Backend: FastAPI, Uvicorn</li>
            <li>ML: Scikit-learn, Pandas, NumPy</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">👥 Team Members</h2>
          <ul className="list-disc pl-6">
            <li>Aryan Prajapati – Frontend & ML Integration</li>
            <li>[Member 2] – Backend & API Development</li>
            <li>[Member 3] – Visualization & Report</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default About;
