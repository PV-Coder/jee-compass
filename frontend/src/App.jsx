import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home           from "./pages/Home";
import Login          from "./pages/Login";
import Signup         from "./pages/Signup";
import Dashboard      from "./pages/Dashboard";
import DiagnosticTest from "./pages/DiagnosticTest";
import Analysis       from "./pages/Analysis";
import Recommendation from "./pages/Recommendation";
import Profile        from "./pages/Profile";

// Route guard — redirects to /login if not authenticated
const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem("jee_user");
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/signup"         element={<Signup />} />
        <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/test"           element={<PrivateRoute><DiagnosticTest /></PrivateRoute>} />
        <Route path="/analysis"       element={<PrivateRoute><Analysis /></PrivateRoute>} />
        <Route path="/recommendations" element={<PrivateRoute><Recommendation /></PrivateRoute>} />
        <Route path="/profile"        element={<PrivateRoute><Profile /></PrivateRoute>} />
        {/* Fallback */}
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
