import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import FoodBrowser from './pages/FoodBrowser';
import MealPlanner from './pages/MealPlanner';
import NutritionTracker from './pages/NutritionTracker';
import './styles/main.css';

function AppShell() {
  const { user, loading, guestMode } = useApp();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!user && !guestMode) return <AuthPage />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/food" element={<FoodBrowser />} />
          <Route path="/planner" element={<MealPlanner />} />
          <Route path="/tracker" element={<NutritionTracker />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
