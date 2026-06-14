import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Passeios from './pages/Passeios'
import Reservas from './pages/Reservas'
import Dashboard from './pages/Dashboard'
import Ocorrencias from './pages/Ocorrencias'
import Financeiro from './pages/Financeiro'
import Usuarios from './pages/Usuarios'
import Validacao from './pages/Validacao'
import Sidebar from './components/Sidebar'
import PontosTuristicos from './pages/PontosTuristicos'
import AssistenteIA from './components/AssistenteIA'
<<<<<<< HEAD
import { isAuthenticated } from './lib/session'

function RotaProtegida({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />
=======

function RotaProtegida({ children }) {
  const token = localStorage.getItem('access')
  return token ? children : <Navigate to="/login" />
>>>>>>> 56f09569d6ed5c14d91c4d1c3a27b94043c9c2b0
}

export default function App() {
  const location = useLocation()
  const mostrarSidebar = location.pathname !== '/login'

  return (
    <div style={{ display: 'flex' }}>
      {mostrarSidebar && <Sidebar />}
      {mostrarSidebar && <AssistenteIA />}
      <main
        className={mostrarSidebar ? 'lg:ml-56 pt-16 lg:pt-0' : ''}
        style={{ flex: 1, minHeight: '100vh', background: '#f6faff' }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<RotaProtegida><Dashboard /></RotaProtegida>} />
          <Route path="/passeios" element={<RotaProtegida><Passeios /></RotaProtegida>} />
          <Route path="/reservas" element={<RotaProtegida><Reservas /></RotaProtegida>} />
          <Route path="/ocorrencias" element={<RotaProtegida><Ocorrencias /></RotaProtegida>} />
          <Route path="/financeiro" element={<RotaProtegida><Financeiro /></RotaProtegida>} />
          <Route path="/usuarios" element={<RotaProtegida><Usuarios /></RotaProtegida>} />
          <Route path="/validacao" element={<RotaProtegida><Validacao /></RotaProtegida>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
          <Route path="/pontos-turisticos" element={<RotaProtegida><PontosTuristicos /></RotaProtegida>} />
        </Routes>
      </main>
    </div>
  )
}
