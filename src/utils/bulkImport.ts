import { apiFetch } from '@/utils/api-client';
import { toast } from '@/components/alert';
import { Department } from '@/types/department';
import { ParsedUserRow, ValidationResult, ImportResult } from '@/types/bulk_imports';

/**
 * Parse CSV content into user rows
 * Expects columns: Name, Department
 */
export const parseCSV = (csvContent: string): ParsedUserRow[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim() !== '');

  if (lines.length < 2) {
    throw new Error('CSV file must have a header row and at least one data row');
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
  const nameIndex = header.findIndex((h) => h === 'name');
  const departmentIndex = header.findIndex((h) => h === 'department');

  if (nameIndex === -1) {
    throw new Error('CSV must have a "Name" column');
  }
  if (departmentIndex === -1) {
    throw new Error('CSV must have a "Department" column');
  }

  const users: ParsedUserRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);

    const name = values[nameIndex]?.trim().replace(/"/g, '') || '';
    const department = values[departmentIndex]?.trim().replace(/"/g, '') || '';

    if (name) {
      users.push({
        name,
        department,
        rowNumber: i + 1,
      });
    }
  }

  return users;
};

const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];

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

export const validateUsers = (
  users: ParsedUserRow[],
  departments: Department[]
): ValidationResult => {
  const validUsers: ParsedUserRow[] = [];
  const invalidUsers: { row: ParsedUserRow; error: string }[] = [];

  const departmentNames = departments.map((d) => d.name.toLowerCase());

  for (const user of users) {
    const errors: string[] = [];

    if (!user.name || user.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!user.department) {
      errors.push('Department is required');
    } else if (!departmentNames.includes(user.department.toLowerCase())) {
      errors.push(`Department "${user.department}" does not exist in the system`);
    }

    if (errors.length > 0) {
      invalidUsers.push({
        row: user,
        error: errors.join('; '),
      });
    } else {
      validUsers.push(user);
    }
  }

  return { valid: validUsers, invalid: invalidUsers };
};

export const bulkCreateUsers = async (
  users: ParsedUserRow[],
  departments: Department[]
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  const departmentMap = new Map<string, string>();
  departments.forEach((d) => departmentMap.set(d.name.toLowerCase(), d.id));

  const rows: { name: string; departmentId: string; rowNumber: number }[] = [];
  for (const user of users) {
    const departmentId = departmentMap.get(user.department.toLowerCase());
    if (!departmentId) {
      result.failed++;
      result.errors.push(
        `Row ${user.rowNumber}: Department "${user.department}" not found`
      );
      continue;
    }
    rows.push({ name: user.name, departmentId, rowNumber: user.rowNumber });
  }

  if (rows.length === 0) {
    return result;
  }

  try {
    const { errors } = await apiFetch<{ errors: { rowNumber: number; message: string }[] }>(
      '/api/users/bulk',
      {
        method: 'POST',
        body: JSON.stringify({ rows }),
      }
    );
    result.success = rows.length - errors.length;
    result.failed += errors.length;
    for (const e of errors) {
      result.errors.push(`Row ${e.rowNumber}: ${e.message}`);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bulk import failed';
    result.failed += rows.length;
    result.errors.push(msg);
  }

  return result;
};

export const generateCSVTemplate = (departments: Department[]): string => {
  const header = 'Name,Department';
  const exampleRows = ['John Doe,Engineering', 'Jane Smith,Marketing', 'Bob Johnson,Finance'];

  const departmentList = departments.map((d) => d.name).join(', ');
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
