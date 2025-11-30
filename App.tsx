import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { QuizFlow } from './components/QuizFlow';
import { NewsFeed } from './components/NewsFeed';
import { Dashboard } from './components/dashboard/Dashboard';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (currentPath === '/dashboard' || currentPath === '/analytics') {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-lg mx-auto px-4 py-4 md:px-0">
        <div className="border-b border-gray-200 pb-2 mb-4">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#c00] font-sans">
            PÉRDIDA DE PESO
          </span>
        </div>

        <QuizFlow />

        <div className="h-1 w-full bg-gray-100 my-8 rounded-full"></div>

        <NewsFeed />
      </main>

    </div>
  );
}
