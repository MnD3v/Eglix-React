import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MembersList from "./pages/members/MembersList";
import MemberForm from "./pages/members/MemberForm";
import MemberDetails from "./pages/members/MemberDetails";
import GuestsList from "./pages/guests/GuestsList";
import GuestForm from "./pages/guests/GuestForm";
import TithesList from "./pages/tithes/TithesList";
import TitheForm from "./pages/tithes/TitheForm";
import TitheDetails from "./pages/tithes/TitheDetails";
import OfferingsList from "./pages/offerings/OfferingsList";
import OfferingForm from "./pages/offerings/OfferingForm";
import OfferingDetails from "./pages/offerings/OfferingDetails";
import ProjectsList from "./pages/projects/ProjectsList";
import ProjectForm from "./pages/projects/ProjectForm";
import ProjectDetails from "./pages/projects/ProjectDetails";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PublicMemberForm from "./pages/public/PublicMemberForm";
import Settings from "./pages/settings/Settings";
import CreateChurch from "./pages/church/CreateChurch";

// New modules
import ExpensesList from "./pages/expenses/ExpensesList";
import ExpenseForm from "./pages/expenses/ExpenseForm";
import DonationsList from "./pages/donations/DonationsList";
import DonationForm from "./pages/donations/DonationForm";
import JournalList from "./pages/journal/JournalList";
import JournalForm from "./pages/journal/JournalForm";
import JournalDetails from "./pages/journal/JournalDetails";
import Reports from "./pages/reports/Reports";
import AdministrationList from "./pages/administration/AdministrationList";
import AdministrationForm from "./pages/administration/AdministrationForm";
import DocumentsList from "./pages/documents/DocumentsList";
import DocumentForm from "./pages/documents/DocumentForm";
import GroupsList from "./pages/groups/GroupsList";
import GroupForm from "./pages/groups/GroupForm";
import GroupDetails from "./pages/groups/GroupDetails";

import AnnexesList from "./pages/annexes/AnnexesList";
import AnnexeForm from "./pages/annexes/AnnexeForm";
import AnnexeDetails from "./pages/annexes/AnnexeDetails";

import { ChurchProvider } from "./context/ChurchContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Loader from "./components/Loader";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ChurchProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Join Route */}
            <Route path="/join/:churchId" element={<PublicMemberForm />} />

            {/* Create Church Route (Protected) */}
            <Route path="/create-church" element={
              <ProtectedRoute>
                <CreateChurch />
              </ProtectedRoute>
            } />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />

              {/* Groups Routes */}
              <Route path="groups" element={<GroupsList />} />
              <Route path="groups/new" element={<GroupForm />} />
              <Route path="groups/:id" element={<GroupDetails />} />
              <Route path="groups/:id/edit" element={<GroupForm />} />

              {/* Annexes Routes */}
              <Route path="annexes" element={<AnnexesList />} />
              <Route path="annexes/new" element={<AnnexeForm />} />
              <Route path="annexes/:id" element={<AnnexeDetails />} />
              <Route path="annexes/:id/edit" element={<AnnexeForm />} />

              {/* Members Routes */}
              <Route path="members" element={<MembersList />} />
              <Route path="members/new" element={<MemberForm />} />
              <Route path="members/:id" element={<MemberDetails />} />
              <Route path="members/:id/edit" element={<MemberForm />} />

              {/* Guests Routes */}
              <Route path="guests" element={<GuestsList />} />
              <Route path="guests/new" element={<GuestForm />} />
              <Route path="guests/:id/edit" element={<GuestForm />} />

              {/* Tithes Routes */}
              <Route path="tithes" element={<TithesList />} />
              <Route path="tithes/new" element={<TitheForm />} />
              <Route path="tithes/:id" element={<TitheDetails />} />
              <Route path="tithes/:id/edit" element={<TitheForm />} />

              {/* Offerings Routes */}
              <Route path="offerings" element={<OfferingsList />} />
              <Route path="offerings/new" element={<OfferingForm />} />
              <Route path="offerings/:id" element={<OfferingDetails />} />
              <Route path="offerings/:id/edit" element={<OfferingForm />} />

              {/* Projects Routes */}
              <Route path="projects" element={<ProjectsList />} />
              <Route path="projects/new" element={<ProjectForm />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="projects/:id/edit" element={<ProjectForm />} />

              {/* Expenses Routes */}
              <Route path="expenses" element={<ExpensesList />} />
              <Route path="expenses/new" element={<ExpenseForm />} />
              <Route path="expenses/:id/edit" element={<ExpenseForm />} />

              {/* Donations Routes */}
              <Route path="donations" element={<DonationsList />} />
              <Route path="donations/new" element={<DonationForm />} />
              <Route path="donations/:id/edit" element={<DonationForm />} />

              {/* Journal Routes */}
              <Route path="journal" element={<JournalList />} />
              <Route path="journal/new" element={<JournalForm />} />
              <Route path="journal/:id" element={<JournalDetails />} />
              <Route path="journal/:id/edit" element={<JournalForm />} />

              {/* Reports Routes */}
              <Route path="reports" element={<Reports />} />

              {/* Administration Routes */}
              <Route path="administration" element={<AdministrationList />} />
              <Route path="administration/new" element={<AdministrationForm />} />
              <Route path="administration/:id/edit" element={<AdministrationForm />} />

              {/* Documents Routes */}
              <Route path="documents" element={<DocumentsList />} />
              <Route path="documents/new" element={<DocumentForm />} />
              <Route path="documents/:id/edit" element={<DocumentForm />} />

              {/* Other Routes */}
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </ChurchProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
