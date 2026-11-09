import { integer, text, primaryKey, sqliteTable } from 'drizzle-orm/sqlite-core'; // SQLite does not support the DATE type
import { InferInsertModel } from 'drizzle-orm';

export namespace Tables {
  export const countryVisits = sqliteTable('CountryVisits', {
    countryCode: text('country_code').primaryKey(),
    countryName: text('country_name').notNull(),
    visitorCount: integer('visitor_count').notNull().default(1)
  });

  export const stateVisits = sqliteTable('StateVisits', {
    stateAbbr: text('state_abbr').primaryKey(),
    stateName: text('state_name').notNull(),
    visitorCount: integer('visitor_count').notNull().default(1)
  });

  export const uniqueVisitors = sqliteTable('UniqueVisitors', {
    ipAddress: text('ip_address').primaryKey(),
    firstVisitDate: text('first_visit_date').notNull(),
    countryCode: text('country_code').notNull(),
    countryName: text('country_name').notNull(),
    regionName: text('region_name').notNull()
  });

  export const visitLogs = sqliteTable('VisitLogs', {
    ipAddress: text('ip_address').references(() => uniqueVisitors.ipAddress),
    visitDate: text('visit_date'),
    pageVisits: text('page_visits')
  }, (table) => {
    return {
      pk: primaryKey({ columns: [table.ipAddress, table.visitDate] })
    };
  });

  export const wastewater = sqliteTable('Wastewater', {
    name: text('name').primaryKey(),
    displayName: text('display_name'),
    coords: text('coords').notNull()
  });
}

export namespace Models {
  export type UniqueVisitor = InferInsertModel<typeof Tables.uniqueVisitors>;
  export type VisitLogs = InferInsertModel<typeof Tables.visitLogs>;
  export type CountryVisits = InferInsertModel<typeof Tables.countryVisits>;
  export type StateVisits = InferInsertModel<typeof Tables.stateVisits>;
  export type Wastewater = InferInsertModel<typeof Tables.wastewater>;
}
