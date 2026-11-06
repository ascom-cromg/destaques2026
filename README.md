# Destaques CRO-MG 2026 — Além dos Desafios

Apresentação final da dinâmica de histórias de superação, com fontes ampliadas, logo fornecido e textos aprovados. Relatos podem tratar de obstáculos pessoais ou profissionais, sem relação obrigatória com o trabalho. Prazo: 30/11/2026 às 23h59 em Brasília.

## Estado da publicação

A página do GitHub apresenta a dinâmica. **A coleta real ainda não está ativada.** Sem URL institucional em `config.js`, o botão informa que o envio ainda não foi aberto e não coleta dados. Não há relatos fictícios ou simulação de recebimento no fluxo publicado.

## GitHub Pages

Em Settings → Pages, selecione GitHub Actions como origem. O workflow testa, gera e publica `dist/`. É necessário que um administrador habilite Pages caso a instalação GitHub não tenha essa permissão. Build: `node build.mjs`. Validação: `node tests/backend.test.cjs` (27 grupos com pessoas sintéticas).

## Ativar o formulário real

1. Na conta institucional @cromg.org.br, atualize os arquivos da pasta `apps-script` no projeto Google Apps Script. Ative o serviço avançado Google Sheets API.
2. Nas propriedades do script, defina `PREMIACAO_SPREADSHEET_ID` com o ID da planilha **Respostas Destaques do Ano CROMG 2026**. Não coloque o ID nem dados privados no repositório. O cadastro inicial é vazio; dados de colaboradores devem existir somente na planilha restrita.
3. Execute `prepararPremiacao`. Revise a aba Configuração 2026 e restrinja planilha e script aos organizadores. Marque `HISTORIAS_PRIVACIDADE_REVISADA=SIM`; mantenha `HISTORIAS_STATUS=ABERTO`.
4. Implante como aplicativo Web executado pelo proprietário institucional e com acesso ao domínio. Teste uma conta @cromg.org.br e outra externa. A validação do domínio também ocorre no servidor.
5. Cole a URL `https://script.google.com/macros/s/…/exec` em `config.js`, no campo `appsScriptUrl`, e faça commit. O botão da página abre o formulário institucional. GitHub Pages sozinho não autentica contas nem grava planilhas. `google.script.run` funciona apenas dentro do aplicativo Web Apps Script, por isso a transição para o Google é necessária.

## Privacidade e resultados

- Histórias: e-mail autenticado na coluna G da aba Histórias 2026, restrito à organização. Novo relato entra como PENDENTE. Revise a coluna de publicação e altere o status para PUBLICADA. A galeria retorna somente código, título e texto revisado; não divulga e-mail, relato original ou chave de autoria.
- Votação futura: Controle 2026 guarda e-mail de quem participou, separado dos totais de Apuração 2026. Não são armazenadas cédulas, escolhas por participante, horários ou IPs. Uma conta vota uma única vez; envio de história é independente.
- A interface atual mostra somente a etapa de histórias. Não há abertura automática da votação de dezembro. Os fluxos futuros permanecem no código.
- O anonimato se refere à divulgação das histórias e às escolhas da votação. A autoria é identificada internamente, como informado no aviso de privacidade e na revisão antes do envio. O contexto do relato pode permitir reconhecimento; revisar com cuidado.
- Controles são gravados em lotes atômicos sob lock. Preserve a chave HMAC gerada nas propriedades. Não altere nem apague a chave após iniciar a coleta. Registros técnicos da plataforma Google podem existir.

Nenhum cadastro real, resposta, voto, token ou senha é incluído neste repositório. A configuração do Google e a verificação de ponta a ponta são obrigatórias antes de divulgar o link de participação real.



## Mural público

`mural.html` apresenta um mosaico com busca e leitura em tela cheia (fechar por Escape, navegação por botões ou setas e retorno de foco). O mural lê `data/historias-publicadas.json`, sem acessar a planilha restrita ou exigir login. A página inicial inclui um atalho para o mural.

A publicação no mural é **manual e separada da coleta no Google**. Aprovar uma linha na planilha não atualiza automaticamente o GitHub. Para publicar, copie exclusivamente código (A), título (B) e relato revisado (D) das linhas com status PUBLICADA (E), após revisão de identificação pessoal, e atualize o JSON no formato `{"items":[{"id":"H-XXXXXXXXXXXX","title":"Título","body":"Texto revisado","status":"PUBLICADA"}]}`. Faça commit; o GitHub Pages republica o mural. Nunca copie a planilha inteira, o relato original, o e-mail ou as chaves de autoria. Para retirar uma história, remova o item do JSON e publique novamente.

Na criação do mural, a planilha continha somente um teste técnico PENDENTE: ele não foi incluído. O mural começa vazio, sem histórias fictícias. O arquivo publicado deve conter somente dados explicitamente revisados; o filtro da interface também descarta itens sem status PUBLICADA e campos extras.
