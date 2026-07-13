# 06 — SEO, Open Graph e Facebook

## Por que isso importa

O PopZun depende muito de compartilhamento em redes sociais.

Quando o link é colado no Facebook, WhatsApp ou X, a plataforma lê as tags do HTML.

Se as tags estiverem erradas, o card social fica feio ou puxa informação errada.

## Tags essenciais

Cada artigo precisa ter no `<head>`:

```html
<title>Título do artigo - PopZun</title>
<meta name="description" content="Resumo do artigo">
<link rel="canonical" href="https://popzun.com.br/artigos/slug/">

<meta property="og:title" content="Título do artigo - PopZun">
<meta property="og:description" content="Resumo do artigo">
<meta property="og:type" content="article">
<meta property="og:url" content="https://popzun.com.br/artigos/slug/">
<meta property="og:image" content="https://popzun.com.br/assets/img/posts/slug/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630 ou 675, conforme tamanho real da imagem">
<meta property="og:site_name" content="PopZun">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Título do artigo">
<meta name="twitter:description" content="Resumo do artigo">
<meta name="twitter:image" content="https://popzun.com.br/assets/img/posts/slug/og.jpg">
```

## Regra de description

Nunca usar slug como descrição.

Errado:

```html
<meta property="og:description" content="7-coisas-simples-que-fazem-a-internet-virar-um-tribunal-em-segundos">
```

Certo:

```html
<meta property="og:description" content="Na internet, qualquer detalhe pode virar debate, julgamento e discussão sem fim nos comentários.">
```

## Fallback ideal

Se campos separados existirem:

1. Open Graph Description
2. SEO Description
3. Resumo/subtítulo
4. Primeiro parágrafo limpo
5. Nunca slug

## Imagem Open Graph

A imagem social deve ser chamativa.

Tamanhos possíveis:

- thumb: 1200x675
- og: 1200x630 ou 1200x675

A meta `og:image:height` deve bater com o tamanho real da imagem gerada.

## Teste local

No local, o Facebook não consegue validar imagem se o site não estiver online.

Depois de subir:

- testar link no Facebook Sharing Debugger;
- conferir título;
- conferir descrição;
- conferir imagem;
- forçar nova raspagem se necessário.

