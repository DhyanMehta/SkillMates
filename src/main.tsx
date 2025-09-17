import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppStoreProvider } from './context/AppStore'

createRoot(document.getElementById("root")!).render(
  <AppStoreProvider>
    <App />
  </AppStoreProvider>
);
