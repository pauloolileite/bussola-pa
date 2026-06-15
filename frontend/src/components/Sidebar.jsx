import { useState } from 'react'
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
    { path: '/minhas-reservas', label: 'Minhas Reservas', icone: CalendarCheck },
  ],
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { perfil, nome } = useAuth()
  const itens = MENUS[perfil] || MENUS.cliente
  const [aberto, setAberto] = useState(false)

  function logout() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  // O conteúdo do menu é o mesmo no desktop e no mobile (DRY).
  const conteudo = (
    <>
      <div className="px-5 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <span className="block text-white font-bold text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Bússola PA
          </span>
          <span className="block text-xs mt-1 uppercase tracking-widest" style={{ color: '#7984e1' }}>
            {perfil}
          </span>
        </div>
        {/* Botão de fechar — só aparece no mobile */}
        <button onClick={() => setAberto(false)}
          className="md:hidden text-white/70 hover:text-white cursor-pointer" aria-label="Fechar menu">
          <X size={22} />
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {itens.map(({ path, label, icone: Icone }) => {
          const ativo = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setAberto(false)}
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
          className="mt-2 w-full flex items-center justify-center gap-2 text-sm py-2 rounded border transition-all active:scale-95 cursor-pointer hover:opacity-80"
          style={{ color: '#bcc2ff', borderColor: '#323d97', background: 'transparent' }}
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Barra superior — só no mobile. Tem o botão hambúrguer. */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center px-4 gap-3"
        style={{ background: '#000441' }}>
        <button onClick={() => setAberto(true)} className="text-white cursor-pointer" aria-label="Abrir menu">
          <Menu size={24} />
        </button>
        <span className="text-white font-bold text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Bússola PA
        </span>
      </header>

      {/* Menu fixo — só no desktop (md pra cima) */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-56 flex-col z-30"
        style={{ background: '#000441' }}>
        {conteudo}
      </aside>

      {/* Menu deslizante — só no mobile, quando aberto */}
      {aberto && (
        <>
          {/* Fundo escuro: clicar fecha */}
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setAberto(false)} />
          <aside className="md:hidden fixed top-0 left-0 h-screen w-64 flex flex-col z-50"
            style={{ background: '#000441' }}>
            {conteudo}
          </aside>
        </>
      )}
    </>
  )
}
