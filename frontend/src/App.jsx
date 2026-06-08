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
import NovaReserva from './pages/NovaReserva'

function RotaProtegida({ children }) {
  const token = localStorage.getItem('access')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  const location = useLocation()
  const mostrarSidebar = location.pathname !== '/login'

  return (
    <div style={{ display: 'flex' }}>
      {mostrarSidebar && <Sidebar />}
      <main style={{ marginLeft: mostrarSidebar ? '220px' : '0', flex: 1, minHeight: '100vh', background: '#f6faff' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<RotaProtegida><Dashboard /></RotaProtegida>} />
          <Route path="/passeios" element={<RotaProtegida><Passeios /></RotaProtegida>} />
          <Route path="/reservas" element={<RotaProtegida><Reservas /></RotaProtegida>} />
          <Route path="/ocorrencias" element={<RotaProtegida><Ocorrencias /></RotaProtegida>} />
          <Route path="/financeiro" element={<RotaProtegida><Financeiro /></RotaProtegida>} />
          <Route path="/usuarios" element={<RotaProtegida><Usuarios /></RotaProtegida>} />
          <Route path="/validacao" element={<RotaProtegida><Validacao /></RotaProtegida>} />
          <Route path="/reservas/nova" element={<RotaProtegida><NovaReserva /></RotaProtegida>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
          
        </Routes>
      </main>
    </div>
  )
}