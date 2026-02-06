import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Galaxy } from './pages/Galaxy';
import { Fleet } from './pages/Fleet';
import { Facilities } from './pages/Facilities';
import { Research } from './pages/Research';
import { Defense } from './pages/Defense';
import { Marketplace } from './pages/Marketplace';
import { ApiDocs } from './pages/ApiDocs';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#030509] text-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/galaxy" element={<Galaxy />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/research" element={<Research />} />
          <Route path="/defense" element={<Defense />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/api-docs" element={<ApiDocs />} />
        </Routes>
      </div>
    </Router>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="stars-bg" />
      <div className="nebula" />
      <div className="text-center relative z-10">
        <h1 className="font-display text-4xl text-white mb-4">{title.toUpperCase()}</h1>
        <p className="text-gray-400 mb-8">This module is under construction</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600/10 border border-sky-600/30 rounded-full">
          <span className="w-2 h-2 bg-sky-400 rounded-full pulse-glow" />
          <span className="text-sky-400 text-sm font-mono">COMING SOON</span>
        </div>
      </div>
    </div>
  );
}

export default App;
