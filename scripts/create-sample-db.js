// Builds SampleData.sqlite: an empty copy of the production schema filled with
// synthetic visitor analytics so the site can be run locally.
//
// No real visitor data is included. IP addresses are drawn from the RFC 5737
// documentation ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24), which
// are reserved and never routed on the public internet.
//
// Usage: node scripts/create-sample-db.js [output-path]

import fs from 'fs';
import Database from 'better-sqlite3';

const outPath = process.argv[2] || 'SampleData.sqlite';
if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

const db = new Database(outPath);

// Mirrors src/database/schema.ts
db.exec(`
  CREATE TABLE CountryVisits (
    country_code TEXT PRIMARY KEY,
    country_name TEXT NOT NULL,
    visitor_count INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE StateVisits (
    state_abbr TEXT PRIMARY KEY,
    state_name TEXT NOT NULL,
    visitor_count INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE UniqueVisitors (
    ip_address TEXT PRIMARY KEY,
    first_visit_date TEXT NOT NULL,
    country_code TEXT NOT NULL,
    country_name TEXT NOT NULL,
    region_name TEXT NOT NULL
  );
  CREATE TABLE VisitLogs (
    ip_address TEXT REFERENCES UniqueVisitors(ip_address),
    visit_date TEXT,
    page_visits TEXT,
    PRIMARY KEY (ip_address, visit_date)
  );
  CREATE TABLE Wastewater (
    name TEXT PRIMARY KEY,
    display_name TEXT,
    coords TEXT NOT NULL
  );
`);

// Small deterministic PRNG so the sample file is reproducible
let seed = 20220320;
const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const states = [
  ['NV', 'Nevada', 40], ['CA', 'California', 15], ['AZ', 'Arizona', 6], ['UT', 'Utah', 4],
  ['TX', 'Texas', 4], ['NY', 'New York', 3], ['WA', 'Washington', 2], ['FL', 'Florida', 2],
  ['CO', 'Colorado', 2], ['IL', 'Illinois', 1], ['OR', 'Oregon', 1], ['GA', 'Georgia', 1],
];
const countries = [
  ['CAN', 'Canada', 3], ['MEX', 'Mexico', 2], ['GBR', 'United Kingdom', 2], ['DEU', 'Germany', 1],
  ['IND', 'India', 1], ['KOR', 'Korea, Republic of', 1], ['BRA', 'Brazil', 1], ['AUS', 'Australia', 1],
];

const regions = [
  ...states.flatMap(([abbr, name, w]) => Array(w).fill({ us: true, abbr, name })),
  ...countries.flatMap(([code, name, w]) => Array(w).fill({ us: false, code, name })),
];
const pages = ['/', '/about', '/media', '/recdrugs'];
const prefixes = ['192.0.2', '198.51.100', '203.0.113'];

const insertVisitor = db.prepare('INSERT INTO UniqueVisitors VALUES (?, ?, ?, ?, ?)');
const insertLog = db.prepare('INSERT OR IGNORE INTO VisitLogs VALUES (?, ?, ?)');
const bumpState = db.prepare(`INSERT INTO StateVisits VALUES (?, ?, 1)
  ON CONFLICT(state_abbr) DO UPDATE SET visitor_count = visitor_count + 1`);
const bumpCountry = db.prepare(`INSERT INTO CountryVisits VALUES (?, ?, 1)
  ON CONFLICT(country_code) DO UPDATE SET visitor_count = visitor_count + 1`);

// Spread visitors over the 90 days before today so the admin
// dashboard's "this week" / "this month" cards have something to show
const today = new Date();
const daysAgo = (n) => new Date(today.getTime() - n * 86400000).toISOString().slice(0, 10);

db.transaction(() => {
  let n = 0;
  for (const prefix of prefixes) {
    for (let host = 1; host <= 254; host += 1) {
      if (n >= 600) return;
      const ip = `${prefix}.${host}`;
      const r = pick(regions);
      const firstVisit = Math.floor(rand() * 90);

      if (r.us) {
        insertVisitor.run(ip, daysAgo(firstVisit), 'USA', 'United States of America', r.name);
        bumpState.run(r.abbr, r.name);
      } else {
        insertVisitor.run(ip, daysAgo(firstVisit), r.code, r.name, '');
        bumpCountry.run(r.code, r.name);
      }

      // One to three days of activity per visitor
      const days = 1 + Math.floor(rand() * 3);
      for (let d = 0; d < days; d += 1) {
        const visits = { [pick(pages)]: 1 + Math.floor(rand() * 4) };
        insertLog.run(ip, daysAgo(Math.max(firstVisit - d * 7, 0)), JSON.stringify(visits));
      }
      n += 1;
    }
  }
})();

const count = (t) => db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get().c;
console.log(`Created ${outPath}: ${count('UniqueVisitors')} visitors, ` +
  `${count('VisitLogs')} visit logs, ${count('StateVisits')} states, ${count('CountryVisits')} countries`);
db.close();
