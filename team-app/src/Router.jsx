import { Router, Routes, Route } from "react-router-dom";
import RequestPage from "./pages/RequestPage";
import App from "./App";

export default function AppRouter() {
  return (
    <>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/request" element={<RequestPage />} />
      </Routes>
    </>
  );
}
