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

    let mail = await getHtmlFromEmailByDate();

    if (mail) {
        let path = `${constants.OUTPUT_FOLDER}`;
        await UArchive.writeFileSync(path, "html_mail.html", mail.textAsHtml);

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

module.exports = { RobotScrapy };
