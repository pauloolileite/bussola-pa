cat > README.md << 'EOF'
# Bússola PA 🧭

Sistema web de gestão de passeios turísticos da cidade de Paulo Afonso, Bahia.

## Sobre o Projeto

Desenvolvido para a **Associação de Guias de Turismo de Paulo Afonso**, o Bússola PA digitaliza e organiza os processos de agendamento de passeios, gestão de reservas, controle financeiro e validação operacional.

## Tecnologias

**Backend**
- Python 3.13 + Django 6
- Django REST Framework
- JWT Authentication (simplejwt)
- PostgreSQL

**Frontend**
- React 19 + Vite
- Tailwind CSS
- Lucide React (ícones)
- React Query + Axios

## Funcionalidades

- ✅ Autenticação JWT com perfis (Admin, Guia, Parceiro Operacional, Cliente)
- ✅ CRUD de Passeios e Pontos Turísticos
- ✅ Gestão de Reservas com máquina de estados
- ✅ QR Code por reserva para validação na guarita
- ✅ Registro de Ocorrências com anexos
- ✅ Controle Financeiro por guia
- ✅ Dashboard administrativo
- ✅ Sidebar dinâmica por perfil de acesso

## Como Executar

**Backend**
```bash
cd backend
source venv/Scripts/activate  # Windows Git Bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Equipe

- Renan Lima Ferraz
- Paulo Victor Oliveira Leite da Silva
- Alexandre Azevêdo de Araújo Siqueira
- Jackson Matheus Lima Pereira
- Arthur Luiz Batista Vieira de Lima

---
Desenvolvido na disciplina de Projeto WEB — UniRios, Paulo Afonso/BA.
EOF