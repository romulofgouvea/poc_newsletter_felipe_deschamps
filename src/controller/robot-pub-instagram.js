import 'dotenv/config';

import { IgApiClient } from 'instagram-private-api';
const ig = new IgApiClient();

import { readFile } from 'fs';
import { promisify } from 'util';
const readFileAsync = promisify(readFile);

import { constants } from "../../config";
import { UArchive } from "~/utils";


const RobotPubInstagram = async () => {
    console.log("Iniciando a publicação no Instagram");

    await login();

    const instaDeschamps = await generateUsertagFromName('filipedeschamps', 0.5, 0.7);

    const d = new Date();
    const folderImages = `${constants.ASSETS_FOLDER}/output/${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
        .replace(/\\/g, '/');

    // STORIES
    if (process.env.PUBLISH_STORIES == "true") {
        console.log("INIT STORIES");

        let filesStories = await new Promise((resolve, reject) => {
            UArchive.getDirectoriesCB(folderImages + "/stories", async (err, files) => {
                resolve(files);
            })
        })

        for (let i of filesStories) {
            const file = await readFileAsync(folderImages + "/stories/" + i);

            await ig.publish.story({
                file,
                caption: "Newsletter @filipedeschamps",
                usertags: {
                    in: [
                        instaDeschamps,
                    ],
                },
            });
        }

        console.log("FINISH STORIES");
    }


    //FEED
    if (process.env.PUBLISH_FEED == "true") {
        console.log("INIT FEED");

        let filesFeed = await new Promise((resolve, reject) => {
            UArchive.getDirectoriesCB(folderImages + "/feed", async (err, files) => {
                resolve(files);
            })
        })

        if (filesFeed.length > 0) {

            let items = [];
            for (let i of filesFeed) {
                const file = await readFileAsync(folderImages + "/feed/" + i);
                items.push({
                    file,
                    usertags: {
                        in: [
                            instaDeschamps,
                        ],
                    },
                });
            }


            await ig.publish.album({
                caption: 'Newsletter @filipedeschamps',
                items
            });
        }


        console.log("FINISH FEED");
    }

    console.log("Publicação no instagram finalizada");
    process.exit();
};

async function login() {
    console.log("Logando ...");
    ig.state.generateDevice(process.env.IG_USERNAME);
    ig.state.proxyUrl = process.env.IG_PROXY;
    //await ig.account.logout();

    let current = {};
    try {
        current = await ig.account.currentUser();
    } catch (e) {
        current = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
    }


    console.log("Logado: " + current.username);
}

/**
 * Generate a usertag
 * @param name - the instagram-username
 * @param x - x coordinate (0..1)
 * @param y - y coordinate (0..1)
 */
async function generateUsertagFromName(name, x, y) {
    // constrain x and y to 0..1 (0 and 1 are not supported)
    x = clamp(x, 0.0001, 0.9999);
    y = clamp(y, 0.0001, 0.9999);
    // get the user_id (pk) for the name
    const { pk } = await ig.user.searchExact(name);
    return {
        user_id: pk,
        position: [x, y],
    };
}

/**
 * Constrain a value
 * @param value
 * @param min
 * @param max
 */
const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

module.exports = { RobotPubInstagram };
