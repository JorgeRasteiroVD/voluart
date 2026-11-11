# VOLUART

Site institucional de página única, preparado para o repositório `JorgeRasteiroVD/voluart` e o GitHub Pages. HTML, CSS e JavaScript nativos, sem instalação ou compilação.

## Estrutura

- `index.html` contém as secções, a versão de base em português e os metadados estáticos.
- `styles.css` contém a grelha, a tipografia e os estilos responsivos. O site continua legível com as fontes locais se a Manrope não carregar.
- `translations.js` contém os textos e as legendas nas colunas PT, EN, ES e FR, por esta ordem. Ao alterar a versão portuguesa, atualize também o texto inicial correspondente no HTML.
- `site.js` controla a navegação, as galerias, os idiomas, os vídeos e o contacto. A lista `GALLERIES` define a ordem das fotografias por álbum.
- `assets/images/` contém os WebP originais do kit, organizados por projeto e atelier. `assets/logo-voluart.png` é uma cópia do logótipo oficial e `assets/favicon.png` usa o recorte do símbolo original.
- `CNAME` identifica o domínio de produção. Inclua-o apenas na versão destinada a `voluart.com`.

## Ver localmente

Abra `index.html` no navegador ou execute, na raiz do projeto:

```sh
python3 -m http.server 8123 --bind 127.0.0.1
```

Abra [a versão local](http://127.0.0.1:8123/). Para testar links partilháveis, acrescente `?lang=fr#projects` ao URL. A preferência vem primeiro do URL, depois da escolha guardada, depois do idioma do navegador. Se nenhum corresponder, o site usa inglês. O site não usa serviços de localização ou de monitorização.

## Ativar o contacto

1. O email de orçamento é definido em `CONTACT_EMAIL` no início de `site.js`. Sem endpoint, os botões abrem a aplicação de email do visitante com destinatário e assunto no idioma selecionado. `CONTACT_WHATSAPP` aceita o número em formato internacional com indicativo. `INSTAGRAM_URL` recebe o URL HTTPS do perfil.
2. Para passar a receber pedidos através de um formulário, crie um formulário no Formspree, verifique o email de destino e copie o URL HTTPS do endpoint (formato `https://formspree.io/f/ID`). Substitua `FORM_ENDPOINT_PLACEHOLDER` em `site.js`. O URL público do formulário não é uma chave de API.
3. Disponibilize a política de privacidade aprovada e preencha `PRIVACY_POLICY_URL` com o respetivo endereço. Confirme que a política cobre os dados recolhidos, a finalidade, o prestador de envio e os contactos relevantes antes de ativar a recolha em produção.
4. Envie um pedido de teste e confirme a receção efetiva. Sem endpoint, o formulário fica oculto e o site usa o email configurado ou mostra o aviso de configuração. A mensagem de sucesso só aparece após uma resposta de sucesso do serviço.

[Guia de formulários do Formspree](https://formspree.io/html/)

## Adicionar vídeos

A secção e os links ficam ocultos enquanto `VIDEOS` estiver vazio. Coloque o MP4, o poster e, quando houver fala, as legendas WebVTT em `assets/videos/`. Adicione um objeto a `VIDEOS` em `site.js`:

```js
{
  src: "assets/videos/atelier.mp4",
  poster: "assets/videos/atelier.webp",
  title: { pt: "No atelier", en: "In the workshop", es: "En el taller", fr: "À l’atelier" },
  captions: [{ src: "assets/videos/atelier-pt.vtt", lang: "pt-PT", label: "Português" }],
}
```

Para um embed externo, use `embed` com o URL HTTPS de incorporação em vez de `src`, mantenha o poster local e confirme as implicações de privacidade do fornecedor. O iframe só é inserido quando o visitante escolhe reproduzir o vídeo.

## Publicar no GitHub Pages

1. Valide localmente e reveja a nova versão antes de a enviar para a branch de publicação. Inclua no commit apenas os ficheiros de publicação descritos acima. `VOLUART_kit_site/` é o material de origem. Num repositório que já publica de `main`, um push para essa branch pode substituir a página pública.
2. Para publicação pela raiz, confirme **Settings → Pages → Build and deployment → Deploy from a branch → main → / (root)**. Se optar por `/docs`, mova em conjunto os ficheiros HTML/CSS/JS, `assets/` e, quando aplicável, `CNAME` para `docs/`, depois selecione essa pasta.
3. Na migração para `voluart.com`, confirme primeiro o domínio em **Settings → Pages → Custom domain**. Se a configuração atual já estiver operacional, reutilize-a. Se for necessário editar DNS na AMEN, aponte `voluart.com` para os quatro registos A do GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) e `www` por CNAME para `jorgerasteirovd.github.io`. Preserve os registos de email. O ficheiro `CNAME` não substitui estes passos.
4. Confirme a publicação no separador **Actions**, verifique a abertura do domínio e ative **Enforce HTTPS** quando o certificado estiver disponível. Se publicar noutro endereço, ajuste também os URLs absolutos de canonical, Open Graph e JSON-LD no HTML.

[Publicação a partir de uma branch](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [Domínio personalizado e HTTPS](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

O conteúdo traduzido pertence a um único documento. Para indexação internacional independente, a evolução é servir HTML estático por idioma com canonical e `hreflang` próprios.

## Checklist de validação

- Confirmar menu, âncoras, secção ativa e navegação por teclado em 1440, 1024, 768, 375 e 320 px.
- Testar PT, EN, ES e FR, persistência, prioridade do URL, título, descrição e textos alternativos.
- Confirmar que a abertura destaca as duas colunas, que as quatro miniaturas trocam a fotografia principal e que o pedido por email tem o destinatário e o assunto esperado em cada idioma.
- Abrir os três álbuns de projetos e o do atelier. Verificar miniaturas, contador, foco, setas, Escape e gesto horizontal num dispositivo tátil.
- Confirmar que o álbum de cada projeto contém apenas as respetivas imagens e que os 34 WebP abrem.
- Verificar ausência de vídeos e contactos por preencher. Com o endpoint configurado, testar campos obrigatórios, estado de envio, erro, sucesso e receção do pedido.
- Verificar foco visível, link de salto e preferência por movimento reduzido.
