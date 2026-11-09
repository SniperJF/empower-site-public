import { and, between, eq } from 'drizzle-orm';
import { Models, Tables } from '../schema.js'
import db from '../db.js';

// Database functions for unique visitors
export const addUniqueVisitor = async (visitor: Models.UniqueVisitor): Promise<Models.UniqueVisitor | undefined> => {
  try {
    const uniqueVisitors = Tables.uniqueVisitors;
    const rows = await db
      .insert(uniqueVisitors)
      .values(visitor)
      .returning();
    return rows[0]; // Return the only row being inserted
  } catch (error) {
    console.error('UniqueVisitor - error inserting UniqueVisitor row:', error.message);
    throw error;
  }
}

export const getUniqueVisitor = async (ipAddress: string): Promise<Models.UniqueVisitor | undefined> => {
  try {
    const uniqueVisitors = Tables.uniqueVisitors;
    const rows = await db
      .select()
      .from(uniqueVisitors)
      .where(eq(uniqueVisitors.ipAddress, ipAddress));
    return rows[0]; // ipAddress is the primary key so only one row will exist
  } catch (error) {
    console.error('UniqueVisitor - error selecting UniqueVisitor row matching ipAddress', error.message);
    throw error;
  }
}

export const getUniqueVisitorsByDate = async (visitDate: string): Promise<Models.UniqueVisitor[] | undefined> => {
  try {
    const uniqueVisitors = Tables.uniqueVisitors;
    const rows = await db
      .select()
      .from(uniqueVisitors)
      .where(eq(uniqueVisitors.firstVisitDate, visitDate));
    return rows;
  } catch (error) {
    console.error('UniqueVisitor - error selecting UniqueVisitor rows matching firstVisitDate:', error.message);
    throw error;
  }
}

export const getUniqueVisitorsinDateRange = async (startDate: string, endDate: string): Promise<Models.UniqueVisitor[] | undefined> => {
  try {
    const uniqueVisitors = Tables.uniqueVisitors;
    const rows = await db
      .select()
      .from(uniqueVisitors)
      .where(
        between(uniqueVisitors.firstVisitDate, startDate, endDate)
      );
    return rows;
  } catch (error) {
    console.error('UniqueVisitor - error selecting UniqueVisitor rows matching firstVisitDate', error.message);
    throw error;
  }
}

// Database functions for visit logs
export const addVisitLog = async (ipAddress: string, visitDate: string): Promise<Models.VisitLogs | undefined> => {
  try {
    const visitLog = Tables.visitLogs;
    const rows = await db
      .insert(visitLog)
      .values({
        ipAddress: ipAddress,
        visitDate: visitDate,
        pageVisits: '{}'
      })
      .returning();
    return rows[0]; // Return the only row being inserted
  } catch (error) {
    console.error('VisitLog - error selecting visitCount row:', error.message);
    throw error;
  }
}

export const getVisitLog = async (ipAddress: string, visitDate: string): Promise<Models.VisitLogs | undefined> => {
  try {
    const visitLog = Tables.visitLogs;
    const rows = await db
      .select()
      .from(visitLog)
      .where(
        and(
          eq(visitLog.ipAddress, ipAddress),
          eq(visitLog.visitDate, visitDate)
        )
      );
    return rows[0]; // ipAddress and visitDate are the primary keys so only one row will exist
  } catch (error) {
    console.error('VisitLog - error selecting visitCount row matching ipAddress and visitDate', error.message);
    throw error;
  }
}

export const getPageVisits = async (ipAddress: string, visitDate: string): Promise<string | undefined> => {
  try {
    const visitLog = Tables.visitLogs;
    const rows = await db
      .select()
      .from(visitLog)
      .where(
        and(
          eq(visitLog.ipAddress, ipAddress),
          eq(visitLog.visitDate, visitDate)
        )
      );
    return rows[0].pageVisits; // ipAddress and visitDate are the primary keys so only one row will exist
  } catch (error) {
    console.error('VisitLog - error selecting pageVisits row matching ipAddress and visitDate', error.message);
    throw error;
  }
}

export const updatePageVisits = async (ipAddress: string, visitDate: string, pageVisits: string): Promise<string | null> => {
  try {
    const visitLog = Tables.visitLogs;
    const rows = await db
      .update(visitLog)
      .set({ pageVisits: pageVisits.toString() })
      .where(
        and(
          eq(visitLog.ipAddress, ipAddress),
          eq(visitLog.visitDate, visitDate)
        )
      )
      .returning({ pageVisits: visitLog.pageVisits });
    return rows[0] ? rows[0].pageVisits : null; // countryCode is the primary key so only one row will exist
  } catch (error) {
    console.error('VisitLog - error updating pageVisits row:', error.message);
    throw error;
  }
}
