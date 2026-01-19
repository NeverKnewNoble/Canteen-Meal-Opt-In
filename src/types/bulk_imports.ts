// Interface for parsed CSV row
export interface ParsedUserRow {
  name: string;
  department: string;
  rowNumber: number;
}

// Interface for validation result
export interface ValidationResult {
  valid: ParsedUserRow[];
  invalid: {
    row: ParsedUserRow;
    error: string;
  }[];
}

// Interface for import result
export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}