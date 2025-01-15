import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Radar from './pages/RadarPage';
import Statistics from './pages/StatisticsPage';
import Home from './pages/HomePage';
import Projects from './pages/ProjectsPage';

const Main = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/radar" element={<Radar />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default Main;