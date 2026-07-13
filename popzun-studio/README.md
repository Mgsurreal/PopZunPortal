# PopZun Studio

PopZun Studio e um CMS local para criar artigos no PopZun Portal V6 sem transformar o site em sistema dinamico. O site final continua 100% estatico: HTML, CSS e JavaScript puro.

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
