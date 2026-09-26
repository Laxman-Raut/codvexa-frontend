
import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashbord from "./pages/Dashbord.jsx";

function App() {

return (
  <BrowserRouter>
    <Routes>
   
      <Route path="/dashboard" element={<Dashbord />} />
    </Routes>
  </BrowserRouter>
);
}

export default App;