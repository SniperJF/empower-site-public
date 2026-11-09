import axios from 'axios';
import iso_3166_1 from 'iso-3166-1';
import iso_3166_2 from 'iso-3166-2';
import { addUniqueVisitor, addVisitLog, getPageVisits, getUniqueVisitor, getVisitLog, updatePageVisits } from '../database/helpers/visitor.js';
import { addCountryVisitsRow, addStateVisitsRow, getCountryVisitsRow, getStateVisitsRow, incrementCountryVisitorCount, incrementStateVisitorCount } from '../database/helpers/visit-geolocation.js';
import { PageVisits } from '../types';
import normalizeIpAddress from './normalize-ip.js';

const handleUniqueVisitor = async (ip: string, date: string) => {
  // Match an existing unique visitor if they exist
  const visitor = await getUniqueVisitor(ip);

  // Add visitor to UniqueVisitors if they do not yet exist in the database
  if (visitor) return;

  try {
    const res = await axios.get(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_API_TOKEN}`);
    const visitorData = res.data;

    // Force "Washington, D.C." to be stored as "District of Columbia"
    if (visitorData.region === 'Washington, D.C.') visitorData.region = 'District of Columbia';
    console.log(visitorData);

    // Stop if a bogon IP address is received
    if (visitorData.bogon) return;

    // Populate the visitor's geographic data from visitorData
    const countryAlpha2 = visitorData.country; // The country property is stored as an alpha 2 country code
    const country = iso_3166_1.whereAlpha2(countryAlpha2);
    const countryAlpha3 = country.alpha3;
    const countryName = country.country;
    const regionName = visitorData.region;

    // Add the visitor to the database
    addUniqueVisitor({
      ipAddress: ip,
      firstVisitDate: date,
      countryCode: countryAlpha3,
      countryName: countryName,
      regionName: regionName,
    });

    // Increment the geographical visitor count accordingly
    if (countryAlpha3 === 'USA') {
      // If the visitor is from the US, use StateVisit-related functions
      const stateAbbreviation = iso_3166_2.subdivision(countryAlpha3, regionName).regionCode;

      if ((await getStateVisitsRow(stateAbbreviation))) {
        incrementStateVisitorCount(stateAbbreviation);
      } else {
        // Insert the state if it doesn't exist, otherwise update the view count
        addStateVisitsRow(regionName, stateAbbreviation);
      }
    } else {
      // Otherwise, use CountryVisit-related functions
      if ((await getCountryVisitsRow(countryAlpha3))) {
        incrementCountryVisitorCount(countryAlpha3);
      } else {
        addCountryVisitsRow(countryName, countryAlpha3);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

const handleVisitorVisit = async (ip: string, date: string, pageUrl: string) => {
  // Match an existing unique visitor if they exist
  const visitor = await getUniqueVisitor(ip);

  // Stop if a unique visitor with the IP address does not exist since it is a foreign key
  if (!visitor) return;

  // Check if the visitor already has a visit log for today
  const visitLog = await getVisitLog(ip, date);

  if (!visitLog) {
    // If the visitor does not have a visit log for today, add a new visit log
    await addVisitLog(ip, date);
  }

  const visitsString = await getPageVisits(ip, date);
  const visits = JSON.parse(visitsString) as PageVisits;

  if (visits[pageUrl] !== undefined) {
    visits[pageUrl] += 1;
  } else {
    visits[pageUrl] = 1;
  }
  updatePageVisits(ip, date, JSON.stringify(visits));
}

export async function handlePageVisit(ip: string, pageUrl: string) {
  const today = new Date().toISOString().slice(0, 10);
  
  ip = await normalizeIpAddress(ip);
  await handleUniqueVisitor(ip, today); // Log the visitor if they have not visited before
  await handleVisitorVisit(ip, today, pageUrl); // Log the visit
}
