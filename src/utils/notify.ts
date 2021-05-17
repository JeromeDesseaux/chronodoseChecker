import open from "open";
import { SlotStatus } from "../models/status";
import notifier from 'node-notifier';


const notify = (URL: string, status: SlotStatus, option: string): void => {
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

export {
    notify
}