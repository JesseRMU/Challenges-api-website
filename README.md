# Netflix Roulette Clone

Een responsive web applicatie die films en series ophaalt van de OMDB API met filters voor genre, type en IMDB rating. Gebouwd met Express.js, TypeScript, Tailwind CSS en EJS templates.

## Features

- 🎬 Zoeken naar films en series
- 🏷️ Filteren op genre, type en IMDB rating
- 📱 Volledig responsive design (mobile-first)
- 🎨 Modern UI met Tailwind CSS
- 🗄️ SQLite database met Prisma ORM
- 🔍 Real-time zoekfunctionaliteit

## Prerequisites

Make sure you have [NodeJS](https://nodejs.org/en/download/) installed (preferably the LTS version). This will also install `npm`. For Windows users you might consider [Chocolaty](https://chocolatey.org) and for Mac users obviously [Brew](https://brew.sh). These are both package managers that will help you install and update all kinds of packages via the CLI. Highly recommended. 

1. Open a terminal window (command prompt, git bash, powershell)
2. Check if NodeJS is installed by typing `node --version` into the terminal. It should print a line with something like `v18.18.0`.
3. Check if NPM is installed by typing  `npm --version` into the terminal. It should print a line with something like `9.8.0`.

## Local Development

1. Clone or download this repository to your computer
2. Open a terminal in the project directory.
3. Install the dependencies by running `npm install`.
4. Copy `.env.example` to `.env` and fill in your OMDB API key
5. Run `npm run dev` to start developing
6. Run `npm run start` to start the server

## Production Build

```bash
npm run build
npm start
```

## Deployment op Render

### Stap 1: Voorbereiding
1. Zorg dat je project in een GitHub repository staat
2. Zorg dat `.env` NIET in je repository staat (gebruik .gitignore)
3. Test eerst lokaal met `npm run build` en `npm start`

### Stap 2: Render Web Service aanmaken
1. Ga naar [render.com](https://render.com) en maak een account
2. Klik op "New +" → "Web Service"
3. Verbind je GitHub repository
4. Selecteer de repository met je project

### Stap 3: Service configuratie
- **Name**: Kies een naam voor je service (bijv. netflix-roulette-clone)
- **Environment**: Node
- **Region**: Frankfurt (Europe) of dichtstbijzijnde
- **Branch**: main (of master)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Stap 4: Environment Variables instellen
Ga naar Environment tab en voeg toe:
- `NODE_ENV` = `production`
- `DATABASE_URL` = `file:./prisma/clients.db`
- `OMDB_API_KEY` = je echte OMDB API key
- `PORT` = `10000` (Render default)

### Stap 5: Deploy
1. Klik op "Create Web Service"
2. Wacht tot de build en deployment klaar zijn
3. Test je applicatie op de gegeven URL

## Environment Variables

Kopieer `.env.example` naar `.env` en vul de volgende variabelen in:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
OMDB_API_KEY=your_omdb_api_key_here
```

## Recommended VS Code Extension
 - To use the provided `.editorconfig` file, install the [EditorConfig](https://editorconfig.org/#download) plugin.
 - To use the provided `.eslintrc.cjs` file, install the [ESLint](https://eslint.org/docs/user-guide/integrations) plugin.

## Using Docker

If you're like me and you dislike NodeJS and NPM piling up heaps of folders on your pc, run TypeScript in Docker!

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop).
2. Open a terminal window (Powershell on Windows, regular command prompt will not work).
3. Clone this repository.
4. Move to this folder inside the terminal.
5. Run `docker-compose up` and open a new terminal OR run `docker-compose up -d` which allows you to work in the same terminal.
6. Follow the steps from [Instructions](#instructions) from step 4, but prefix all the commands with `docker-compose exec ts-app`.
7. Close the docker container by pressing `ctrl` + `c` or `docker-compose down`, respectively for step 5

# Design decisions

## Modules

We use ES6 module system to [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import?retiredLocale=nl) and [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) modules.

## .env

We save credentials to other services in a `variables.env` file. This file is included in this template. However, it is common use not to include it in a public repository. There are some default key value pairs included to demonstrate its working.

## Ports

You can change the ports of your server via `variables.env`

## Scripts in package.json
The initial idea was to just run the whole app in TS and not bother transpiling the TS files. Alas the `npm run ts:` prefixes. However during the process we left this idead and added the following scripts
1. `npm run dev`: uses the library concurrently to run multiple tasks. However sometimes I do run into some issues. S, I opened up an issue to include a taskrunner/manager in the project.
2. `npm run tailwind:watch`: if necessary adds new classes to the css.
3. `ts:watch`: if necessary transpile the typescript into javascript

## Database connectivity
In this project [Prisma](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma) is used for Object Relation Mapping. It comes with all kind of utilities as models, seeds and migrations.

## API interfaces
In the `utils/interfaces.ts` file you can find the interfaces from a external API that is being used