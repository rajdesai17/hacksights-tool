import React from 'react';
import { Toaster } from 'react-hot-toast';
import HackathonForm from './components/HackathonForm';
import { Code2 } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      

        <HackathonForm />
     
    </div>
  );
}

export default App;