
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppState, AppSettings, FarmerTicket } from './types';
import { DEFAULT_SETTINGS, STORAGE_KEY } from './constants';
import FarmerList from './screens/FarmerList';
import Settings from './screens/Settings';
import CreateTicket from './screens/CreateTicket';
import WeighingSession from './screens/WeighingSession';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }
    return {
      tickets: [],
      settings: DEFAULT_SETTINGS,
    };
  });

  // Auto-save logic
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateSettings = (newSettings: AppSettings) => {
    setState(prev => ({ ...prev, settings: newSettings }));
  };

  const addTicket = (ticket: FarmerTicket) => {
    setState(prev => ({ ...prev, tickets: [ticket, ...prev.tickets] }));
  };

  const updateTicket = (id: string, updates: Partial<FarmerTicket>) => {
    setState(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const deleteTicket = (id: string) => {
    setState(prev => ({
      ...prev,
      tickets: prev.tickets.filter(t => t.id !== id)
    }));
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-background-dark text-white font-sans selection:bg-primary selection:text-black">
        <Routes>
          <Route path="/" element={<FarmerList state={state} onDelete={deleteTicket} />} />
          <Route path="/settings" element={<Settings settings={state.settings} onUpdate={updateSettings} />} />
          <Route path="/create" element={<CreateTicket settings={state.settings} onAdd={addTicket} />} />
          <Route 
            path="/weigh/:id" 
            element={<WeighingSession tickets={state.tickets} settings={state.settings} onUpdate={updateTicket} />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
