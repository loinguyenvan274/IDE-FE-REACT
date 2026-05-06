import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StartPage from "./pages/StartPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WorkspacePage from "./pages/WorkspacePage";
import { authService } from "./services/authService";

const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/workspaces" 
          element={
            <PrivateRoute>
              <StartPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/workspaces/:projectName" 
          element={
            <PrivateRoute>
              <WorkspacePage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}
