# Como publicar um novo artigo no PopZun

## 1. Criar o slug
Exemplo de título:

`10 detalhes em fotos antigas que fizeram todo mundo olhar duas vezes`

Slug:

`detalhes-fotos-antigas`

## 2. Criar a imagem
Coloque a imagem em:

`/assets/img/posts/detalhes-fotos-antigas.jpg`

Tamanho ideal:

`1200 x 675 px`

Esse tamanho funciona bem para card do site e compartilhamento no Facebook.

## 3. Criar a página do artigo
Crie a pasta:

`/artigos/detalhes-fotos-antigas/`

Copie um artigo existente ou use `_modelos/artigo-modelo.html` como referência.

O arquivo final deve ficar assim:

`/artigos/detalhes-fotos-antigas/index.html`

Troque:
- title;
- description;
- canonical;
- og:title;
- og:description;
- og:url;
- og:image;
- data-slug no body;
- título do artigo;
- categoria;
- data;
- imagem principal;
- texto.

## 4. Cadastrar no posts.js
Abra:

`/assets/js/posts.js`

Adicione um novo objeto no começo da lista:

```js
{
  "slug": "detalhes-fotos-antigas",
  "title": "10 detalhes em fotos antigas que fizeram todo mundo olhar duas vezes",
  "desc": "Algumas imagens parecem comuns, até alguém reparar no detalhe certo.",
  "category": "Curiosidades",
  "date": "09/07/2026",
  "emoji": "👀",
  "trending": true,
  "recent": true,
  "tags": ["fotos", "curiosidades", "internet"],
  "image": "/assets/img/posts/detalhes-fotos-antigas.jpg",
  "reactions": [2, "-", 4, 1]
}
```

## 5. Testar local
Abra no Live Server:

`/artigos/detalhes-fotos-antigas/`

Depois confira se apareceu na home, categoria e relacionados.

## Regra de ouro
O card só aparece no site se estiver no `posts.js`.  
A página só existe se tiver o `index.html` dentro da pasta do artigo.
