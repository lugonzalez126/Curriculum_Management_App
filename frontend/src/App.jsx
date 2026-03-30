import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DiscoveryPage from './pages/DiscoveryPage'
import Dashboard from './pages/Dashboard'
import CurriculumBuilder from './pages/CurriculumBuilder'
import LessonEditor from './pages/LessonEditor'
import CurriculumOverview from './pages/CurriculumOverview'
import LessonViewer from './pages/LessonViewer'
import CreatorPage from './pages/CreatorPage'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<DiscoveryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/creators/:username" element={<CreatorPage />} />
        <Route path="/curricula/:id" element={<CurriculumOverview />} />
        <Route path="/curricula/:id/lessons/:lessonId" element={<LessonViewer />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/curricula/:id/edit" element={<ProtectedRoute><CurriculumBuilder /></ProtectedRoute>} />
        <Route path="/dashboard/lessons/:lessonId/edit" element={<ProtectedRoute><LessonEditor /></ProtectedRoute>} />
      </Routes>
    </>
  )
}