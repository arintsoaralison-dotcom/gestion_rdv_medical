import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Inscription from "./pages/Inscription";
import ListeMedecins from "./pages/ListeMedecins";
import ProfilMedecin from "./pages/ProfilMedecin";
import PrendreRendezVous from "./pages/PrendreRendezVous";
import MesRendezVous from "./pages/MesRendezVous";
import MonProfil from "./pages/MonProfil";
import DashboardMedecin from "./pages/DashboardMedecin";
import Planning from "./pages/Planning";
import DashboardAdmin from "./pages/DashboardAdmin";
import CalendrierRendezVous from "./pages/CalendrierRendezVous";
import GestionMedecins from "./pages/GestionMedecins";
import GestionPatients from "./pages/GestionPatients";
import GestionUtilisateurs from "./pages/GestionUtilisateurs";
import Notifications from "./pages/Notifications";
import APropos from "./pages/APropos";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />

        {/* Commun aux 3 rôles */}
        <Route path="/mon-profil" element={
          <ProtectedRoute rolesAutorises={["PATIENT", "MEDECIN", "ADMIN"]}>
            <MonProfil />
          </ProtectedRoute>
        } />

        {/* Espace patient */}
        <Route path="/medecins" element={
          <ProtectedRoute rolesAutorises={["PATIENT"]}>
            <ListeMedecins />
          </ProtectedRoute>
        } />
        <Route path="/medecins/:medecinId" element={
          <ProtectedRoute rolesAutorises={["PATIENT"]}>
            <ProfilMedecin />
          </ProtectedRoute>
        } />
        <Route path="/prendre-rendezvous/:medecinId" element={
          <ProtectedRoute rolesAutorises={["PATIENT"]}>
            <PrendreRendezVous />
          </ProtectedRoute>
        } />
        <Route path="/mes-rendezvous" element={
          <ProtectedRoute rolesAutorises={["PATIENT"]}>
            <MesRendezVous />
          </ProtectedRoute>
        } />

        {/* Espace médecin */}
        <Route path="/dashboard-medecin" element={
          <ProtectedRoute rolesAutorises={["MEDECIN"]}>
            <DashboardMedecin />
          </ProtectedRoute>
        } />
        <Route path="/planning" element={
          <ProtectedRoute rolesAutorises={["MEDECIN"]}>
            <Planning />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute rolesAutorises={["MEDECIN"]}>
            <Notifications />
          </ProtectedRoute>
        } />

        {/* Espace admin */}
        <Route path="/dashboard-admin" element={
          <ProtectedRoute rolesAutorises={["ADMIN"]}>
            <DashboardAdmin />
          </ProtectedRoute>
        } />
        <Route path="/calendrier-rdv" element={
          <ProtectedRoute rolesAutorises={["ADMIN"]}>
            <CalendrierRendezVous />
          </ProtectedRoute>
        } />
        <Route path="/gestion-medecins" element={
          <ProtectedRoute rolesAutorises={["ADMIN"]}>
            <GestionMedecins />
          </ProtectedRoute>
        } />
        <Route path="/gestion-patients" element={
          <ProtectedRoute rolesAutorises={["ADMIN"]}>
            <GestionPatients />
          </ProtectedRoute>
        } />
        <Route path="/gestion-utilisateurs" element={
          <ProtectedRoute rolesAutorises={["ADMIN"]}>
            <GestionUtilisateurs />
          </ProtectedRoute>
        } />
        <Route path="/a-propos" element={
          <ProtectedRoute rolesAutorises={["ADMIN"]}>
            <APropos />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;