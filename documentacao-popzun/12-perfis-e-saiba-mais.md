# 12 - Perfis e Saiba Mais

## Ideia

Artigos do PopZun continuam sendo conteúdos rápidos, diretos e com apelo viral.

Perfis são páginas permanentes de apoio. Eles explicam melhor quem é uma personalidade citada em uma matéria: artista, famoso, jogador, influenciador ou outro nome que apareça no noticiário pop.

## Diferença entre artigo e perfil

- artigo: assunto do momento, curto, direto e feito para gerar leitura rápida;
- perfil: contexto estável, reaproveitável e com cara de mini biografia;
- artigo pode ter thumb forte, chamada agressiva ou visual de notícia;
- perfil deve usar imagem neutra, limpa e sem texto de notícia.

Thumbs de notícia ficam nos artigos. Imagens limpas ficam nos perfis.

## Card Saiba Mais

Um artigo pode ter um card opcional apontando para um perfil relacionado:

```html
<div class="profile-card">
  <strong>Saiba mais</strong>
  <h3>Quem foi Bonnie Tyler?</h3>
  <p>Conheça a origem, trajetória, músicas marcantes e curiosidades sobre a cantora.</p>
  <a href="/perfis/bonnie-tyler/">Ver perfil completo</a>
</div>
```

Esse card fica dentro do artigo, não dentro da página de perfil.

## Página de perfil

A página de perfil pode usar o mesmo padrão visual dos artigos:

- conteúdo principal;
- sidebar lateral;
- anúncio 300x600;
- bloco de links internos, como Últimas no PopZun;
- anúncio 300x250.

No mobile, a sidebar desce abaixo do conteúdo, seguindo o comportamento dos artigos.

## Por que existe

Perfis ajudam o leitor que caiu em uma notícia e quer contexto rápido sem sair do PopZun.

Eles aumentam tempo no site, criam links internos e também podem monetizar com anúncios na lateral.

## Regra editorial

- perfil não precisa virar Wikipedia;
- usar texto curto, simples e fácil de ler;
- revisar dados sensíveis, idade, morte, carreira e vida pessoal;
- evitar tom de obituário quando o perfil for permanente;
- evitar imagem com texto de notícia, tarja ou chamada sensacionalista.

## Estado atual

O sistema ainda é simples e estático. Não existe banco de dados.

A primeira versão tem:

- `/perfis/`;
- `/perfis/bonnie-tyler/`;
- imagem em `/assets/img/perfis/bonnie-tyler/perfil.png`;
- modelo em `/_modelos/perfil-modelo.html`;
- campos opcionais no PopZun Studio para inserir card de perfil dentro de artigos futuros.

Depois, o sistema pode evoluir para lista automática de perfis, busca por personalidade e criação de perfis pelo Studio.