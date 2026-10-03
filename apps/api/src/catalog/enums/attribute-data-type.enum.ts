/**
 * Supported value shapes for a catalog attribute. Keeping this explicit lets the
 * attribute engine power spec tables, dynamic filters and seller forms without
 * any category-specific branching.
 */
export enum AttributeDataType {
  /** Free text (e.g. Socket "LGA1700", Model "RTX 4060"). */
  TEXT = 'TEXT',
  /** Numeric value (e.g. Cores 10, TDP 65). */
  NUMBER = 'NUMBER',
  /** True/false flag (e.g. HDR, WiFi, RGB). */
  BOOLEAN = 'BOOLEAN',
  /** Single choice from a controlled option list (e.g. Panel Type, Brand). */
  SELECT = 'SELECT',
  /** Multiple choices from a controlled option list (e.g. Ports). */
  MULTI_SELECT = 'MULTI_SELECT',
  /** Numeric range (e.g. Screen Size 24-27). */
  RANGE = 'RANGE',
  /** Calendar date (e.g. release date, warranty start). */
  DATE = 'DATE',
}
