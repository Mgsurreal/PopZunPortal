# 08 — Monetização

## Visão geral

O PopZun não deve depender só de banner.

Fontes de receita planejadas:

1. Anúncios display/native.
2. Links de afiliado.
3. Páginas de achadinhos.
4. Conteúdos por categoria com ofertas contextuais.
5. AdSense futuramente.

## Regra de experiência

Não usar formatos agressivos no início.

Evitar:

- popup;
- popunder;
- onclick;
- redirecionamento automático;
- interstitial agressivo;
- push forçado;
- anúncio adulto/nudez;
- falso botão de download.

## Formatos de anúncio recomendados

### Desktop

- banner lateral 300x600;
- banner lateral 300x250;
- anúncio no meio do artigo;
- bloco native no fim do artigo;
- banner inferior fechável com cuidado.

### Mobile

- banner depois dos primeiros parágrafos;
- banner/native no meio;
- native no final;
- evitar qualquer coisa que bloqueie leitura.

## Redes de anúncio possíveis

### Início

- Adsterra com banner/native controlado.
- Monetag apenas se for possível controlar formatos.

### Depois

- MGID para native ads.
- Media.net se for aprovado.
- Ezoic quando tiver tráfego/estrutura.
- AdSense quando o site tiver conteúdo suficiente e melhor reputação.

## Configuração desejada para Adsterra

Pedir/bloquear:

```txt
Site de entretenimento geral/familiar.
Bloquear anúncios adultos, nudez, conteúdo sexual explícito, apostas agressivas, malware, download enganoso, fake antivírus, conteúdo +18 e redirecionamentos automáticos.
Não usar popunder, onclick, popup, interstitial ou abertura automática de novas abas.
Permitir apenas banners, native banners e formatos não intrusivos.
```

## Afiliados

O PopZun pode monetizar por categoria.

### Culinária

- livro de receitas;
- air fryer;
- formas;
- liquidificador;
- panelas;
- utensílios.

### Casa

- organizadores;
- decoração;
- limpeza;
- iluminação;
- aspirador.

### Beleza/famosos

- escova secadora;
- maquiagem;
- perfume;
- skincare;
- acessórios.

### Pets

- brinquedos;
- cama;
- bebedouro;
- coleira;
- ração.

### Tecnologia simples

- fone;
- carregador;
- suporte;
- ring light;
- smartwatch.

### Nostalgia

- camisetas retrô;
- pôsteres;
- itens colecionáveis;
- livros;
- decoração.

### Futebol

- camisa;
- bola;
- chuteira;
- quadro;
- livro.

## Bloco de afiliado ideal

No futuro, o Studio deve gerar blocos assim:

```html
<div class="affiliate-box">
  <span>Achadinhos relacionados</span>
  <h3>Produtos que combinam com esse assunto</h3>
  <div class="affiliate-grid">
    <!-- produto -->
  </div>
</div>
```

## Páginas futuras

```txt
/achadinhos/
/achadinhos/cozinha/
/achadinhos/casa/
/achadinhos/beleza/
/achadinhos/pets/
```

