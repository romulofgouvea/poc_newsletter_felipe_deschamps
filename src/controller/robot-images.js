import 'dotenv/config';
import JSSoup from 'jssoup';
import nodeHtmlToImage from 'node-html-to-image';
import { htmlToText } from 'html-to-text';
const font2base64 = require('node-font2base64');

import { constants } from "../../config";
import { UArchive, UString } from "~/utils";

const font_title = font2base64.encodeToDataUrlSync(`${constants.ASSETS_FOLDER}/fonts/poppins/Poppins-Bold.ttf`);
const font_content = font2base64.encodeToDataUrlSync(`${constants.ASSETS_FOLDER}/fonts/poppins/Poppins-Regular.ttf`);

let image = UArchive.readFile(`${constants.ASSETS_FOLDER}/images`, 'felipe.png');
const base64Image = new Buffer.from(image).toString('base64');
const image_felipe = 'data:image/jpeg;base64,' + base64Image

const today = new Date();
const pathFolderImages = `./src/assets/output/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

const RobotImages = async () => {
  console.log("Iniciando a geração das imagens");

  //Filtrando os textos
  let textScraped = extractTextOfFileScrapy();
  console.log(textScraped.length + " notícias");

  for (let [index, news] of textScraped.entries()) {

    await generateImage(
      'STORIES',
      news.title,
      news.content,
      "Cadastre na newsletter e receba todas as notícias",
    );

    await generateImage(
      'FEED',
      news.title,
      news.content,
      "Cadastre na newsletter e receba todas as notícias",
    );

    console.log(`Gerada - ${index + 1} - ${news.title}`);
  }

  console.log("Geração das imagens finalizada");
};

function generateImage(type, title, content, action, output = './image1.png') {

  content = UString.capitalizeFirstLetter(content);

  if (content.length > 500) {
    content = content.substring(0, 500) + "... [Veja mais na newsletter]"
  }

  let htmlFinish = ``;
  if (type == 'STORIES') {
    htmlFinish = `
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
  } else {
    htmlFinish = `
    <html lang="pt">

    <head>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <title>Feeds</title>
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
                min-height: 1080px;
                max-height: 1080px;
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
                padding-bottom: 30px;
                max-height: 810px;
                min-height: 810px;
            }

            .div2 {
                flex: 0.25;
                justify-content: center;
                align-items: center;
                text-align: center;
                background-color: rgb(242, 218, 94);
                max-height: 270px;
                min-height: 270px;
            }

            p {
                font-size: 35px;
                margin: 0;
                padding: 0;
            }

            .bold {
              font-family: 'PoppinsBold';
            }
            
            .title {
                font-size: 40px;
            }

            .content {
                margin-top: 20px;
            }

            .action {
                margin-top: 20px;
            }

            img {
                border-radius: 51%;
                border: 30px solid #FFF;
                margin: 0;
                padding: 0;
                min-width: 130px;
                height: 130px;
                margin-top: -160px;
            }
        </style>
    </head>

    <body>
        <div class="div1">
            <p class="title bold">{{title}}</p>
            <p class="content">{{content}}</p>
        </div>
        <div class="div2">
            <img src="{{image_felipe}}" />
            <p class="action bold">{{action}}</p>
        </div>
    </body>

    </html>
  `;
  }

  let titleName = title.toLowerCase().replace(/\s/g, '_').substring(0, 10);
  let nameFile = `${today.getDate()}_${titleName}_${type.toLowerCase()}.jpg`;
  output = UString.removeAcento(`${pathFolderImages}/${type.toLowerCase()}/${nameFile}`);

  UArchive.createFolder(output);

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
