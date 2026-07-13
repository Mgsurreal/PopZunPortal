POPZUN PORTAL V6
=================

Base estática pronta para rodar localmente no VS Code e depois subir em GitHub + Cloudflare Pages.

COMO ABRIR LOCAL
1. Extraia o ZIP.
2. Abra a pasta popzun-portal-v6 no VS Code.
3. Use a extensão Live Server.
4. Abra o index.html pelo Live Server.

IMPORTANTE
- Não abra clicando direto no arquivo, porque o projeto usa caminhos começando com /assets/.
- No Live Server vai funcionar como no Cloudflare Pages.
- O domínio provisório nos metadados é https://popzun.com.br. Quando tiver domínio final, faça buscar/substituir.

ARQUIVOS PRINCIPAIS
- index.html: home.
- assets/js/posts.js: lista central dos posts que alimenta home/categorias/relacionados.
- artigos/NOME-DO-ARTIGO/index.html: página real de cada artigo.
- assets/img/posts/: imagens dos posts, em JPG, já melhores para Facebook do que SVG.
- _modelos/: modelos para novos artigos.

V6 TROUXE
- imagens JPG 1200x675 para cards e Facebook.
- og.png e favicon.
- meta tags OG/Twitter/canonical nas páginas.
- páginas Sobre, Contato, Privacidade e Termos.
- ads.txt provisório.
- modelos e guia de publicação.
