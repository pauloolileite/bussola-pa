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
import Relatorios from './pages/Relatorios'
import MinhasReservas from './pages/MinhasReservas'
import { lerSessao } from './hooks/useAuth'
import AssistenteIA from './components/AssistenteIA'

// Tela inicial de cada perfil (para onde mandar quando o acesso é negado).
const HOME_POR_PERFIL = {
  admin: '/dashboard',
  guia: '/reservas',
  parceiro: '/validacao',
  cliente: '/passeios',
}

/**
 * Guard de rota. Checa, nesta ordem:
 *  1) Sessão válida (token existe E não expirou). Senão -> /login.
 *  2) Perfil autorizado para a rota (se 'perfis' for informado).
 *     Se não for autorizado, manda para a tela inicial do próprio perfil.
 */
function RotaProtegida({ children, perfis }) {
  const sessao = lerSessao()
  if (!sessao) return <Navigate to="/login" replace />

  if (perfis && !perfis.includes(sessao.perfil)) {
    return <Navigate to={HOME_POR_PERFIL[sessao.perfil] || '/login'} replace />
  }
  return children
}

export default function App() {
  const location = useLocation()
  const mostrarSidebar = location.pathname !== '/login'

  return (
    <div className="flex">
      {mostrarSidebar && <Sidebar />}
      {mostrarSidebar && <AssistenteIA />}
      <main
        className={mostrarSidebar ? 'flex-1 min-h-screen md:ml-56 pt-14 md:pt-0' : 'flex-1 min-h-screen'}
        style={{ background: '#f6faff' }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Só admin */}
          <Route path="/dashboard" element={<RotaProtegida perfis={['admin']}><Dashboard /></RotaProtegida>} />
          <Route path="/usuarios" element={<RotaProtegida perfis={['admin']}><Usuarios /></RotaProtegida>} />
          <Route path="/relatorios" element={<RotaProtegida perfis={['admin']}><Relatorios /></RotaProtegida>} />
          <Route path="/pontos-turisticos" element={<RotaProtegida perfis={['admin']}><PontosTuristicos /></RotaProtegida>} />

          {/* Admin e guia */}
          <Route path="/reservas" element={<RotaProtegida perfis={['admin', 'guia']}><Reservas /></RotaProtegida>} />
          <Route path="/ocorrencias" element={<RotaProtegida perfis={['admin', 'guia']}><Ocorrencias /></RotaProtegida>} />
          <Route path="/financeiro" element={<RotaProtegida perfis={['admin', 'guia']}><Financeiro /></RotaProtegida>} />

          {/* Cliente: suas próprias reservas (somente leitura) */}
          <Route path="/minhas-reservas" element={<RotaProtegida perfis={['cliente']}><MinhasReservas /></RotaProtegida>} />

          {/* Passeios: todos os perfis logados podem ver */}
          <Route path="/passeios" element={<RotaProtegida><Passeios /></RotaProtegida>} />

          {/* Só parceiro operacional (e admin para conferência) */}
          <Route path="/validacao" element={<RotaProtegida perfis={['admin', 'parceiro']}><Validacao /></RotaProtegida>} />

          {/* Qualquer outra rota: manda para a tela inicial do perfil (ou login). */}
          <Route path="*" element={<RedirecionarInicio />} />
        </Routes>
      </main>
    </div>
  )
}

// Redireciona para a tela certa conforme o perfil (ou login se não autenticado).
function RedirecionarInicio() {
  const sessao = lerSessao()
  if (!sessao) return <Navigate to="/login" replace />
  return <Navigate to={HOME_POR_PERFIL[sessao.perfil] || '/login'} replace />
}
