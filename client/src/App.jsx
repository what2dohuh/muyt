// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MusicPlayer from "./pages/MusicPlayer";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MusicPlayer />} />
      </Routes>
    </BrowserRouter>
  );
}

