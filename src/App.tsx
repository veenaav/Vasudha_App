import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import HomePage from '@/pages/HomePage'
import Home from '@/pages/Home'
import ObservationsPage from '@/pages/ObservationsPage'
import ProjectsPage from '@/pages/ProjectsPage'
import MyProjects from '@/pages/MyProjects'
import WardsPage from '@/pages/WardsPage'
import SurveysPage from '@/pages/SurveysPage'
import SettingsPage from '@/pages/SettingsPage'
import AboutPage from '@/pages/AboutPage'
import FAQPage from '@/pages/FAQPage'
import OfflineSyncPage from '@/pages/OfflineSyncPage'
import PrivacyPage from '@/pages/PrivacyPage'

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* 1. Minimal & Attractive Home Screen */}
          <Route path="/" element={<HomePage />} />

          {/* 2. New Observation Recording Screen */}
          <Route path="/new-observation" element={<Home />} />

          {/* 3. Saved Observations List Screen */}
          <Route path="/observations" element={<ObservationsPage />} />

          {/* 4. Edit Observation Screen */}
          <Route path="/observations/:id/edit" element={<Home />} />
          <Route path="/edit-observation/:id" element={<Home />} />

          {/* Active Field Survey Observation screen (hierarchical session link) */}
          <Route
            path="/projects/:projectId/wards/:wardId/surveys/:surveyId/observations"
            element={<Home />}
          />

          {/* Projects & Surveys Workflows */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/projects/:projectId" element={<WardsPage />} />
          <Route path="/projects/:projectId/overview" element={<WardsPage />} />
          <Route path="/projects/:projectId/wards" element={<WardsPage />} />
          <Route path="/projects/:projectId/wards/:wardId/surveys" element={<SurveysPage />} />

          {/* Informational & Configuration Pages */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/offline-sync" element={<OfflineSyncPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Catch-all fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App