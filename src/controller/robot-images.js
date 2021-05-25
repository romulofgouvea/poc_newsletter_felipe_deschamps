import 'dotenv/config';
import nodeHtmlToImage from 'node-html-to-image';
const font2base64 = require('node-font2base64');

import { constants } from "~/config";
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
  let json_mail = UArchive.loadFileJson(`${constants.ASSETS_FOLDER}/output`, 'json_mail') || [];

  if (!json_mail) {
    console.log('Erro ao ler json_mail');
    process.exit();
  }

  let textScraped = json_mail.news;
  console.log(textScraped.length + " notícias");

  for (let [index, news] of textScraped.entries()) {

    if (process.env.PUBLISH_STORIES == "true") {
      await generateImage(
        'STORIES',
        news.title,
        news.content,
        "Cadastre na newsletter e receba todas as notícias",
      );
    }

    if (process.env.PUBLISH_FEED == "true") {
      await generateImage(
        'FEED',
        news.title,
        news.content,
        "Cadastre na newsletter e receba todas as notícias",
      );
    }

    console.log(`Gerada - ${index + 1} - ${news.title}`);
  }

  console.log("Geração das imagens finalizada");
};

function generateImage(type, title, content, action, output = './image1.png') {

  let lenghtCharContent = 510 - (Math.round(title.length / 27) * 10);

  if (content.length > lenghtCharContent) {
    content = content.substring(0, lenghtCharContent) + "... [Veja mais na newsletter]"
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
                background-color: #FFF;
                width: 1080px;
                min-height: 1920px;
                max-height: 1920px;
                font-family: 'PoppinsRegular';
                display: flex;
                flex-direction: column;
                justify-content: strech;
                margin: 0;
                padding: 0;
            }

            .div1 {
                flex: 1;
                background-color: #FFF;
                padding: 150px 60px 50px 60px;
            }

            .div2 {
                flex: 0.10;
                justify-content: center;
                align-items: center;
                text-align: center;
                background-color: rgb(242, 218, 94);
            }

            p {
                font-size: 45px;
                margin: 0;
                padding: 0;
            }

            .title {
                font-family: 'PoppinsBold';
                font-size: 65px;
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

  let titleName = title.toLowerCase().replace(/\W+/g, '_').substring(0, 10);
  let nameFile = `${today.getDate()}_${titleName}_${type.toLowerCase()}.jpg`;
  output = UString.removeAcento(`${pathFolderImages}/${type.toLowerCase()}/${nameFile}`);

  UArchive.createFolder(output);

  return new Promise((resolve, reject) => {
    nodeHtmlToImage({
      puppeteerArgs: {
        executablePath: process.env.CHROMIUM_PATH,
        args: ['--no-sandbox'],
      },
      html: htmlFinish,
      quality: 100,
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
      .catch(e => {
        console.log(e);
        resolve(false)
      })
  })
}

module.exports = { RobotImages };
