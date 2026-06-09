import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Compass, CalendarCheck,
  MapPin, AlertTriangle, DollarSign, BarChart2,
  ShieldCheck, LogOut
} from 'lucide-react'

const MENUS = {
  admin: [
    { path: '/dashboard', label: 'Dashboard', icone: LayoutDashboard },
    { path: '/usuarios', label: 'Usuários', icone: Users },
    { path: '/passeios', label: 'Passeios', icone: Compass },
    { path: '/reservas', label: 'Reservas', icone: CalendarCheck },
    { path: '/ocorrencias', label: 'Ocorrências', icone: AlertTriangle },
    { path: '/financeiro', label: 'Financeiro', icone: DollarSign },
    { path: '/relatorios', label: 'Relatórios', icone: BarChart2 },
  ],
  guia: [
    { path: '/reservas', label: 'Minhas Reservas', icone: CalendarCheck },
    { path: '/ocorrencias', label: 'Registrar Ocorrência', icone: AlertTriangle },
    { path: '/financeiro', label: 'Meu Financeiro', icone: DollarSign },
  ],
  parceiro: [
    { path: '/validacao', label: 'Validação de Passeio', icone: ShieldCheck },
  ],
  cliente: [
    { path: '/passeios', label: 'Passeios', icone: Compass },
    { path: '/reservas', label: 'Minhas Reservas', icone: CalendarCheck },
  ],
}

function getPerfil() {
  try {
    const token = localStorage.getItem('access')
    if (!token) return 'cliente'
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.perfil || 'cliente'
  } catch { return 'cliente' }
}

function getNome() {
  try {
    const token = localStorage.getItem('access')
    if (!token) return ''
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.nome || ''
  } catch { return '' }
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const perfil = getPerfil()
  const nome = getNome()
  const itens = MENUS[perfil] || MENUS.cliente

  function logout() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 flex flex-col" style={{ background: '#000441' }}>
      <div className="px-5 py-6 border-b border-white/10">
        <span className="block text-white font-bold text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Bússola PA
        </span>
        <span className="block text-xs mt-1 uppercase tracking-widest" style={{ color: '#7984e1' }}>
          {perfil}
        </span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {itens.map(({ path, label, icone: Icone }) => {
          const ativo = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 px-5 py-3 text-sm transition-colors"
              style={{
                color: ativo ? '#fff' : '#bcc2ff',
                background: ativo ? '#a53c00' : 'transparent',
                fontWeight: ativo ? '600' : '400',
              }}
            >
              <Icone size={16} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white text-sm font-medium truncate">{nome}</p>
        <button
          onClick={logout}
          className="mt-2 w-full flex items-center justify-center gap-2 text-sm py-2 rounded border transition-colors"
          style={{ color: '#bcc2ff', borderColor: '#323d97', background: 'transparent' }}
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  )
}