# Horóscopo automático do PopZun

## Estado atual

A página `/horoscopo/` e sua interface já existem. O Worker está implementado em `cloudflare-horoscopo/` e entrega `GET /api/horoscopo`. Falta somente criar o KV na conta da Cloudflare, inserir seu ID em `wrangler.jsonc`, publicar e associar a rota ao domínio.

## Fluxo previsto

1. Um Cron Trigger executa uma vez por dia.
2. Uma rotação determinística escolhe temas editoriais diferentes para os signos.
3. Workers AI redige os 12 signos em uma única solicitação econômica.
5. O resultado completo do dia é salvo como um único objeto no KV.
6. `GET /api/horoscopo` devolve o objeto já pronto, sem gerar texto durante a visita.
7. Se a geração falhar, a última previsão válida permanece disponível; no primeiro dia, há uma reserva editorial embutida.

## Contrato do endpoint

```json
{
  "data": "2026-08-03",
  "geradoEm": "2026-08-03T08:00:00Z",
  "signos": {
    "aries": {
      "geral": "Texto geral do dia.",
      "amor": "Texto curto sobre relações.",
      "trabalho": "Texto curto sobre trabalho e organização.",
      "bemEstar": "Texto curto sobre bem-estar.",
      "conselho": "Conselho leve do dia.",
      "cor": "azul",
      "numero": "7",
      "periodo": "tarde"
    }
  }
}
```

As chaves dos signos são: `aries`, `touro`, `gemeos`, `cancer`, `leao`, `virgem`, `libra`, `escorpiao`, `sagitario`, `capricornio`, `aquario` e `peixes`.

## Regras editoriais

- Conteúdo leve, variado, predominantemente otimista e apresentado como entretenimento.
- Não prometer dinheiro, emprego, cura, gravidez, relacionamento ou acontecimento futuro.
- Não prever morte, acidente, doença, traição ou desastre.
- Não substituir aconselhamento médico, financeiro, jurídico ou profissional.
- Não alegar que o texto é uma leitura científica ou uma previsão factual dos astros.
- Gerar os 12 signos em lote para economizar a franquia gratuita.

## Consumo controlado

- Modelo pequeno: `@cf/meta/llama-3.2-3b-instruct`.
- Uma chamada por dia, nunca uma chamada por visitante ou por signo.
- Um único objeto diário no KV, com expiração em 48 horas.
- Cópia do último resultado válido sem expiração para contingência.
- Nenhuma imagem é gerada pela automação.
- Nenhuma API ou chave da OpenAI é usada.
