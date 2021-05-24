import 'dotenv/config';
let imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const _ = require('lodash');

import { constants } from "~/config";

import { UArchive, UString } from "~/utils";

let config = {
    imap: {
        user: process.env.GMAIL_USERNAME,
        password: process.env.GMAIL_PASSWORD,
        host: process.env.GMAIL_HOST,
        port: process.env.GMAIL_PORT,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
    }
};

const RobotScrapy = async () => {
    console.log("Iniciando o Scrapy");

    let mail = await getHtmlFromEmailByDate();

    if (mail) {

        let jsonOutput = extractTextOfFileScrapy(mail);

        await UArchive.writeFileSync(
            constants.ASSETS_FOLDER + "/output",
            "json_mail.json",
            JSON.stringify(jsonOutput)
        );

        console.log("Arquivo salvo!");
    } else {
        console.log("Email vazio!");
    }

    console.log("Scrapy finalizado");
};

function getHtmlFromEmailByDate(date = new Date()) {

    return new Promise(async (resolve, reject) => {
        imaps.connect(config).then(function (connection) {
            return connection.openBox('INBOX')
                .then(function () {
                    console.log('Lendo Inbox...');

                    let searchCriteria = [
                        ['SINCE', date.toISOString()],
                        ['FROM', 'newsletter@filipedeschamps.com.br']
                    ];

                    let fetchOptions = {
                        bodies: ['HEADER', 'TEXT', ''],
                    };

                    return connection.search(searchCriteria, fetchOptions)
                        .then(function (messages) {

                            if (messages.length == 0) {
                                resolve(undefined);
                            }

                            for (let item of messages) {
                                if (!dateEquals(item.attributes.date, date)) {
                                    resolve(undefined);
                                }

                                let all = _.find(item.parts, { "which": "" })
                                let id = item.attributes.uid;
                                let idHeader = "Imap-Id: " + id + "\r\n";
                                simpleParser(idHeader + all.body, (err, mail) => {
                                    console.log('Email encontrado.');
                                    resolve(mail);
                                });
                            }
                        });
                });
        });
    });

}

function dateEquals(date1, date2) {
    let someDay = date1.getDate() == date2.getDate();
    let someMonth = date1.getMonth() == date2.getMonth();
    let someYear = date1.getFullYear() == date2.getFullYear();

    return someDay && someMonth && someYear;
}

function extractTextOfFileScrapy(mail) {
    console.log('Formatando saída do email');
    let arrayTextMail = mail.text.split('\n\n');

    var textExtracted = [];

    for (let i = 2; i < arrayTextMail.length; i++) {
        let txt = arrayTextMail[i].replace(/\n/g, ' ');

        if (txt.toLowerCase().includes('afiliado')
            || txt.toLowerCase().includes('patrocinado')
            || txt.toLowerCase().includes('cancelar inscri')) {
            continue;
        }
        var txtSplit = txt.split(':');
        textExtracted.push({
            title: UString.capitalizeFirstLetter(txtSplit[0].trim()) + ":",
            content: UString.capitalizeFirstLetter(txtSplit[1].trim())
        });
    }

    return {
        title: arrayTextMail[0].replace(/\n/g, ' '),
        description: arrayTextMail[1].replace(/\n/g, ' '),
        news: textExtracted
    };
}


module.exports = { RobotScrapy };
