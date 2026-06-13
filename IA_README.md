# 🤖 Bússola IA — Assistente Virtual de Turismo

## O que foi implementado

Um **assistente de IA conversacional** integrado ao sistema Bússola PA, acessível via botão flutuante em todas as telas do sistema (exceto login).

---

## Funcionalidades

### 1. Recomendação para Iniciantes
Se o usuário nunca fez passeio ou não sabe por onde começar, o assistente sugere opções de menor risco (ecoturismo, catamarã), sempre com base nos passeios reais cadastrados no banco de dados.

### 2. Recomendação Personalizada
Se o usuário menciona preferências ("gosto de aventura", "já fiz trilha"), o assistente recomenda passeios similares do catálogo atual.

### 3. Horários do Catamarã
Informa os horários típicos de funcionamento do Catamarã de Paulo Afonso:
- **Fins de semana/feriados:** 08h, 10h, 14h e 16h
- **Dias úteis:** 10h e 14h
- Sempre orienta confirmar em (75) 3281-2000 por variação do nível do rio.

### 4. Respostas contextuais
Responde dúvidas gerais sobre turismo em Paulo Afonso, Cânion do São Francisco, Cachoeira de Paulo Afonso.

---

## Arquitetura

```
Frontend (React)                    Backend (Django)
─────────────────                   ────────────────
AssistenteIA.jsx                    ia/views.py
  ├── Busca passeios reais            ├── chat_ia() view
  │   via GET /api/passeios/          ├── build_system_prompt()
  ├── Chama API Claude                │    └── injeta passeios do DB
  │   (direto ou via backend)         └── ia/urls.py → /api/ia/chat/
  └── Renderiza chat flutuante
```

### Opção A — Frontend direto (implementado no componente)
O `AssistenteIA.jsx` chama a API da Anthropic diretamente no navegador.
> **Para usar:** Adicione sua chave no componente (apenas para desenvolvimento local).

### Opção B — Via backend Django (recomendado para produção)
O `ia/views.py` expõe o endpoint `POST /api/ia/chat/` que faz a chamada ao Claude no servidor.
> **Para usar:** Defina a variável de ambiente `ANTHROPIC_API_KEY` no servidor.

---

## Instalação

### Frontend
Nenhuma dependência nova — usa `fetch` nativo e ícones já existentes do `lucide-react`.

### Backend
Adicione ao `settings.py` (já feito):
```python
INSTALLED_APPS = [
    ...
    'ia',
]
```

Defina a variável de ambiente:
```bash
export ANTHROPIC_API_KEY=sua_chave_aqui
```

---

## Arquivos criados/modificados

| Arquivo | Ação |
|---------|------|
| `frontend/src/components/AssistenteIA.jsx` | **NOVO** — componente do chat |
| `frontend/src/App.jsx` | **EDITADO** — import + render do AssistenteIA |
| `backend/ia/__init__.py` | **NOVO** |
| `backend/ia/apps.py` | **NOVO** |
| `backend/ia/views.py` | **NOVO** — endpoint Django |
| `backend/ia/urls.py` | **NOVO** — roteamento |
| `backend/core/urls.py` | **EDITADO** — inclui `ia.urls` |
| `backend/core/settings.py` | **EDITADO** — inclui `ia` em INSTALLED_APPS |
