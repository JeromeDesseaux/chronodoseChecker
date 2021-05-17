# MonCreneauVaccin

Trouver un créneau de vaccination disponible (Chronodose) sur une liste d'URLs de centres de vaccination via Doctolib. Pour le moment, ce projet est encore
brut. J'envisage à très court terme de le rendre plus accessible. Pour le moment, il nécessite quelques connaissances en programmation.

## Prérequis

Avoir installé [nodejs (disponible sur ce lien)](https://nodejs.org/en/) (Je conseille la version LTS).

## Installation

- Cloner le repo du projet
- `yarn install` ou `npm install`
- Vérifiez les paramètres d'exécution dans le fichier `src/config/config.json`. Modifiez la liste `centers` selon les centres qui correspondent à votre domicile. Les liens correspondent à l'URL du centre sur le site [Doctolib](https://doctolib.fr)
- Exécutez le projet avec `CRON=1 yarn start`

Par défaut (et par respect pour les serveurs de Doctolib), les tâches sont exécutées toutes les 5 minutes. Merci de respecter leur travail et de ne pas recharger les pages trop fréquemment. Cela est inutile et bloque le service fournit par Doctolib dans l'intérêt de tous. Merci pour eux.

## Environnement de développement

Une aide peut être appréciée sur ce projet afin de le développer rapidement pour le plus grand nombre. Pour exécuter le projet en mode développement `yarn run watch` vous fournira du hot-reload et désactive les tâches CRON.
