import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import { AlertOverlay } from './components/AlertOverlay';
import { AriaButton } from './components/AriaButton';
import HomePage from './pages/HomePage';
import DealsPage from './pages/DealsPage';
import MilesCardsPage from './pages/MilesCardsPage';
import PricingPage from './pages/PricingPage';
import DealPage from './pages/DealPage';
import TripPlannerPage from './features/trip-planner/TripPlannerPage';
import TripResultsPage from './features/trip-planner/TripResultsPage';
import TripPlannerPageV2 from './features/trip-planner/v2/TripPlannerPageV2';
import TripConfirmedPage from './features/trip-planner/TripConfirmedPage';

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/error-fares" element={<DealsPage filter="error_fare" />} />
        <Route path="/miles-cards" element={<MilesCardsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/deal/:id" element={<DealPage />} />
        <Route path="/plan" element={<TripPlannerPageV2 />} />
        <Route path="/plan/:searchId" element={<TripResultsPage />} />
        <Route path="/plan/:searchId/confirmed" element={<TripConfirmedPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
      <AlertOverlay />
      <AriaButton />
    </BrowserRouter>
  );
}
