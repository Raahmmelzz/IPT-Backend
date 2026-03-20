import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import your pages
import Store from './Store';
import Dashboard from './Dashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
      <Route path="/" element={<Store />} />
      {/* Now /admin shows the dashboard with the sidebar! */}
      <Route path="/admin" element={<Dashboard />} /> 
    </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;