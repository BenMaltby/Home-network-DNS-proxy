import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Overview from './pages/Overview';
import QueryLog from './pages/QueryLog';
import Blocklist from './pages/Blocklist';
import LocalDns from './pages/LocalDns';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="queries" element={<QueryLog />} />
          <Route path="blocklist" element={<Blocklist />} />
          <Route path="local-dns" element={<LocalDns />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
