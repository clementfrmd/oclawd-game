import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Galaxy } from './pages/Galaxy';
import { Fleet } from './pages/Fleet';
import { Marketplace } from './pages/Marketplace';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-space-900 text-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/galaxy" element={<Galaxy />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
