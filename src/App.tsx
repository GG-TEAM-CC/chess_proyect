import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateRoomPage from './presentation/pages/CreateRoomPage';
import ChessRoomPage from './presentation/pages/ChessRoomPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateRoomPage />} />
        <Route path="/sala/:roomId" element={<ChessRoomPage />} />
      </Routes>
    </Router>
  );
};

export default App;
