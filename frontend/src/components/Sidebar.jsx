import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Compass, CalendarCheck,
  AlertTriangle, DollarSign, BarChart2,
  ShieldCheck, LogOut, Menu, X
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

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

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { perfil, nome } = useAuth()
  const itens = MENUS[perfil] || MENUS.cliente
  const [aberta, setAberta] = useState(false)

  // Fecha sidebar ao trocar de página no mobile
  useEffect(() => { setAberta(false) }, [location.pathname])

  // Fecha sidebar ao clicar fora (mobile)
  useEffect(() => {
    function handleClick(e) {
      if (aberta && !e.target.closest('#sidebar') && !e.target.closest('#btn-menu')) {
        setAberta(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [aberta])

  function logout() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  const sidebarContent = (
    <aside
      id="sidebar"
      className="flex flex-col h-full"
      style={{ background: '#000441' }}
    >
      {/* Cabeçalho */}
      <div className="px-5 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <span className="block text-white font-bold text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Bússola PA
          </span>
          <span className="block text-xs mt-1 uppercase tracking-widest" style={{ color: '#7984e1' }}>
            {perfil}
          </span>
        </div>
        {/* Botão fechar no mobile */}
        <button
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setAberta(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Navegação */}
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

      {/* Rodapé */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white text-sm font-medium truncate">{nome}</p>
        <button
          onClick={logout}
          className="mt-2 w-full flex items-center justify-center gap-2 text-sm py-2 rounded border transition-all active:scale-95 cursor-pointer hover:opacity-80"
          style={{ color: '#bcc2ff', borderColor: '#323d97', background: 'transparent' }}
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Botão hamburguer — só aparece no mobile */}
      <button
        id="btn-menu"
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg"
        style={{ background: '#000441', color: '#fff' }}
        onClick={() => setAberta(v => !v)}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay escuro no mobile quando sidebar aberta */}
      {aberta && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setAberta(false)}
        />
      )}

      {/* Sidebar desktop — sempre visível */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-56">
        {sidebarContent}
      </div>

      {/* Sidebar mobile — desliza da esquerda */}
      <div
        className="lg:hidden fixed top-0 left-0 h-screen w-64 z-50 transition-transform duration-300 ease-in-out"
        style={{ transform: aberta ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {sidebarContent}
      </div>
    </>
  )
}
