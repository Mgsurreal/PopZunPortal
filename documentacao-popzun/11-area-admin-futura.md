# 11 — Área ADM futura

## Ideia

Criar uma área interna para acessar documentação, guias, links úteis e talvez ferramentas do projeto.

Exemplo:

```txt
/admin/
  index.html
  docs/
  links/
  checklists/
```

Ou:

```txt
/popzun-interno/
```

## Importante

Como o site é estático, uma senha feita em JavaScript não é segurança real.

Ela serve apenas para:

- evitar entrada acidental;
- esconder visualmente a documentação;
- não deixar link exposto no rodapé público;
- facilitar acesso interno.

Mas se alguém souber o link ou olhar os arquivos públicos, pode encontrar.

## Opção simples agora

Criar uma pasta:

```txt
/docs-popzun/
```

Não linkar no menu nem no rodapé.

Acessar direto pelo endereço quando precisar.

## Opção com “senha visual” depois

Criar `/admin/index.html` com tela de senha simples.

Exemplo:

- campo senha;
- se senha correta, mostra links internos;
- se errada, não mostra.

Isso é bom para organização, mas não para guardar segredo de verdade.

## Opção mais segura no futuro

Se um dia precisar proteção real, usar camada externa de autenticação ou servidor/função.

Enquanto isso, regra:

**Não colocar dados sensíveis dentro da documentação pública.**

## O que pode ter na área interna

- documentação do projeto;
- checklist antes de subir;
- guia do Studio;
- links para ferramentas;
- prompts padrão;
- ideias de pauta;
- guia de monetização;
- guia de anúncios;
- guia de afiliados;
- calendário editorial.

## Link no footer

Se colocar link no footer, ele ficará público.

Melhor não colocar por enquanto.

Quando existir uma área ADM mais bem pensada, pode colocar um link discreto, por exemplo:

```txt
/admin/
```

Mas isso deve ficar para depois.

