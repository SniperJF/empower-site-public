import { Request, Response } from 'express';
import { getUniqueVisitorsinDateRange } from '../database/helpers/visitor.js';
import { getAllCountryVisitsRows, getAllStateVisitsRows } from '../database/helpers/visit-geolocation.js'
import { Models } from '../database/schema.js'

export const getSiteVisitSummary = async (req: Request, res: Response) => {
  const formatDate = (date: Date) => { return date.toISOString().slice(0, 10); }
  const today = new Date();
  const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const currentWeekData = await getUniqueVisitorsinDateRange(formatDate(sevenDaysAgo), formatDate(today));
  const previousWeekData = await getUniqueVisitorsinDateRange(formatDate(fourteenDaysAgo), formatDate(sevenDaysAgo));
  const monthData = await getUniqueVisitorsinDateRange(formatDate(firstDayOfCurrentMonth), formatDate(lastDayOfCurrentMonth));

  res.status(200).json({ currentWeekData, previousWeekData, monthData });
}
  
export const getSiteVisitsByDateRange = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query as { startDate: string, endDate: string };
  const visitsInDateRange = await getUniqueVisitorsinDateRange(startDate, endDate);
  
  res.status(200).json(visitsInDateRange);
}

export const getSiteVisitsByCountry = async (req: Request, res: Response) => {
  const stateViews = await getAllCountryVisitsRows() as unknown as Models.CountryVisits[];

  res.status(200).json(stateViews);
}

export const getSiteVisitsByState = async (req: Request, res: Response) => {
  const countryViews = await getAllStateVisitsRows() as unknown as Models.StateVisits[];
  
  res.status(200).json(countryViews);
}
