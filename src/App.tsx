import { Router, Route, useLocation, Redirect } from "wouter";
import { useEffect, useState, ReactNode } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Loading from "./components/common/Loading";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import UserProfile from "./pages/UserProfile";
import PatientDashboard from "./pages/PatientDashboard";
import Appointment from "./pages/Appointment";
import AIChat from "./components/common/AIChat";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminSettings from "./pages/admin/AdminSettings";

interface PrivateRouteProps {
  children: ReactNode;
  path: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, path }) => {
  const { isAuthenticated } = useAuth();
  return (
    <Route path={path}>
      {isAuthenticated ? children : <Redirect to={`/login?redirect=${encodeURIComponent(path)}`} />}
    </Route>
  );
};

const AdminRoute: React.FC<PrivateRouteProps> = ({ children, path }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  return (
    <Route path={path}>
      {!isAuthenticated
        ? <Redirect to={`/login?redirect=${encodeURIComponent(path)}`} />
        : !isAdmin
          ? <Redirect to="/" />
          : children}
    </Route>
  );
};

function AppContent() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setIsLoading(true);

    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [location]);

  return (
    <>
      <Loading isVisible={isLoading} message="Carregando página..." />
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/login" component={Login} />
      <PrivateRoute path="/profile">
        <UserProfile />
      </PrivateRoute>
      <PrivateRoute path="/dashboard">
        <PatientDashboard />
      </PrivateRoute>
      <PrivateRoute path="/appointment">
        <Appointment />
      </PrivateRoute>

      <AdminRoute path="/admin">
        <AdminDashboard />
      </AdminRoute>
      <AdminRoute path="/admin/patients">
        <AdminPatients />
      </AdminRoute>
      <AdminRoute path="/admin/appointments">
        <AdminAppointments />
      </AdminRoute>
      <AdminRoute path="/admin/settings">
        <AdminSettings />
      </AdminRoute>
      
      {/* Recepção Virtual com IA em todas as páginas */}
      <AIChat />
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
