import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import FeishuDebug from "@/pages/FeishuDebug";
import ImageCacheManager from "@/pages/ImageCacheManager";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/debug" element={<FeishuDebug />} />
        <Route path="/cache" element={<ImageCacheManager onBack={() => window.history.back()} />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
