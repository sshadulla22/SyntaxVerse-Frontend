import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Notes from "./Component/Notes";
import Note from "./Component/Note";
import Main from "./Component/Main";
import Login from "./Component/Auth/Login";
import Signup from "./Component/Auth/Signup";
import Canvas from "./Component/Canvas";
import GalaxyGraph from "./Component/GalaxyGraph";
import authService from "./services/auth";
import StarsBackground from "./Component/UI/StarsBackground";
import CommandCenter from "./Component/UI/CommandCenter";
import ErrorPage from "./Component/UI/ErrorPage";

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <StarsBackground />
      <CommandCenter />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Workspace Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        } />
        <Route path="/notes" element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        } />
        <Route path="/notes/:folderId" element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        } />
        <Route path="/note/:id" element={
          <ProtectedRoute>
            <Note />
          </ProtectedRoute>
        } />
        <Route path="/canvas" element={
          <ProtectedRoute>
            <Canvas />
          </ProtectedRoute>
        } />
        <Route path="/galaxy" element={
          <ProtectedRoute>
            <GalaxyGraph />
          </ProtectedRoute>
        } />

        {/* Status Code Pages */}
        <Route path="/404" element={<ErrorPage code="404" />} />
        <Route path="/500" element={<ErrorPage code="500" />} />
        <Route path="/403" element={<ErrorPage code="403" />} />

        {/* Catch all */}
        <Route path="*" element={<ErrorPage code="404" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

