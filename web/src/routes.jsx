import ManagerAbsenceListPage from "./pages/ManagerAbsenceListPage";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProfileViewPage from "./pages/ProfileViewPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import FeedbackListPage from "./pages/FeedbackListPage";
import FeedbackNewPage from "./pages/FeedbackNewPage";
import AbsenceListPage from "./pages/AbsenceListPage";
import AbsenceRequestPage from "./pages/AbsenceRequestPage";
import ManagerPanelPage from "./pages/ManagerPanelPage";
import EmployeeListPage from "./pages/EmployeeListPage";
import EmployeeProfileEditPage from "./pages/EmployeeProfileEditPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import { useAuth } from "./components/Auth/AuthContext";

export default function AppRoutes() {
  const { data, isLoading } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoading ? null : data && data.ok ? (
            <Navigate to="/profile" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/"
        element={
          isLoading ? null : data && data.ok ? (
            <Navigate to="/profile" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <ProfileEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <FeedbackListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <EmployeeListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:userId"
        element={
          <ProtectedRoute>
            <ProfileViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:userId/edit"
        element={
          <ProtectedRoute>
            <EmployeeProfileEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/new"
        element={
          <ProtectedRoute>
            <FeedbackNewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/absences"
        element={
          <ProtectedRoute>
            <AbsenceListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/absences/request"
        element={
          <ProtectedRoute>
            <AbsenceRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager"
        element={
          <ProtectedRoute>
            <ManagerPanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/absences"
        element={
          <ProtectedRoute>
            <ManagerAbsenceListPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
