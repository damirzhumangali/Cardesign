import ReactDOM from 'react-dom/client';
import App from './App';
import { AppRecovery, ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary fallback={<AppRecovery />}>
    <App />
  </ErrorBoundary>,
);
