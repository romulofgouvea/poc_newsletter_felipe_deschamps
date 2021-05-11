import 'dotenv/config';
import JSSoup from 'jssoup';

const _ = require('lodash');

import { htmlToText } from 'html-to-text';

import { constants } from "../../config";
import { UArchive } from "~/utils";

const RobotImages = async () => {
    console.log("Iniciando a geração das imagens");

    let textScraped = extractTextOfFileScrapy();
    console.log(textScraped.length);

    for (let t of textScraped) {
        console.log(t.title + "\n");
    }

    console.log("Geração das imagens finalizada");
    process.exit();
};

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
