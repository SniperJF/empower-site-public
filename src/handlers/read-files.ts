import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function readFile(path: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', function (error, data) {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
}

export async function uploadCovidData(req: Request, res: Response) {
  const data = req.body;
  let points;
  let labels;

  // Respond with an unauthorized status if the entered password is incorrect
  if (req.body.password != process.env.DASHBOARD_PASSWORD) return res.sendStatus(401);
  
  // Paths for data.js and labels.js
  const covidDataPath = path.join(__dirname, 'public/assets/js/data.js');
  const covidLabelsPath = path.join(__dirname, 'public/assets/js/labels.js');

  // Replace data JS object files    
  let covidData = await readFile(covidDataPath) as string;
  covidData = covidData.toString().replace('const points = ', '');
  points = JSON.parse(covidData);
  
  let covidLabels = await readFile(covidLabelsPath) as string;
  covidLabels = covidLabels.toString().replace('const labels = ', '');
  labels = JSON.parse(covidLabels);

  // Parse uploaded data
  const type = data.header[0];
  const dates = data.data[0];

  // This syncs the dates based off the case count CSV file
  if (dates.length > labels.length && dates[0] == labels[0]) labels = dates;

  // Update each column
  points.forEach((p: any) => {
    const i = data.header.indexOf(p.name);
    p[type] = data.data[i];
  });

  // Write to data.js and labels.js to display data on the public site
  fs.writeFile(covidDataPath, 'const points = ' + JSON.stringify(points), (error) => {
    if (error) throw error;
  });
  fs.writeFile(covidLabelsPath, 'const labels = ' + JSON.stringify(labels), (error) => {
    if (error) throw error;
  });
  
  // Respond with a successful status so the page knows to refresh
  res.sendStatus(200);
}

export async function uploadVariantData(req: Request, res: Response) {
  var data = req.body 
  // console.log(data);

  // Respond with an unauthorized status if the entered password is incorrect
  if (req.body.password != process.env.DASHBOARD_PASSWORD) return res.sendStatus(401);

  var header = data.header;
  var percents = data.data;

  // Path to data and labels
  const variantDataPath = path.join(__dirname, 'public/assets/js/variant.csv');
  const arrayToCSV = (arr: any[], delimiter = ',') => {
    arr.map((v: any) =>
      v.map((x: any ) =>
        (isNaN(x) ? `"${x.replace(/"/g, '""')}"` : x)).join(delimiter)).join('\n');
  }

  var csvStuff = header.toString() + "\n" + arrayToCSV(percents);
  console.log(csvStuff);

  fs.writeFile(variantDataPath, csvStuff, (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log('CSV file saved successfully');
    }
  })
      
  // Respond with a successful status so the page knows to refresh
  res.sendStatus(200);
}

export async function local_check(req: Request, res: Response) {
  const url = process.env.ENV_URL;
  res.send({ data: url });
}
