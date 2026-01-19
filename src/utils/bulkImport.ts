import { supabase } from '@/lib/supabase';
import { toast } from '@/components/alert';
import { Department } from '@/types/department';
import { ParsedUserRow, ValidationResult, ImportResult } from '@/types/bulk_imports';

/**
 * Parse CSV content into user rows
 * Expects columns: Name, Department
 */
export const parseCSV = (csvContent: string): ParsedUserRow[] => {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');

  if (lines.length < 2) {
    throw new Error('CSV file must have a header row and at least one data row');
  }

  // Parse header to find column indices
  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const nameIndex = header.findIndex(h => h === 'name');
  const departmentIndex = header.findIndex(h => h === 'department');

  if (nameIndex === -1) {
    throw new Error('CSV must have a "Name" column');
  }
  if (departmentIndex === -1) {
    throw new Error('CSV must have a "Department" column');
  }

  // Parse data rows
  const users: ParsedUserRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted values with commas
    const values = parseCSVLine(line);

    const name = values[nameIndex]?.trim().replace(/"/g, '') || '';
    const department = values[departmentIndex]?.trim().replace(/"/g, '') || '';

    if (name) {
      users.push({
        name,
        department,
        rowNumber: i + 1 // 1-based row number for user feedback
      });
    }
  }

  return users;
};

/**
 * Parse a single CSV line handling quoted values
 */
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

/**
 * Validate parsed users against existing departments
 */
export const validateUsers = (
  users: ParsedUserRow[],
  departments: Department[]
): ValidationResult => {
  const validUsers: ParsedUserRow[] = [];
  const invalidUsers: { row: ParsedUserRow; error: string }[] = [];

  const departmentNames = departments.map(d => d.name.toLowerCase());
  const departmentMap = new Map<string, Department>();
  departments.forEach(d => departmentMap.set(d.name.toLowerCase(), d));

  for (const user of users) {
    const errors: string[] = [];

    // Check name
    if (!user.name || user.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    // Check department exists
    if (!user.department) {
      errors.push('Department is required');
    } else if (!departmentNames.includes(user.department.toLowerCase())) {
      errors.push(`Department "${user.department}" does not exist in the system`);
    }

    if (errors.length > 0) {
      invalidUsers.push({
        row: user,
        error: errors.join('; ')
      });
    } else {
      validUsers.push(user);
    }
  }

  return { valid: validUsers, invalid: invalidUsers };
};

/**
 * Bulk create users in the database
 */
export const bulkCreateUsers = async (
  users: ParsedUserRow[],
  departments: Department[]
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: []
  };

  // Create department name to ID map
  const departmentMap = new Map<string, string>();
  departments.forEach(d => departmentMap.set(d.name.toLowerCase(), d.id));

  // Insert users one by one to track individual errors
  for (const user of users) {
    try {
      const departmentId = departmentMap.get(user.department.toLowerCase());

      if (!departmentId) {
        result.failed++;
        result.errors.push(`Row ${user.rowNumber}: Department "${user.department}" not found`);
        continue;
      }

      const { error } = await supabase
        .from('users')
        .insert({
          name: user.name,
          department: departmentId,
          created_at: new Date().toISOString()
        });

      if (error) {
        result.failed++;
        result.errors.push(`Row ${user.rowNumber}: ${error.message}`);
      } else {
        result.success++;
      }
    } catch (error: any) {
      result.failed++;
      result.errors.push(`Row ${user.rowNumber}: ${error.message || 'Unknown error'}`);
    }
  }

  return result;
};

/**
 * Generate CSV template content
 */
export const generateCSVTemplate = (departments: Department[]): string => {
  const header = 'Name,Department';
  const exampleRows = [
    'John Doe,Engineering',
    'Jane Smith,Marketing',
    'Bob Johnson,Finance'
  ];

  // Add department list as comments
  const departmentList = departments.map(d => d.name).join(', ');
  const instructions = [
    '',
    '',
    '# INSTRUCTIONS:',
    '# 1. Fill in the Name and Department columns above',
    '# 2. Department must match one of the existing departments in the system',
    '# 3. Delete these instruction lines before uploading',
    '# 4. Save the file and upload it',
    '# Note: The list above are examples', 
    '#',
    '# Available Departments:',
    `# ${departmentList || 'No departments found - please create departments first'}`,
  ];

  return [header, ...exampleRows, ...instructions].join('\n');
};

/**
 * Download CSV template file
 */
export const downloadCSVTemplate = (departments: Department[]): void => {
  const content = generateCSVTemplate(departments);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'user_import_template.csv';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
  toast.success('Template downloaded successfully');
};

/**
 * Read file content as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};
