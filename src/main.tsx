import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import PrivacyPolicy from './PrivacyPolicy.tsx';
import './index.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">Something went wrong. Please check the console.</div>;
    }

    return this.props.children;
  }
}

const container = document.getElementById('root');

if (!container) {
  throw new Error(
    "Root element #root not found. Make sure there is an element with id='root' in your index.html.",
  );
}

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
);

