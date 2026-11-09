# Nevada EMPOWER Website
This repository is a Node.js server hosting the program's website, [empower.unlv.edu](https://empower.unlv.edu), which displays data about viral counts and emerging variants of the SARS-CoV-2 virus collected through wastewater surveillance across Nevada. A second dashboard reports concentrations of 17 recreational and prescription drug markers measured in Southern Nevada wastewater.

The website was created by Ryan Backman, Shizhao Wang, Alleyn Murphy, and Justin Negron under the supervision of Dr. Jorge Fonseca. See [Credits](#credits) for everyone who contributed.

> **About this repository**: This is the public release of the site's source code. It was prepared from the private development repository, which has been in use since March 2022. Deployment credentials, visitor analytics, and data from sampling sites covered by data-sharing agreements have been removed. The commit history isn't included because it contains production configuration.

<br>

## How It Works

The site is deliberately simple: static HTML pages with client-side charts and maps, served by a small Express server written in TypeScript.

```
Browser ──► Express (HTTPS)
             ├── /, /about, /media, /recdrugs   public pages (public/*.html)
             ├── /assets/...                     static files: JS data files, images, vendor libraries
             ├── /contact                        contact form → reCAPTCHA check → email via nodemailer
             ├── /site-visits/...                JSON API for the visitor map and admin dashboard
             └── /admin, /admin/wastewater       password-protected admin dashboard (Basic auth → JWT cookie)
                    │
                    └── SQLite (better-sqlite3 + Drizzle ORM): unique visitors, daily visit logs, per-state/per-country counts
```

**Surveillance data is served as plain JavaScript files** rather than through a database or API. Each page loads the data files with `<script>` tags, and the charts ([Chart.js](https://www.chartjs.org/)) and maps ([OpenLayers](https://openlayers.org/)) render entirely in the browser. That way the server doesn't need to store the surveillance data at all. To update the data, you replace the files. The admin dashboard has an upload form for this.

**Visitor analytics** are collected by a middleware (`src/handlers/middleware/log-page-visit.ts`) that runs on every page request. A visitor's IP address is looked up once with [IPinfo](https://ipinfo.io/) to get their country and region. Each day's page views are logged per visitor, and running totals per US state and per country feed the "Visitors" map on the home page.

<br>

## Repository Layout

```
config/            drizzle-kit config and the .env file (not committed; see .env.example)
public/            everything the browser can see
  *.html           the public pages
  assets/js/       page scripts and the data files described below
  assets/vendor/   third-party front-end libraries (Bootstrap, Swiper, etc.)
  empowerDash/     admin dashboard pages (served only after login)
scripts/           create-sample-db.js generates a synthetic database for local use
src/
  server.ts        entry point: middleware, routers, HTTPS server
  routes/          Express routers (public, admin, site-visits API)
  handlers/        request handlers, auth, contact email, visitor logging
  database/        Drizzle schema and query helpers
  api/             site-visits API handlers
```

<br>

## Data Files

All of the surveillance data lives in `public/assets/js/`. Each file declares a single global constant.

| File | Constant | Contents |
|------|----------|----------|
| `data.js` | `points` | One object per sewershed: `name` (short code), `display` (label), `coord` (`[longitude, latitude]`), `wastewater` (log10 SARS-CoV-2 gene copies/mL), `cases` (cases per 100,000), `variants` |
| `labels.js` | `labels` | Dates for the values in `data.js`, by array index |
| `dataArchive.js`, `labelsArchive.js` | `pointsArchive`, `labelsArchive` | The same structure for the earlier COVID-19 surveillance period, April 2020 to September 2023 |
| `drugdata.js` | `drugpoints` | One array per drug marker, holding one object per sewershed with `drugname` and `wastewater` (mg/person-day) |
| `drugdatelabels.js`, `drugdatelabelsv2.js` | `drugdatelabels`, `drugdatelabelsv2` | Sampling dates for the drug data (biweekly and daily) |
| `data_template.js`, `drugdata_template.js` | | Empty templates listing every sewershed. They're useful as a starting point when building new data files. |

Values in the `wastewater`, `cases`, and drug arrays line up with the matching labels array by index. `null` means no sample for that date.

`map.js` still filters out any point with an `isinternal` property. Production used that flag for sampling sites that were shown only to project partners. No such points are included here.

<br>

## Setting up the Local Environment

Contributing to the project involves first developing and testing locally before pushing changes to the **main** branch.

<br>

### Installation Prerequisites
Before cloning the project to your local environment, make sure Git, Node.js v20 and npm are installed. OpenSSL is needed to create a local certificate.

<br>

### Cloning the Project
Navigate to the desired parent folder in which you want to create a copy of the repository hosted on GitHub. Then, run the following commands:
```
git clone https://github.com/SniperJF/empower-site-public.git
cd empower-site-public
npm install
```
The command `git clone` copies the remote repository to your local Git directory. Next, running `npm install` is necessary to install package dependencies, i.e. third-party scripts that the repository uses to run.

A shorthand for `npm install` is `npm i`. Make sure to run this command whenever dependencies need to be updated or new ones need to be installed (check whether **package.json** has changed under `dependencies` or `devDependencies` between versions).

<br>

### Creating the **.env** File
Before running the server locally, it is important to consider that the program will try to read in environment variables&mdash;important values declared before runtime that are accessible to the Node environment. The server reads them from **config/.env**. Here we will be storing the program's configuration settings, such as the path of the database and TLS certificates, API tokens, and email server credentials.

> **Important**: Similarly to the **.git** folder, the **.env** file may be hidden in your file manager because files and folders starting with a period are hidden by convention. To display hidden files in Linux, you can use the `ls` command with the `-a` option.

<br>

Copy the example file and edit it as needed:
```
cp config/.env.example config/.env
```

| Variable | Purpose |
|----------|---------|
| `PORT` | Port the HTTPS server listens on |
| `ENV_URL` | Base URL of the site; the admin upload form posts to this address |
| `TLS_CERT_PATH`, `TLS_KEY_PATH` | Paths to the TLS certificate and private key |
| `DB_URL` | Path to the SQLite database (defaults to `./data/db.sqlite`) |
| `ACCESS_TOKEN_SECRET` | Secret used to sign the admin session JWT |
| `DASHBOARD_USERNAME`, `DASHBOARD_PASSWORD` | Admin dashboard login |
| `EMAILSERVER`, `EMAILPASS`, `EMAILROUTEE` | Gmail account (and app password) the contact form sends from, and the address it sends to |
| `IPINFO_API_TOKEN` | Token for [IPinfo](https://ipinfo.io/), used for visitor geolocation |
| `RECAPTCHA_API_TOKEN` | Secret key for [reCAPTCHA](https://developers.google.com/recaptcha/) on the contact form |

The placeholder values in **.env.example** are enough to browse the site locally. Without the IPinfo and reCAPTCHA tokens, the server still runs, but visitor logging and the contact form won't work (the failed IPinfo lookups are logged to the console). The reCAPTCHA site key in **public/home.html** is tied to the production domain, so replace it with your own if you need the contact form.

<br>

### Setting up a TLS Certificate
The server only serves HTTPS, so it needs a certificate and a private key. For local development, a self-signed certificate is fine:
```
mkdir csr-key
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout csr-key/key.pem -out csr-key/cert.pem -subj "/CN=localhost"
```
This creates the paths that **.env.example** already points to. Key and certificate files are excluded by **.gitignore**. Your browser will warn about the self-signed certificate, which is expected locally.

<br>

### Creating the Sample Database
The repository includes **SampleData.sqlite**, a database with the same schema as production and about 600 synthetic visitors, so that the visitor map and admin dashboard have something to display. None of it is real visitor data, and the IP addresses come from ranges reserved for documentation. To regenerate it (the visit dates are relative to the day you run it):
```
npm run sample-db
```
The schema itself is defined in **src/database/schema.ts**.

<br>

### Running the Server
To begin running the server locally, use npm to launch the server using the start script, which compiles the TypeScript in **src/** to **dist/** and then starts it:
```
npm start
```
If the server is running successfully, you should see the following messages in the console:
```
Connected to the database at URL "SampleData.sqlite"
Starting Node.js server...
The server is listening on port 8080
```
To verify that the server is working as intended, type `https://localhost:8080` into the address bar of your web browser. You should now be able to see the homepage. The admin dashboard is at `https://localhost:8080/admin`.

<br>

## Deployment
In production the server runs under [PM2](https://pm2.keymetrics.io/), a process manager for Node.js applications. It will restart the server in the event of an unexpected crash, which keeps the website online with minimal downtime.
```
pm2 start npm --name "empowerserver" -- start   # first-time setup
pm2 ls                                          # check status
pm2 restart empowerserver                       # after pulling changes
```
Remember that whenever **package.json** specifies dependencies that have been installed, updated or deleted, you will need to run `npm install` before restarting the server.

<br>

## Credits
The website was built by students at UNLV under the supervision of Dr. Jorge Fonseca. Ryan Backman, Shizhao Wang, Alleyn Murphy, and Justin Negron created the original site in 2022. Later work includes the TypeScript and database rewrite by Morris Hinton (2024), chart and dashboard updates by Taylor Finelli (2024), and the recreational drug dashboard (2024).

The full Nevada EMPOWER team is listed on the site's [About page](https://empower.unlv.edu/about).

The front end is based on the [Medilab](https://bootstrapmade.com/medilab-free-medical-bootstrap-theme/) template by BootstrapMade. Third-party libraries in `public/assets/vendor/` are under their own licenses.
