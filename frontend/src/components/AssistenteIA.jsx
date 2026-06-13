import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Compass, Loader2 } from 'lucide-react'
import api from '../api'

const COR_PRIMARIA = '#000441'
const COR_ACENTO = '#a53c00'


export default function AssistenteIA() {
  const [aberto, setAberto] = useState(false)
  const [mensagens, setMensagens] = useState([
    {
      role: 'assistant',
      content: 'Olá! 👋 Sou o **Bússola**, seu assistente de turismo em Paulo Afonso. Posso te ajudar a escolher o passeio ideal ou tirar dúvidas sobre o Catamarã. Como posso ajudar?'
    }
  ])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const fimRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (aberto) {
      fimRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [mensagens, aberto])

  async function enviarMensagem(textoOverride) {
    const texto = (textoOverride ?? input).trim()
    if (!texto || carregando) return

    const novasMensagens = [...mensagens, { role: 'user', content: texto }]
    setMensagens(novasMensagens)
    setInput('')
    setCarregando(true)

    try {
      const res = await api.post('/ia/chat/', {
        messages: novasMensagens.map(m => ({ role: m.role, content: m.content }))
      })
      const resposta = res.data?.resposta || 'Desculpe, não consegui processar sua pergunta. Tente novamente!'
      setMensagens(prev => [...prev, { role: 'assistant', content: resposta }])
    } catch (err) {
      const errMsg = err.response?.data?.error
      const msg = errMsg === 'Chave de API não configurada'
        ? '⚠️ A chave da API Groq não está configurada no servidor. Configure a variável de ambiente **GROQ_API_KEY** no backend.'
        : 'Ops! Tive um problema de conexão. Verifique se o servidor está rodando e tente novamente. 🔌'
      setMensagens(prev => [...prev, { role: 'assistant', content: msg }])
    } finally {
      setCarregando(false)
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    enviarMensagem()
  }

  function renderMensagem(msg, idx) {
    const isBot = msg.role === 'assistant'
    // Renderiza markdown simples (bold, quebras de linha)
    const html = msg.content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')

    return (
      <div key={idx} style={{
        display: 'flex',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        marginBottom: '10px',
        gap: '8px',
        alignItems: 'flex-end'
      }}>
        {isBot && (
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: COR_PRIMARIA, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Compass size={14} color="#7984e1" />
          </div>
        )}
        <div style={{
          maxWidth: '78%',
          padding: '10px 14px',
          borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
          background: isBot ? '#f0f2ff' : COR_ACENTO,
          color: isBot ? '#1a1a2e' : '#fff',
          fontSize: '13.5px',
          lineHeight: '1.5',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    )
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(v => !v)}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: aberto ? '#6b7280' : COR_ACENTO,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(165,60,0,0.4)',
          zIndex: 9999,
          transition: 'background 0.2s, transform 0.2s',
          transform: aberto ? 'rotate(0deg)' : 'rotate(0deg)',
        }}
        title="Assistente IA"
        aria-label="Abrir assistente de IA"
      >
        {aberto ? <X size={22} color="#fff" /> : <MessageCircle size={22} color="#fff" />}
      </button>

      {/* Janela do chat */}
      {aberto && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: 'min(360px, calc(100vw - 32px))',
          height: 'min(500px, calc(100vh - 120px))',
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0,4,65,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9998,
          border: '1px solid #e8eaf6',
          animation: 'slideUp 0.2s ease-out'
        }}>
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(16px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            .ia-input:focus { outline: none; }
            .ia-send-btn:hover:not(:disabled) { background: #8a3200 !important; }
          `}</style>

          {/* Cabeçalho */}
          <div style={{
            background: COR_PRIMARIA,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(121,132,225,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bot size={18} color="#7984e1" />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
                Bússola IA
              </p>
              <p style={{ color: '#7984e1', fontSize: '11px', margin: 0 }}>
                Assistente de Turismo · Paulo Afonso
              </p>
            </div>
          </div>

          {/* Área de mensagens */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            background: '#fafbff',
          }}>
            {mensagens.map(renderMensagem)}
            {carregando && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '10px' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: COR_PRIMARIA, display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <Compass size={14} color="#7984e1" />
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
                  background: '#f0f2ff', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <Loader2 size={14} color="#7984e1" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '13px', color: '#7984e1' }}>Digitando...</span>
                </div>
              </div>
            )}
            <div ref={fimRef} />
          </div>

          {/* Sugestões rápidas (só no início) */}
          {mensagens.length === 1 && (
            <div style={{ padding: '8px 12px', display: 'flex', gap: '6px', flexWrap: 'wrap', background: '#fafbff' }}>
              {[
                'Nunca fiz passeio, por onde começo?',
                'Horários do Catamarã',
                'Passeios de aventura',
              ].map(sugestao => (
                <button
                  key={sugestao}
                  disabled={carregando}
                  onClick={() => enviarMensagem(sugestao)}
                  style={{
                    background: '#f0f2ff', border: '1px solid #c5cae9',
                    borderRadius: '20px', padding: '5px 12px',
                    fontSize: '11.5px', color: COR_PRIMARIA,
                    cursor: 'pointer', transition: 'background 0.15s',
                    fontFamily: 'inherit'
                  }}
                >
                  {sugestao}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleFormSubmit} style={{
            padding: '12px',
            borderTop: '1px solid #e8eaf6',
            display: 'flex',
            gap: '8px',
            background: '#fff'
          }}>
            <input
              ref={inputRef}
              className="ia-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pergunte sobre passeios..."
              disabled={carregando}
              style={{
                flex: 1,
                border: '1.5px solid #e8eaf6',
                borderRadius: '12px',
                padding: '9px 14px',
                fontSize: '13.5px',
                background: '#fafbff',
                color: '#1a1a2e',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = '#7984e1'}
              onBlur={e => e.target.style.borderColor = '#e8eaf6'}
            />
            <button
              type="submit"
              className="ia-send-btn"
              disabled={!input.trim() || carregando}
              style={{
                width: 40, height: 40,
                borderRadius: '12px',
                background: input.trim() && !carregando ? COR_ACENTO : '#d1d5db',
                border: 'none',
                cursor: input.trim() && !carregando ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
                flexShrink: 0
              }}
            >
              <Send size={16} color="#fff" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
