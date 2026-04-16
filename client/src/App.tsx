import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Nav from './components/Nav';
import Footer from './components/Footer';
import { AlertOverlay } from './components/AlertOverlay';
import { AriaButton } from './components/AriaButton';
import HomePage from './pages/HomePage';
import DealsPage from './pages/DealsPage';
import MilesCardsPage from './pages/MilesCardsPage';
import PricingPage from './pages/PricingPage';
import DealPage from './pages/DealPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { WalletPage } from './pages/WalletPage';
import { WalletOnboardPage } from './pages/WalletOnboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/error-fares" element={<DealsPage filter="error_fare" />} />
          <Route path="/miles-cards" element={<MilesCardsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/deal/:id" element={<DealPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/wallet/onboard" element={<WalletOnboardPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
        <Footer />
        <AlertOverlay />
        <AriaButton />
      </BrowserRouter>
    </AuthProvider>
  );
}
