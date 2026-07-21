# PopZun Studio

PopZun Studio e um CMS local para criar artigos no PopZun Portal V6 sem transformar o site em sistema dinamico. O site final continua 100% estatico: HTML, CSS e JavaScript puro.

## Central de Produção (MVP)

O dashboard agora possui uma Central de Produção local para organizar o trabalho editorial antes de abrir o artigo no publicador.

1. Cadastre um assunto ou tendência, sua fonte, categoria e contexto.
2. Avalie crescimento, aderência ao PopZun e potencial de busca.
3. O Studio calcula uma prioridade de 4 a 12 pontos.
4. Avance a pauta pelo fluxo: Tendências, Pautas aprovadas, Em produção e Aguardando revisão.
5. Em **Gerar rascunho**, o Studio prepara título, resumo, slug, tags e um roteiro HTML no editor existente.
6. Revise e apure o conteúdo. O MVP nunca publica automaticamente.

As pautas ficam no armazenamento local do navegador. A integração futura com fontes externas e modelos de IA deve alimentar este mesmo quadro, preservando a aprovação humana.

### Filtro viral popular

Cada pauta recebe uma força de 0 a 100 e uma classificação: **Descartar**, **Informativa**, **Promissora** ou **Viral**. A pontuação combina crescimento, aderência, busca, apelo popular e quantidade de plataformas nas quais o assunto apareceu.

O editor pode registrar sinais de Google, Facebook, TikTok, YouTube, Instagram, X, Reddit e portais de notícias. Pautas sobre política, saúde, mortes, crimes, acusações ou vida íntima recebem aviso de apuração obrigatória e não avançam como rumor.

A linha editorial completa está em `documentacao-popzun/14-linha-editorial-popular.md`.

### Robôs locais

Use `INICIAR-POPZUN-STUDIO.cmd` na raiz do projeto. Ele inicia um servidor restrito a `127.0.0.1`, abre a Home e habilita o botão **Buscar tendências reais**.

- **Caçador de Pautas:** consulta o feed público do Google Trends Brasil.
- **Radar Popular:** consulta também pesquisas editoriais recentes em notícias sobre famosos, novelas, política, futebol, cinema, música, receitas, saúde, ciência, viagem e assuntos estranhos.
- **Analista Editorial:** remove duplicidades e calcula prioridade.
- **Redator:** converte a pauta aprovada em roteiro editorial no Studio.

Os robôs não publicam sozinhos. A análise de aderência e a apuração dos fatos continuam exigindo revisão humana.

Sem APIs de redes sociais, Facebook, TikTok, Instagram, YouTube, X e Reddit funcionam como sinais registrados pelo editor. Não confunda ausência de integração automática com ausência de relevância: quando o editor percebe um assunto nessas plataformas, deve marcá-las na ficha para aumentar a força viral.

## Como abrir

Abra `popzun-studio/index.html` no Chrome ou Edge. O Studio usa a File System Access API, entao precisa rodar em navegador compativel e com permissao para selecionar pastas locais.

## Como selecionar o projeto

1. Clique em **Selecionar/Trocar Projeto**.
2. Escolha a pasta raiz do PopZun, onde ficam `index.html`, `assets/js/posts.js`, `artigos/` e `sitemap.xml`.
3. O dashboard carrega os posts atuais e as configuracoes.

## Como criar artigo

1. Clique em **Novo artigo**.
2. Preencha os dados basicos, incluindo categoria, data, autor, tags, emoji e flags.
3. Clique em **Criar estrutura** para gerar:
   - `artigos/slug/index.html`;
   - `assets/img/posts/slug/`;
   - `popzun-studio/drafts/slug.json`.
4. Na etapa de imagem, envie a imagem principal e gere `thumb.jpg` e `og.jpg`.
   - Ao gerar a thumb, o Studio tambem registra ou atualiza o card no `assets/js/posts.js`.
   - Se precisar, use **Registrar/atualizar card no posts.js** para forcar esse registro sem abrir o verificador.
5. Adicione imagens internas, se houver. O Studio salva como `imagem-01.jpg`, `imagem-02.jpg` e gera o HTML de `figure`.
6. Cole ou escreva o HTML do artigo.
7. Publique para atualizar o artigo final, `assets/js/posts.js` e `sitemap.xml`.

Os campos ficam salvos automaticamente no navegador enquanto voce edita. Depois que a estrutura e criada, o rascunho tambem fica em `popzun-studio/drafts/slug.json`.

## Rascunhos

Use o botao **Rascunhos** para listar arquivos salvos em `popzun-studio/drafts/`.

Cada rascunho permite:

- continuar edicao;
- publicar;
- excluir o arquivo de rascunho.

Se a pagina recarregar, selecione o projeto novamente e abra o rascunho para continuar.

Em navegadores compativeis, o Studio tenta lembrar a pasta selecionada e restaurar o projeto automaticamente. O navegador ainda pode pedir permissao de leitura/escrita de novo por seguranca.

## Configuracao

Use os campos **URL do site** e **Autor padrao** no dashboard. O Studio salva em `popzun-studio/config.json` dentro do projeto selecionado.

Essa configuracao serve para montar canonical, Open Graph e sitemap com a URL correta, alem de preencher automaticamente o autor dos novos artigos.

## Abrir artigo existente

O botao **Abrir artigo existente** lista os posts do `posts.js`, carrega os metadados e tenta extrair o conteudo do HTML atual para edicao simples.

Nessa mesma tela tambem existe **Excluir post**. Ele remove o item do `assets/js/posts.js` e do `sitemap.xml`. O Studio pergunta se voce tambem quer apagar a pasta do artigo e a pasta de imagens.

Na etapa **Publicar**, o botao **Excluir post atual** faz a mesma operacao para o artigo carregado no editor.

## Verificar projeto

O verificador procura:

- post em `posts.js` sem `artigos/slug/index.html`;
- artigo HTML sem item no `posts.js`;
- post sem imagem ou com imagem inexistente;
- slug duplicado;
- artigo sem title, meta description ou og:image;
- sitemap sem artigo;
- categoria desconhecida.

Quando encontrar um artigo HTML sem item em `posts.js`, o Studio mostra o botao **Registrar este artigo no posts.js**. Ele tenta usar o rascunho correspondente ou extrair metadados basicos do HTML.

O verificador abre sem apagar o artigo atual do editor. Use **Voltar ao artigo atual** para retornar ao passo 1 quando estiver em outra area.

## Antes de subir

Depois de publicar, confira o artigo no navegador, valide a imagem principal, rode **Verificar projeto** e revise os arquivos alterados antes de enviar ao GitHub/Cloudflare Pages.
## Pré-publicação inteligente

Na etapa Publicar, use o botão **Checar pré-publicação** antes do clique final.

Ele verifica se o artigo tem título, resumo, slug, categoria, data, autor, thumb, imagem OG, conteúdo HTML, tags e perfil relacionado quando preenchido. Também avisa quando o resumo parece um slug, quando a URL ainda está local e quando o slug já existe no `posts.js`.

A checagem não publica nada sozinha. Ela só mostra pendências para o editor revisar e corrigir antes de publicar.
