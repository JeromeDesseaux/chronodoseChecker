import puppeteer, { Browser, Page } from 'puppeteer';
import open from 'open';
import notifier from 'node-notifier';
import cron from "node-cron";


const CRON_ENABLED = process.env.CRON == "1" ? true : false;
const centers: string[] = [
    "https://www.doctolib.fr/centre-de-sante/rouen/centre-vaccination-cabinet-medical-des-carnes?highlight%5Bspeciality_ids%5D%5B%5D=5494",
    "https://www.doctolib.fr/centre-de-sante/rouen/centre-de-vaccination-covid-vaccinarena-rouen?highlight%5Bspeciality_ids%5D%5B%5D=5494",
    "https://www.doctolib.fr/centre-de-sante/sotteville-les-rouen/centre-de-vaccination-sotteville-les-rouen?highlight%5Bspeciality_ids%5D%5B%5D=5494",
    "https://www.doctolib.fr/cabinet-medical/duclair/centre-de-vaccination-covid-19-duclair",
    // "https://www.doctolib.fr/centre-de-sante/tille/centre-de-vaccination-du-sdis-60?highlight%5Bspeciality_ids%5D%5B%5D=5494"
]
const vaccineNames: string[] = ['Pfizer', 'Moderna']
const injectionNumber = 1;


const getAllValuesFromSelect = async (page: Page): Promise<string[]> => {
    const values: string[] = [];
    const selector = await page.$$("#booking_motive option");
    for (const option of selector) {
        const value = await page.evaluate(elem => elem.value, option);
        values.push(value)
    }
    return values;
}

const filterOptionsValues = (values: string[], vaccineNames: string[], injectionNumber: number = 1 | 2): string[] => {
    const injectionNumberString = injectionNumber === 1 ? "1re" : "2nd";
    const newValues: string[] = [];

    values.map(value => {
        vaccineNames.map(vn => {
            if (value.includes(injectionNumberString) && value.toLowerCase().includes(vn.toLowerCase())) {
                newValues.push(value);
            }
        })
    })
    return newValues;
}

const notify = (URL: string, status: SlotStatus, option: string) => {
    let message = "";
    if (status === SlotStatus.ERROR || status === SlotStatus.NONE) {
        console.log(`Aucun créneau disponible ${option} au lien ${URL}`);
        return;
    } else {
        message = `Des créneaux de vaccination semblent disponibles pour ${option}! J'ouvre une fenêtre dans votre navigateur!`;
    }
    open(URL, { app: { name: 'google chrome' } });
    notifier.notify({
        title: "Créneaux disponibles !",
        message: message
    })
    console.log(`-> Potentiel créneau en utilisant le choix ${option} au lien ${URL}`);
}

function delay(time: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

enum SlotStatus {
    ONE_OR_MANY = 1,
    DONT_KNOW,
    NONE,
    ERROR
}

class NetworkException extends Error {
    constructor(m: string) {
        super(m);
    }
}

class ElementNotFoundException extends Error {
    constructor(m: string) {
        super(m);
    }
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

const getValuesFromPage = async (page: Page) => {
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
            console.log(textContent)
            // if (textContent.toString().toLowerCase().includes('aucun rendez-vous')) {
            //     return SlotStatus.NONE;
            // } else {
            // }
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

const processCenter = async (center: string, browser: Browser) => {
    try {
        const page = await getPage(center, browser);
        const vaccineOptions = await getValuesFromPage(page);
        vaccineOptions.map(async option => {
            const status = await checkVaccineSlots(center, option, page);
            notify(center, status, option);
        })
    } catch (NetworkException) {
        return;
    }
}

const start = async (isCron: boolean) => {
    console.log("💉 Recherchons un créneau de vaccination!");
    const browser = await puppeteer.launch({
        headless: true,
    });
    if (isCron) {
        cron.schedule('*/5 * * * *', function () {
            console.log('💉 Je (re)lance la recherche ...');
            centers.map(async center => {
                processCenter(center, browser);
            })
        });
    } else {
        centers.map(center => processCenter(center, browser));
    }
}


start(CRON_ENABLED);