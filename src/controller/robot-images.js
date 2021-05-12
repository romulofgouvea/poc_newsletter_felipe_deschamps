import 'dotenv/config';
import JSSoup from 'jssoup';
import nodeHtmlToImage from 'node-html-to-image';
import { htmlToText } from 'html-to-text';
const font2base64 = require('node-font2base64');

import { constants } from "../../config";
import { UArchive, UString } from "~/utils";

const RobotImages = async () => {
  console.log("Iniciando a geração das imagens");

  //Filtrando os textos
  let textScraped = extractTextOfFileScrapy();
  console.log(textScraped.length);

  // var title = "Gangue de ransomware DarkSide anuncia que realizará análise preliminar antes de permitir novos ataques:"
  // var content = `A decisão veio após um de seus “parceiros” invadir e bloquear o sistema de oleodutos que
  // fornece 45% de todo o combustível utilizado na costa leste dos EUA, obrigando o governo a decretar estado de
  // emergência. Em um comunicado, o grupo criminoso se declarou apolítico, não possuindo ligação com nenhum
  // governo. Seu objetivo primário seria apenas ganhar dinheiro com a cobrança de resgates e quer evitar
  // consequências sociais de seus ataques no futuro. As informações são do site Bleeping Computer.
  // A decisão veio após um de seus “parceiros” invadir e bloquear o sistema de oleodutos que`;

  let today = new Date();
  let pathFolder = `./src/assets/output/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;


  //Generate images Stories
  for (let [index, news] of textScraped.entries()) {

    let titleName = news.title.toLowerCase().replace(/\s/g, '_').substring(0, 10);
    let nameFile = `${today.getDate()}_${titleName}-img.png`;
    let output = UString.removeAcento(pathFolder + "/stories/" + nameFile);

    UArchive.createFolder(output);

    let generated = await generateImage(
      news.title,
      news.content,
      "Cadastre na newsletter e receba todas as notícias",
      output
    );

    console.log(`${index} - ${generated} - ${news.title}`);
  }

  console.log("Geração das imagens finalizada");
  process.exit();
};

function generateImage(title, content, action, output = './image1.png') {

  content = UString.capitalizeFirstLetter(content);

  if (content.length > 500) {
    content = content.substring(0, 500) + " [Veja mais na newsletter]"
  }

  const font_title = font2base64.encodeToDataUrlSync(`${constants.ASSETS_FOLDER}/fonts/poppins/Poppins-Bold.ttf`);
  const font_content = font2base64.encodeToDataUrlSync(`${constants.ASSETS_FOLDER}/fonts/poppins/Poppins-Regular.ttf`);

  let image_felipe = UArchive.readFile(`${constants.ASSETS_FOLDER}/images`, 'felipe.png');
  const base64Image = new Buffer.from(image_felipe).toString('base64');
  image_felipe = 'data:image/jpeg;base64,' + base64Image

  var htmlFinish = `
    <html lang="pt">

    <head>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <title>Stories</title>
        <meta name='viewport' content='width=device-width, initial-scale=1'>

        <style>
            @font-face {
              font-family: 'PoppinsBold';
              src: url(${font_title}) format('truetype');
            }

            @font-face {
                font-family: 'PoppinsRegular';
                src: url(${font_content}) format('truetype');
            }

            body {
                /* background-color: black; */
                width: 1080px;
                min-height: 1920px;
                max-height: 1920px;
                font-family: 'PoppinsRegular';
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                margin: 0;
                padding: 0;
            }

            div {
                padding: 50px;
                background-color: #FFF;
            }

            .div1 {
                flex: 0.75;
                justify-content: flex-start;
                padding-bottom: 50px;
                max-height: 1440px;
                min-height: 1440px;
            }

            .div2 {
                flex: 0.25;
                justify-content: center;
                align-items: center;
                text-align: center;
                background-color: rgb(242, 218, 94);
                max-height: 480px;
                min-height: 480px;
            }

            p {
                font-size: 45px;
                margin: 0;
                padding: 0;
            }

            .title {
                font-family: 'PoppinsBold';
                font-size: 60px;
            }

            .content {
                margin-top: 55px;
            }

            .action {
                margin-top: 30px;
            }

            img {
                border-radius: 51%;
                border: 30px solid #FFF;
                margin: 0;
                padding: 0;
                min-width: 200px;
                height: 200px;
                margin-top: -180px;
            }
        </style>
    </head>

    <body>
        <div class="div1">
            <p class="title">{{title}}</p>
            <p class="content">{{content}}</p>
        </div>
        <div class="div2">
            <img src="{{image_felipe}}" />
            <p class="title action">{{action}}</p>
        </div>
    </body>

    </html>
  `;

  return new Promise((resolve, reject) => {
    nodeHtmlToImage({
      html: htmlFinish,
      content: [
        {
          font_title: font_title,
          font_content,
          image_felipe,
          title,
          content,
          action: action,
          output
        },
      ],
    })
      .then(() => resolve(true))
      .catch(e => reject(false))
  })
}

function extractTextOfFileScrapy() {
  //Ler o html
  let path = `${constants.OUTPUT_FOLDER}`;
  let html_mail = UArchive.loadFile(path, 'html_mail.html')[0];

  var soup = new JSSoup(html_mail);
  var p = soup.findAll('p');

  var textExtracted = [];

  for (let i = 2; i < p.length; i++) {
    let txt = htmlToText(p[i].text);

    if (txt.toLowerCase().includes('afiliado')
      || txt.toLowerCase().includes('patrocinado')
      || txt.toLowerCase().includes('cancelar inscri')) {
      continue;
    }
    var txtSplit = txt.split(':');
    textExtracted.push({
      title: txtSplit[0].trim() + ":",
      content: txtSplit[1].trim()
    });
  }
  return textExtracted;
}

module.exports = { RobotImages };
