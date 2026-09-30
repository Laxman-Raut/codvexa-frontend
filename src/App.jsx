import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import Dashbord from "./pages/Dashbord.jsx";
import { setUserData } from "./redux/userslice.js";
import { me } from "./features/login.js";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await me();
        dispatch(setUserData(data));
      } catch (error) {
        console.log("User not authenticated");
      }
    };

    fetchUser();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashbord />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;