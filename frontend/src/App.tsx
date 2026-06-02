import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Jobs from "./pages/Jobs";
import Networking from "./pages/Networking";
import InterviewPrep from "./pages/InterviewPrep";
import Journal from "./pages/Journal";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/contacts" element={<Networking />} />
          <Route path="/prep" element={<InterviewPrep />} />
          <Route path="/journal" element={<Journal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
