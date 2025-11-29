import React from 'react';
import { Header } from './components/Header';
import { QuizFlow } from './components/QuizFlow';
import { NewsFeed } from './components/NewsFeed';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow w-full max-w-lg mx-auto px-4 py-4 md:px-0">
        <div className="border-b border-gray-200 pb-2 mb-4">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#c00] font-sans">
            PÉRDIDA DE PESO
          </span>
        </div>

        {/* Dynamic Quiz Area */}
        <QuizFlow />

        {/* Divider */}
        <div className="h-1 w-full bg-gray-100 my-8 rounded-full"></div>

        {/* Static Bottom Content (Native Ads/Social Proof) */}
        <NewsFeed />
      </main>

      <footer className="bg-[#f5f5f5] py-8 mt-8 text-center text-xs text-gray-500 border-t border-gray-200">
        <p>© Protocolo Gelatina Bariátrica 2025 — Todos los Derechos Reservados.</p>
        <div className="mt-2 space-x-2">
          <a href="#" className="underline">Política de Privacidad</a>
          <span>|</span>
          <a href="#" className="underline">Términos de Uso</a>
        </div>
      </footer>
    </div>
  );
}