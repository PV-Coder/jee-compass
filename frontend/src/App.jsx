import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home             from "./pages/Home";
import Login            from "./pages/Login";
import Signup           from "./pages/Signup";
import Dashboard        from "./pages/Dashboard";
import DiagnosticTest   from "./pages/DiagnosticTest";
import DiagnosticResult from "./pages/DiagnosticResult";
import Profile          from "./pages/Profile";
import Subjects         from "./pages/Subjects";
import SubjectDetail    from "./pages/subjects/SubjectDetail";
import ChapterPage      from "./pages/subjects/ChapterPage";
import PhysicsDashboard   from "./pages/subjects/PhysicsDashboard";
import ChemistryDashboard from "./pages/subjects/ChemistryDashboard";
import MathDashboard      from "./pages/subjects/MathDashboard";
import QuizPage         from "./pages/quiz/QuizPage";
import QuizResult       from "./pages/quiz/QuizResult";
import Analytics        from "./pages/Analytics";
import Revision         from "./pages/Revision";

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem("jee_user");
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"       element={<Home />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route path="/dashboard"           element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/subjects"            element={<PrivateRoute><Subjects /></PrivateRoute>} />
        <Route path="/subjects/:subjectId" element={<PrivateRoute><SubjectDetail /></PrivateRoute>} />
        <Route path="/subjects/:subjectId/:chapterId" element={<PrivateRoute><ChapterPage /></PrivateRoute>} />

        {/* Subject Dashboards */}
        <Route path="/dashboard/physics"     element={<PrivateRoute><PhysicsDashboard /></PrivateRoute>} />
        <Route path="/dashboard/chemistry"   element={<PrivateRoute><ChemistryDashboard /></PrivateRoute>} />
        <Route path="/dashboard/mathematics" element={<PrivateRoute><MathDashboard /></PrivateRoute>} />

        {/* Quiz */}
        <Route path="/quiz/:subjectId/:chapterId"        element={<PrivateRoute><QuizPage /></PrivateRoute>} />
        <Route path="/quiz/:subjectId/:chapterId/result" element={<PrivateRoute><QuizResult /></PrivateRoute>} />

        {/* Diagnostic */}
        <Route path="/diagnostic"        element={<PrivateRoute><DiagnosticTest /></PrivateRoute>} />
        <Route path="/diagnostic/result" element={<PrivateRoute><DiagnosticResult /></PrivateRoute>} />

        {/* Tools */}
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/revision"  element={<PrivateRoute><Revision /></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;