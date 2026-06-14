# Limpeza SOLID — dedup de libs + unificação do API client

Aplicado e validado com `npm run build` e `eslint` (0 problemas nos arquivos tocados).

## AÇÃO MANUAL OBRIGATÓRIA
Apague o arquivo morto (não dá pra "apagar" via zip):
```
rm frontend/src/utils/muiTheme.js
```
(os tokens de cor foram para `frontend/src/lib/theme.js`).

Depois:
```
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Dependências removidas (frontend/package.json)
- @mui/material, @mui/x-date-pickers, @emotion/react, @emotion/styled  → eram só para os date pickers
- dayjs            → usado só pelos pickers do MUI
- date-fns, react-datepicker → estavam no package.json mas NINGUÉM importava (mortas)

Resultado do `npm install`: de ~MUI+emotion para **212 pacotes**. Bundle JS caiu junto.

> `@tanstack/react-query` foi MANTIDO de propósito: está provido em main.jsx mas
> nenhum componente usa `useQuery`. Ou adota de verdade (recomendado) ou remove.
> Não apaguei para não descartar uma escolha sua sem avisar.

## Arquivos NOVOS
- src/lib/session.js        → fonte única dos tokens (antes o localStorage estava espalhado em 5 arquivos)
- src/lib/theme.js          → tokens de cor (substitui utils/muiTheme.js, sem `sx` do MUI)
- src/lib/reservaStatus.js  → mapas de status (eram duplicados em Reservas e Dashboard)
- src/services/auth.js      → login/registro/logout via client `api`

## Arquivos MODIFICADOS
- src/api.js          → baseURL via `import.meta.env.VITE_API_URL` (fallback dev); usa session; refresh sem URL hardcoded
- src/pages/Login.jsx → deixou de usar `axios` cru com URL hardcoded; usa o serviço de auth
- src/pages/Reservas.jsx → SEM MUI/dayjs (inputs nativos date/time); `FormReserva` movido pro escopo do módulo (antes remontava a cada render = perda de foco); `confirmarEditar` duplicada removida; typo `items-abrircenter` corrigido
- src/pages/Dashboard.jsx → usa STATUS_CORES central; removido ícone `Users` morto
- src/components/Sidebar.jsx → logout via session; removido `setState` dentro de `useEffect` (fecha o drawer no clique do link)
- src/App.jsx         → RotaProtegida via `isAuthenticated()`
- src/hooks/useAuth.js → decodifica token via session
- src/index.css       → `@import` de fontes antes do tailwind (corrige warning de build)

## NÃO incluído (depende do kit anterior)
Para o `VITE_API_URL` valer, defina no `frontend/.env`:
```
VITE_API_URL=http://127.0.0.1:8000/api
```
Sem isso, cai no fallback (mesmo valor), então continua funcionando em dev.
