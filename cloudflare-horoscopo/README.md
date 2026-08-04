# Robô do horóscopo PopZun

Gera os 12 signos em uma única chamada diária ao Workers AI e guarda o resultado no KV. As visitas apenas leem o conteúdo pronto. Não usa a API da OpenAI.

## Publicação

1. Abra um terminal nesta pasta e execute `npm install`.
2. Entre na Cloudflare com `npx wrangler login`.
3. Crie o KV com `npx wrangler kv namespace create HOROSCOPO_DB`.
4. Copie o `id` devolvido para `wrangler.jsonc`, substituindo `COLE_AQUI_O_ID_DO_KV`.
5. Execute `npm run deploy`.
6. Enquanto o domínio ainda não for uma zona da conta Cloudflare, o site consulta diretamente `https://popzun-horoscopo.surreal-marcosrg.workers.dev/api/horoscopo`.

O Cron roda diariamente às 06:05 UTC (03:05 no horário de Brasília). Se ainda não houver conteúdo do dia, o primeiro acesso tenta gerar. Em caso de falha, o Worker entrega o último conteúdo válido ou uma reserva editorial segura.

## Teste

- Local: `npm run dev`
- Validação antes de publicar: `npm run check`
- Endpoint: `/api/horoscopo`

O modelo escolhido é o `@cf/meta/llama-3.1-8b-instruct-fast`, que aceita JSON estruturado e continua econômico dentro da franquia diária do Workers AI.
