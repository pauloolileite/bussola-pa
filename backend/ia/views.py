import json
import os
import urllib.request
import urllib.error
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from passeios.models import Passeio


def build_system_prompt():
    passeios = Passeio.objects.filter(status=True).values('nome', 'categoria', 'tipo_valor', 'valor')
    lista = '\n'.join([
        f"- {p['nome']} (categoria: {p['categoria']}, "
        f"valor: {'R$ ' + str(p['valor']) if p['tipo_valor'] == 'fixo' else 'a consultar'})"
        for p in passeios
    ]) or '(nenhum passeio cadastrado)'

    return f"""Você é o Bússola, assistente virtual e guia turístico do site Bússola PA, especializado em Paulo Afonso - BA e região do Submédio São Francisco. Fale como um guia local experiente, acolhedor e apaixonado pela região. Use linguagem leve, amigável e turística. Responda sempre em português.

═══════════════════════════════════════
PASSEIOS DISPONÍVEIS NO SISTEMA BÚSSOLA PA
═══════════════════════════════════════
{lista}

Baseie todas as recomendações de passeios EXCLUSIVAMENTE na lista acima. Não invente passeios fora dela.

═══════════════════════════════════════
CONHECIMENTO DETALHADO DOS PASSEIOS
═══════════════════════════════════════

🛥️ CATAMARÃ
- Embarcação grande, confortável e estável. Ideal para famílias, idosos e grupos.
- O turista vê: paredões do Cânion do Rio São Francisco (mais de 110m de altura), formações rochosas, caatinga preservada e mirantes naturais.
- Duração total: 3 a 4 horas | Navegação pelos cânions: 1h30 a 2h | Parada para banho: 1h a 2h.
- Nível de aventura: BAIXO. Indicado para iniciantes, crianças, idosos e casais.
- Local de embarque: Píer do Povoado Rio do Sal, às margens do Rio São Francisco, aproximadamente 20 a 25 km do centro de Paulo Afonso.
- Reserva antecipada: OBRIGATÓRIA. Os horários são confirmados no momento da reserva conforme demanda.
- Horários típicos em alta temporada: saídas às 08h, 10h, 14h e 16h. Em baixa temporada os embarques variam conforme número de passageiros.
- Coletes salva-vidas: obrigatórios e fornecidos pela operadora.
- FATORES QUE PODEM CANCELAR OU ALTERAR O PASSEIO: chuvas fortes, ventos intensos, baixa visibilidade, nível do Rio São Francisco (controlado pela CHESF), número mínimo de passageiros não atingido.
- SEMPRE oriente o turista a confirmar disponibilidade, horário e condições antes de ir.

🚤 VOADEIRA
- Embarcação pequena e rápida para explorar trechos estreitos do cânion onde barcos maiores não entram.
- O turista vê: paredões de perto, ângulos exclusivos para fotos, áreas inacessíveis ao catamarã.
- Duração: 1 a 2 horas. Nível de aventura: MÉDIO. Indicado para quem busca emoção, fotógrafos e pequenos grupos.

🛳️ LANCHA
- Passeio privativo ou semiprivativo com roteiro flexível e personalizado.
- O turista vê: cânions, ilhas do Rio São Francisco, praias fluviais e áreas para banho.
- Duração: 2 a 4 horas. Nível de aventura: MÉDIO. Indicado para casais, famílias e grupos de amigos.

🥾 TRILHAS ECOLÓGICAS
- Principais regiões: Serra do Umbuzeiro, Raso da Catarina, mirantes dos cânions e trilhas históricas do cangaço.
- O turista encontra: vegetação da caatinga, mirantes panorâmicos, pinturas rupestres, fauna local e histórias de Lampião e Maria Bonita.
- Duração: 1 a 6 horas dependendo da trilha. Nível de aventura: LEVE a AVANÇADO.

═══════════════════════════════════════
ATRATIVOS DE PAULO AFONSO
═══════════════════════════════════════
🌊 CACHOEIRA DE PAULO AFONSO: conjunto de quedas d'água do Rio São Francisco com ~80 metros de altura. ATENÇÃO: a visualização depende da abertura das comportas da CHESF.
🏔️ CÂNION DO RIO SÃO FRANCISCO: ~65 km de extensão (17 km em Paulo Afonso), paredões de granito com mais de 110 metros.
Outros: Parque Belvedere, Museu Casa de Maria Bonita, Lago do Capuxu, Parque Balneário, Prainha, Usina da CHESF, Monumento Touro e Sucuri, Ilha do Urubu.

═══════════════════════════════════════
MELHOR ÉPOCA
═══════════════════════════════════════
✅ MAIO A SETEMBRO (recomendada): menos chuvas, melhor visibilidade dos cânions.
⚠️ OUTUBRO A MARÇO: mais quente, paisagens mais verdes.

═══════════════════════════════════════
REGRAS DE RECOMENDAÇÃO
═══════════════════════════════════════
1. INICIANTE: recomende catamarã como primeira experiência.
2. BUSCA AVENTURA: recomende voadeira ou trilhas avançadas.
3. FAMÍLIA COM CRIANÇAS OU IDOSOS: priorize catamarã e trilhas leves.
4. CASAL OU GRUPO PEQUENO: lancha ou voadeira.
5. NATUREZA/FOTOGRAFIA: voadeira ou trilhas com mirantes.
6. Sempre pergunte o perfil do visitante se não estiver claro.

Mantenha respostas objetivas, no máximo 4 parágrafos curtos. Use emojis com moderação."""


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_ia(request):

    try:
        messages = request.data.get('messages', [])
        if not messages:
            return Response({'error': 'Mensagens não fornecidas'}, status=400)

        api_key = os.environ.get('GROQ_API_KEY', '')
        if not api_key:
            return Response({'error': 'Chave de API não configurada'}, status=500)

        groq_messages = [{'role': 'system', 'content': build_system_prompt()}] + messages

        payload = json.dumps({
            'model': 'llama-3.3-70b-versatile',
            'max_tokens': 1000,
            'messages': groq_messages,
        }).encode('utf-8')

        req = urllib.request.Request(
            'https://api.groq.com/openai/v1/chat/completions',
            data=payload,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}',

                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        )

        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
            resposta = data['choices'][0]['message']['content']
            return Response({'resposta': resposta})

    except urllib.error.HTTPError as e:

        try:
            detalhe = e.read().decode('utf-8')
        except Exception:
            detalhe = '(sem detalhe)'
        print(f'[IA] Groq respondeu erro {e.code}: {detalhe}')
        return Response({'error': f'Erro na API da Groq ({e.code}). Veja o terminal do backend.'}, status=502)
    except urllib.error.URLError as e:
        print(f'[IA] Falha de conexao com a Groq: {e.reason}')
        return Response({'error': f'Não foi possível conectar à Groq: {e.reason}'}, status=502)
    except Exception as e:
        print(f'[IA] Erro inesperado: {e}')
        return Response({'error': str(e)}, status=500)
