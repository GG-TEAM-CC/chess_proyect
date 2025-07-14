// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {HomePage} from "./presentation/pages/HomePage.tsx";
import {RealTimePage} from "./presentation/pages/realTimepage.tsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/realtime" element={<RealTimePage />} />
      </Routes>
    </Router>
  );
}

export default App;
