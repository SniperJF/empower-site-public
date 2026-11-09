import { Models, Tables } from '../schema.js';
import db from '../db.js';

// Database functions for wastewater data
export const addWastewaterEntry = async (wastewaterEntry: Models.Wastewater): Promise<void> => {
  // Example of object passed in
  // { name: "abc", display_name: "2", coords: "[1.1,1.2]" }
  // Incomplete, update as needed

  try {
    await db
      .insert(Tables.wastewater)
      .values(wastewaterEntry)
      .returning();
  } catch (error) {
    console.error('Wastewater - error inserting Wastewater row:', error.message);
    throw error;
  }
}
