# Integra Saúde — LP Dr. Denner

**Cliente:** Integra Saúde · Dr. Denner Soares Lima (Ortopedia e Traumatologia, Cirurgia da Mão)
**Cidade:** Teresina/PI (Av. Universitária, 750, Bairro de Fátima)
**Objetivo:** levar ao WhatsApp (86) 99959-6512 com mensagem pré-preenchida

## Stack

HTML e CSS puros, animações com GSAP + ScrollTrigger locais em `assets/js/`, fontes locais em `assets/fonts/`.
Sem framework, sem bundler, sem build. O export já veio sem o runtime do Claude Design (sem `support.js` nem React).

```
index.html            página
assets/css/style.css  estilos
assets/js/            main.js, gsap.min.js, ScrollTrigger.min.js
assets/fonts/         Sora e Geist (woff2)
assets/img/           fotos, logo e og.jpg (1200×630)
favicon.*, apple-touch-icon.png
vercel.json           clean URLs + cache de assets
```

## Deploy — Vercel

Import do repo · Framework Preset **Other** · Root Directory na raiz ·
sem Build/Install Command, sem Output Directory.

## Edições sobre o exportado

- Origem: `integra-saude-lps.zip`, pasta `lp-denner/` (projeto "Denner-verde-agua" no Claude Design). O zip juntava as duas LPs em um repo; aqui cada LP é um repo, conforme o padrão AK.
- `<head>`: adicionados `canonical`, `og:url`, `og:image` absoluta com dimensões, `twitter:title`, `twitter:description` e `twitter:image`.
- Adicionados `vercel.json`, `.gitignore` e este README.
- Layout, copy, CSS e JS sem alteração.

## Pendências

- **Registro CRM da clínica:** o rodapé mostra `[CONFIRMAR: número de registro da clínica]` em destaque amarelo. Preencher antes de veicular.
- **URL real da Vercel / domínio:** trocar o placeholder `https://integra-saude-lp-denner.vercel.app/` em `canonical`, `og:url`, `og:image` e `twitter:image`, se a URL final for outra.
- **GTM / Meta Pixel:** colar entre os comentários `TRACKING HEAD` e `TRACKING BODY` do `index.html`. O clique em link de WhatsApp já dispara `dataLayer.push({event:'clique_whatsapp'})`, `fbq('track','Lead')` e `gtag('event','generate_lead')`, se existirem.
- **Copy:** validação pelo Dr. Denner.
- **WhatsApp:** testar o número em um aparelho real.

Última atualização: 06/11/2026
