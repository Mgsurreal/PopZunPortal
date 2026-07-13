# Prompt para Codex — Área interna simples do PopZun

Use este prompt futuramente, quando quiser criar uma área interna/documentação navegável.

```txt
Você vai adicionar uma área interna simples ao projeto PopZun.

Contexto:
O PopZun é um site estático em HTML/CSS/JS, hospedável em GitHub + Cloudflare Pages. Não usar PHP, banco de dados ou backend obrigatório.

Objetivo:
Criar uma área interna simples para acessar documentação, checklists, guias e links do projeto.

Criar pasta:
/admin/

Arquivos:
/admin/index.html
/admin/style.css
/admin/app.js
/admin/docs.html

Regras:
- Não alterar o layout público do PopZun.
- Não colocar link público no menu principal.
- Se criar link no footer, deixar comentado ou opcional.
- A área deve ter uma tela de senha simples em JavaScript apenas para evitar acesso acidental.
- Deixar claro no código/comentário que essa senha não é segurança real.
- Não armazenar senhas reais, tokens, chaves de API ou dados sensíveis.

Senha temporária:
popzun-admin

Tela inicial após senha:
- Documentação
- Checklist antes de subir
- Guia do PopZun Studio
- Guia de anúncios
- Guia de afiliados
- Guia editorial
- Prompts úteis

A área pode carregar arquivos Markdown ou exibir conteúdo em HTML simples.

Importante:
Como é site estático, esta área não deve ser usada para guardar informação confidencial. É apenas uma central interna de organização.

Não mexer em posts, categorias, artigos, assets/js/posts.js ou layout público.
```
