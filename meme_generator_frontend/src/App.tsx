import React from 'react';
import MemeEditor from './components/MemeEditor';

const App: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-white shadow">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold text-gray-800">Meme Generator</h1>
        </div>
      </header>
      <main>
        <MemeEditor />
      </main>
    </div>
  );
}

export default App;
