import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MemeEditor from './components/MemeEditor';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen font-sans">
        <header className="bg-white shadow">
          <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-800">Meme Generator</h1>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<MemeEditor />} />
            <Route path="/:configId" element={<MemeEditor />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
