# 03 — PopZun Studio

## O que é

O **PopZun Studio** é o publicador local do projeto.

Ele não é um CMS online tradicional. Ele roda no computador do editor e cria arquivos estáticos para o site.

Fluxo:

```txt
PopZun Studio local → gera arquivos → site estático pronto → GitHub/Cloudflare
```

## Por que existe

Para não precisar criar manualmente:

- pasta do artigo;
- imagem thumb;
- imagem Open Graph;
- imagens internas;
- HTML final;
- registro no posts.js;
- entrada no sitemap.

## O que o Studio deve fazer

1. Criar estrutura de artigo.
2. Gerar imagens.
3. Salvar rascunho.
4. Publicar HTML final.
5. Atualizar `posts.js`.
6. Atualizar `sitemap.xml`.
7. Verificar problemas no projeto.

## Etapas do Studio

### 1. Dados básicos

Campos esperados:

- Título
- Resumo/subtítulo
- Categoria
- Autor
- Data
- Tags
- Slug
- Status
- SEO Title
- SEO Description
- Open Graph Title
- Open Graph Description
- Alt da thumb

Campos SEO/OG podem ser opcionais. Se estiverem vazios, o Studio deve usar fallback automático.

### 2. Thumb/OG

O Studio recebe uma imagem base e gera:

```txt
thumb.jpg — imagem do card/artigo
og.jpg — imagem social para Facebook/WhatsApp
```

### 3. Imagens internas

Permite adicionar imagens dentro do artigo:

```txt
imagem-01.jpg
imagem-02.jpg
imagem-03.jpg
```

Cada imagem deve ter:

- ALT;
- legenda opcional.

### 4. Conteúdo

No primeiro momento, o conteúdo pode ser colado em HTML dentro de:

```html
<article class="article-content">
  ...conteúdo...
</article>
```

Futuro ideal: trocar esse campo por editor visual estilo Blogger/Word simplificado.

### 5. Publicar

Ao publicar:

- gera/atualiza HTML final;
- registra no posts.js;
- registra no sitemap;
- mantém dados no rascunho;
- mostra mensagem de sucesso.

## Problemas comuns

### Artigo existe, mas não aparece na home

Causa provável: não entrou no `posts.js`.

Checar:

```txt
assets/js/posts.js
```

Procurar pelo slug.

### Thumb aparece no artigo, mas não no card

Possíveis causas:

- caminho errado no posts.js;
- imagem salva em pasta diferente;
- cache do navegador;
- categoria diferente.

### Formulário reseta

O Studio precisa preservar estado em:

- memória JS;
- localStorage;
- rascunho JSON.

Botões devem usar `type="button"` quando não forem submit real.

