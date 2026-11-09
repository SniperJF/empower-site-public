import { eq, sql } from 'drizzle-orm';
import { Models, Tables } from '../schema.js'
import db from '../db.js';

// Database functions for unique visitor counts across US states
export const addStateVisitsRow = async (stateName: string, stateAbbr: string): Promise<Models.StateVisits | undefined> => {
  try {
    const stateVisits = Tables.stateVisits;
    const rows = await db
      .insert(stateVisits)
      .values({
        stateName: stateName,
        stateAbbr: stateAbbr,
        visitorCount: 1
      })
      .returning();
    return rows[0]; // Return the only row being inserted
  } catch (error) {
    console.error('StateVisits - error inserting StateVisits row:', error.message);
    throw error;
  }
}

export const getStateVisitsRow = async (stateAbbr: string): Promise<Models.StateVisits | undefined> => {
  try {
    const stateVisits = Tables.stateVisits;
    const rows = await db
      .select()
      .from(stateVisits)
      .where(eq(stateVisits.stateAbbr, stateAbbr));
    return rows[0]; // stateAbbr is the primary key so only one row will exist
  } catch (error) {
    console.error('StateVisits - error selecting StateVisits row matching stateAbbr:', error.message);
    throw error;
  }
}

export const getAllStateVisitsRows = async (): Promise<Models.StateVisits[] | undefined> => {
  try {
    const stateVisits = Tables.stateVisits;
    const rows = await db
      .select()
      .from(stateVisits)
    return rows;
  } catch (error) {
    console.error('StateVisits - error selecting StateVisits rows:', error.message);
    throw error;
  }
}

export const incrementStateVisitorCount = async (stateAbbr: string): Promise<number | null> => {
  try {
    const stateVisits = Tables.stateVisits;
    const rows = await db
      .update(stateVisits)
      .set({ visitorCount: sql`${stateVisits.visitorCount} + 1` })
      .where(eq(stateVisits.stateAbbr, stateAbbr))
      .returning({ visitorCount: stateVisits.visitorCount });
    return rows[0] ? rows[0].visitorCount : null; // stateAbbr is the primary key so only one row will exist
  } catch (error) {
    console.error('StateVisits - error updating StateVisits row:', error.message);
    throw error;
  }
}

// Database functions for unique visitor counts across countries
export const addCountryVisitsRow = async (countryName: string, countryCode: string): Promise<Models.CountryVisits | undefined> => {
  try {
    const countryVisits = Tables.countryVisits;
    const rows = await db
      .insert(countryVisits)
      .values({
        countryName: countryName,
        countryCode: countryCode,
        visitorCount: 1
      })
      .returning();
    return rows[0]; // Return the only row being inserted
  } catch (error) {
    console.error('CountryVisits - error inserting CountryVisits row:', error.message);
    throw error;
  }
}

export const getCountryVisitsRow = async (countryCode: string): Promise<Models.CountryVisits | undefined> => {
  try {
    const countryVisits = Tables.countryVisits;
    const rows = await db
      .select()
      .from(countryVisits)
      .where(eq(countryVisits.countryCode, countryCode));
    return rows[0]; // countryCode is the primary key so only one row will exist
  } catch (error) {
    console.error('CountryVisits - error selecting CountryVisits row matching countryCode:', error.message);
    throw error;
  }
}

export const getAllCountryVisitsRows = async (): Promise<Models.CountryVisits[] | undefined> => {
  try {
    const countryVisits = Tables.countryVisits;
    const rows = await db
      .select()
      .from(countryVisits)
    return rows;
  } catch (error) {
    console.error('CountryVisits - error selecting CountryVisits rows:', error.message);
    throw error;
  }
}

export const incrementCountryVisitorCount = async (countryCode: string): Promise<number | null> => {
  try {
    const countryVisits = Tables.countryVisits;
    const rows = await db
      .update(countryVisits)
      .set({ visitorCount: sql`${countryVisits.visitorCount} + 1` })
      .where(eq(countryVisits.countryCode, countryCode))
      .returning({ visitorCount: countryVisits.visitorCount });
    return rows[0] ? rows[0].visitorCount : null; // countryCode is the primary key so only one row will exist
  } catch (error) {
    console.error('CountryVisits - error updating CountryVisits row:', error.message);
    throw error;
  }
}
