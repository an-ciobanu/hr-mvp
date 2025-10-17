import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProfileViewPage from "./pages/ProfileViewPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import FeedbackListPage from "./pages/FeedbackListPage";
import FeedbackNewPage from "./pages/FeedbackNewPage";
import AbsenceListPage from "./pages/AbsenceListPage";
import AbsenceRequestPage from "./pages/AbsenceRequestPage";
import ManagerPanelPage from "./pages/ManagerPanelPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import { isLoggedIn } from "./lib/auth";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          isLoggedIn() ? (
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
