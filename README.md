# Newsletter Felipe Deschamps Creator

# Objetivo
 - Buscar o email diário da newsletter
 - Gerar imagens com cada notícia
 - publicar no feed e stories do instagram

## 1 Scrapy
 - imap-simple
## 2 Gerar Imagens das notícias
 - jssoup
 - html-to-text
## 3 Publicação no instagram das imagens
 - instagram-private-api
 
#  Instruções

## Iniciando o projeto

```bash
git clone https://github.com/romulofgouvea/poc_newsletter_felipe_deschamps.git

cd maker-poc-newsletter && npm i

## Com o terminal ja pasta principal e digite: 
```bash
touch .env
```

 Lista de ENV utilizadas:

 - Gmail imap
      - GMAIL_USERNAME=
      - GMAIL_PASSWORD=
      - GMAIL_HOST=
      - GMAIL_PORT=

 - Instagram Api
    - IG_USERNAME=
    - IG_PASSWORD=

 - Gerais
    - PUBLISH_FEED=
    - PUBLISH_STORIES=

## Contributing
<table>
  <tr>
    <td align="center"><a href="https://github.com/romulofgouvea">
        <img src="https://avatars3.githubusercontent.com/u/16581559?s=460&v=4" width="100px;" alt="Romulo F."/><br /><sub>
        <b>Romulo F. Gouvea</b></sub></a>
    </td>
  </tr>
</table>

## License
[MIT](https://choosealicense.com/licenses/mit/)
