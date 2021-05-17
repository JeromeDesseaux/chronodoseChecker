import puppeteer from 'puppeteer';
import cron from "node-cron";
import config from './config/config.json';
import { processCenter } from './scrapers/doctolib';

const CRON_ENABLED = process.env.CRON == "1" ? true : false;

const start = async (isCron: boolean) => {
    const centers = config.centers;
    console.log("💉 Recherchons un créneau de vaccination!");
    const browser = await puppeteer.launch({
        headless: true,
    });
    if (isCron) {
        cron.schedule('* * * * *', function () {
            console.log('💉 Je (re)lance la recherche ...');
            centers.map(async center => {
                processCenter(center, browser, config);
            })
        });
    } else {
        centers.map(center => processCenter(center, browser, config));
    }
}


start(CRON_ENABLED);