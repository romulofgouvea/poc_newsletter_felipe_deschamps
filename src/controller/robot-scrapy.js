import 'dotenv/config';
let imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const _ = require('lodash');

import { constants } from "../../config";

import { UArchive } from "~/utils";

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

    let mail = await getHtmlFromEmailByDate(new Date(2021, 4, 7));

    if (mail) {
        let path = `${constants.OUTPUT_FOLDER}`;
        await UArchive.writeFileSync(path, "html_mail.html", mail.textAsHtml);

        console.log("Arquivo salvo!");
    } else {
        console.log("Email vazio!");
    }

    console.log("Scrapy finalizado");
    process.exit();
};

function getHtmlFromEmailByDate(date = new Date()) {
    let today = date.toISOString();

    return new Promise(async (resolve, reject) => {
        imaps.connect(config).then(function (connection) {
            return connection.openBox('INBOX')
                .then(function () {
                    let searchCriteria = [
                        ['SINCE', today],
                        ['FROM', 'newsletter@filipedeschamps.com.br']
                    ];

                    let fetchOptions = {
                        bodies: ['HEADER', 'TEXT', ''],
                    };

                    return connection.search(searchCriteria, fetchOptions)
                        .then(function (messages) {

                            if (messages.length == 0) {
                                reject();
                            }
                            for (let item of messages) {
                                let all = _.find(item.parts, { "which": "" })
                                let id = item.attributes.uid;
                                let idHeader = "Imap-Id: " + id + "\r\n";
                                simpleParser(idHeader + all.body, (err, mail) => {
                                    resolve(mail);
                                });
                            }
                        });
                });
        });
    });

}

module.exports = { RobotScrapy };
