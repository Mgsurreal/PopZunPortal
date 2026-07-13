# 02 — Estrutura do site

## Tipo de projeto

O PopZun é um site estático.

Tecnologias:

- HTML
- CSS
- JavaScript puro
- Sem PHP
- Sem banco de dados
- Sem WordPress
- Sem backend online obrigatório

Hospedagem planejada:

- GitHub
- Cloudflare Pages

## Estrutura base esperada

```txt
/popzun/
  index.html
  recentes/
  categorias/
  artigos/
  assets/
    css/
    js/
    img/
      posts/
  popzun-studio/
  sitemap.xml
  robots.txt
  ads.txt
```

A estrutura real pode variar um pouco conforme o Codex evoluir o projeto, mas a lógica é esta.

## Home

A home mostra conteúdo direto:

- cards de artigos;
- posts em alta;
- posts recentes;
- categorias;
- anúncios laterais;
- banner inferior fechável.

## Categorias principais

Categorias atuais:

- Em Alta
- Famosos
- TV e Reality
- Internet
- Futebol
- Curiosidades
- Polêmicas
- Nostalgia
- ZunZun

Categorias futuras possíveis:

- Culinária
- Casa
- Beleza
- Pets
- Achadinhos
- Receitas
- Tecnologia simples

## Artigos

Cada artigo deve ser uma página HTML real. Isso é importante para:

- Facebook puxar imagem/título;
- Google indexar;
- anúncios funcionarem;
- compartilhamento ficar bonito;
- site continuar estático.

Estrutura ideal de um artigo:

```txt
/artigos/slug-do-artigo/index.html
/assets/img/posts/slug-do-artigo/thumb.jpg
/assets/img/posts/slug-do-artigo/og.jpg
/assets/img/posts/slug-do-artigo/imagem-01.jpg
```

## Arquivo de posts

O arquivo `assets/js/posts.js` alimenta:

- home;
- recentes;
- categorias;
- busca;
- relacionados.

Quando um artigo novo é publicado pelo Studio, ele precisa entrar no `posts.js`.

Se o artigo existe em HTML, mas não está no `posts.js`, ele não aparece nos cards.

