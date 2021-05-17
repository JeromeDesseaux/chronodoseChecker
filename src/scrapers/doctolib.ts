import { Page, Browser } from "puppeteer";
import { NetworkException } from "../exceptions/exceptions";
import { SlotStatus } from "../models/status";
import { filterOptionsValues } from "../utils/filters";
import { notify } from "../utils/notify";
import { delay } from "../utils/utils";

const getAllValuesFromSelect = async (page: Page): Promise<string[]> => {
    const values: string[] = [];
    const selector = await page.$$("#booking_motive option");
    for (const option of selector) {
        const value = await page.evaluate(elem => elem.value, option);
        values.push(value)
    }
    return values;
}

const getPage = async (URL: string, browser: Browser): Promise<Page> => {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'fr-FR,fr;en-US,en;q=0.9,en;q=0.8'
    })
    try {
        await page.goto(URL);
        await page.waitForSelector('#booking_motive');
        return page
    } catch (error) {
        throw new NetworkException("Oooops! Impossible d'accéder à la page demandée.");
    }
}

const getValuesFromPage = async (page: Page, vaccineNames: string[], injectionNumber: number) => {
    const optionsValues = await getAllValuesFromSelect(page);
    return filterOptionsValues(optionsValues, vaccineNames, injectionNumber);
}

const checkVaccineSlots = async (URL: string, optionValue: string, page: Page): Promise<SlotStatus> => {
    await page.select('#booking_motive', optionValue);
    await delay(3000);
    try {
        const elem = await page.waitForSelector('.booking-availabilities span');
        if (elem) {
            const textContent = await page.$eval('.booking-availabilities span', element => element.innerText);
            if(textContent.toString().includes("VOIR PLUS D'HORAIRES") || textContent.toString().toLowerCase().includes("prochain rdv")) return SlotStatus.ONE_OR_MANY;
            return SlotStatus.NONE;
        }
        else {
            return SlotStatus.DONT_KNOW;
        }
    } catch (ElementNotFoundException) {
        return SlotStatus.DONT_KNOW;
    }
}

const processCenter = async (center: string, browser: Browser, config: any) : Promise<void> => {
    try {
        const page = await getPage(center, browser);
        const vaccineOptions = await getValuesFromPage(page, config.vaccineNames, config.injectionNumber);
        vaccineOptions.map(async option => {
            const status = await checkVaccineSlots(center, option, page);
            notify(center, status, option);
        })
    } catch (NetworkException) {
        return;
    }
}

export {
    processCenter
}