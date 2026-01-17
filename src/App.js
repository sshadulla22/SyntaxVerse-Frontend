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

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

