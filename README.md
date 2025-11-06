# COS30049 Assignment 3 - Misinformation Detection Platform

A full-stack web application that leverages machine learning to detect misinformation in text content, built with React.js frontend and FastAPI backend.

### Prerequisites
- Node.js (v16+ recommended)
- Python 3.8+
- npm

### Installation & Setup

1. **Unzip the zip folder**
   ```
   unzip the zipped folder
   cd 'folder directory'
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm start
   ```
   The React app will run on `http://localhost:3000`

3. **Backend Setup**
   ```bash
   cd server
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
   The FastAPI server will run on `http://localhost:8000`

## Project Overview

This application provides an intuitive interface for users to analyze text content for potential misinformation using trained machine learning models. It features real-time analysis, comprehensive data visualizations, and a complete analysis history management system.

### Key Features

- **Real-time Text Analysis**: Instant misinformation detection with confidence scores
- **Interactive Data Visualizations**: Four different chart types showing analysis trends
- **Responsive Design**: Mobile-first approach with Material-UI components
- **Complete CRUD Operations**: Full analysis history management
- **Advanced Form Validation**: Real-time input validation with visual feedback
- **Professional UI/UX**: Clean, intuitive interface following Material Design principles

## Architecture

### Frontend (React.js)
- **Framework**: React 19.2.0 with functional components and hooks
- **UI Library**: Material-UI 7.3.4 for consistent design system
- **Routing**: React Router 7.9.4 for navigation
- **Charts**: Chart.js 4.5.1 with react-chartjs-2 for data visualization
- **HTTP Client**: Axios for API communication

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.8+
- **AI/ML**: Scikit-learn for machine learning model integration
- **Data Validation**: Pydantic for request/response validation
- **Model**: Logistic Regression classifier with TF-IDF vectorization

## Project Structure

```
COS30049-Assignment-3/
├── client/                          # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.js        # App navigation
│   │   │   ├── footer.js           # Footer component
│   │   │   ├── userDistinctWords.js # Word analysis component
│   │   │   └── WordContributionsChart.jsx # Chart component
│   │   ├── pages/
│   │   │   ├── home.js              # Landing page
│   │   │   ├── about.js             # About page
│   │   │   ├── insights.js          # Data visualizations
│   │   │   ├── MisinformationDetector.js # Main analysis tool
│   │   │   └── AnalysisHistory.js   # History management
│   │   ├── App.js                   # Main app component
│   │   ├── App.css                  # Application styles
│   │   ├── theme.css                # Theme variables
│   │   └── index.js                 # App entry point
│   └── package.json                 # Frontend dependencies
├── server/                          # FastAPI Backend
│   ├── model/
│   │   ├── __init__.py
│   │   └── model.py                 # AI model integration
│   ├── routes/
│   │   ├── history_routes.py        # History management routes
│   │   └── predict_route.py         # Prediction routes
│   ├── main.py                      # FastAPI application
│   └── requirements.txt             # Python dependencies
└── README.md                        # Project documentation
```

## Core Features

### 1. Misinformation Detection
- **Location**: `client/src/pages/MisinformationDetector.js`
- Real-time text analysis with character limit (280 characters)
- Advanced input validation with visual feedback
- Confidence score display with color-coded results
- Warning system for URLs and suspicious patterns

### 2. Data Visualizations
- **Location**: `client/src/pages/insights.js`
- **Bar Chart**: Misinformation detection by category
- **Pie Chart**: Detection accuracy distribution
- **Line Chart**: Detection trends over time
- **Doughnut Chart**: Confidence score distribution

### 3. Analysis History
- **Location**: `client/src/pages/AnalysisHistory.js`
- Complete CRUD operations for analysis records
- Searchable and filterable history
- Export functionality for analysis data
- User feedback collection system

### 4. Responsive Design
- Mobile-first approach with Material-UI breakpoints
- Touch-friendly interface elements
- Adaptive layouts for all screen sizes
- Professional color scheme and typography

## API Endpoints

### Prediction Routes
- `POST /predict/` - Analyze text for misinformation
- `GET /predict/history` - Fetch analysis history
- `GET /predict/history/{id}` - Get specific analysis
- `PUT /predict/history/{id}/feedback` - Update user feedback
- `DELETE /predict/history/{id}` - Delete analysis
- `DELETE /predict/history` - Clear all history

### Statistics Routes
- `GET /predict/stats` - Get detection statistics

## AI Model Integration

### Model Architecture
- **Algorithm**: Logistic Regression classifier
- **Vectorization**: TF-IDF (Term Frequency-Inverse Document Frequency)
- **Features**: Text preprocessing pipeline with advanced cleaning

### Text Preprocessing Pipeline
1. Convert to lowercase
2. Remove excessive whitespace
3. Handle URLs with placeholders
4. Normalize mentions and hashtags
5. Clean excessive punctuation
6. Handle repeated characters
7. Final text cleanup and normalization

### Model Performance
- **Accuracy**: Optimized for real-world misinformation detection
- **Confidence Scoring**: Probability-based confidence with 3-decimal precision
- **Response Time**: Sub-second prediction times with lazy loading


## Features & Capabilities

### Assignment Requirements Met

| Requirement | Implementation | Status |
|------------|----------------|---------|
| **User Input Form with Validation** | Real-time validation, character limits, error handling | ✅ Complete |
| **Data Visualization Charts** | 4 chart types (Bar, Pie, Line, Doughnut) | ✅ Complete |
| **Responsive UI Design** | Material-UI breakpoints, mobile-first | ✅ Complete |
| **API Integration** | Full CRUD operations with error handling | ✅ Complete |
| **UI/UX Principles** | Material Design, accessibility, consistency | ✅ Complete |
| **FastAPI Server** | Production-ready with comprehensive routing | ✅ Complete |
| **Multiple HTTP Methods** | GET, POST, PUT, DELETE operations | ✅ Complete |
| **AI Model Integration** | Optimized loading, preprocessing pipeline | ✅ Complete |
| **API Endpoints** | 7+ endpoints for complete functionality | ✅ Complete |
| **Error Handling** | Frontend & backend comprehensive handling | ✅ Complete |

### Additional Features

- **Analysis History Management**: Complete CRUD operations for user analysis records
- **Advanced Text Preprocessing**: Multi-stage text cleaning and normalization
- **Real-time Feedback System**: User can provide feedback on predictions
- **Export Functionality**: Download analysis results in various formats
- **Progressive Web App**: Responsive design with offline capabilities
- **Accessibility**: WCAG compliant design with keyboard navigation
- **Performance Optimization**: Lazy loading, code splitting, efficient rendering
