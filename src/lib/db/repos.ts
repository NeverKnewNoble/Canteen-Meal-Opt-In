import 'server-only';
import { pool, withTransaction } from './pool';
import type { Menu, MenuMeal, MenuFormData, MenuStatus } from '@/types/menu';
import type { Meal, MealFormData } from '@/types/meal';
import type { User } from '@/types/user';
import type { Department } from '@/types/department';
import type { Selection, SelectionFormData } from '@/types/selection';

/* ---------- row mappers (pg returns Date for timestamptz; date for date) ---------- */

function toIso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'string') return v;
  return String(v);
}

function toDateStr(v: unknown): string {
  if (v instanceof Date) return v.toISOString().split('T')[0];
  if (typeof v === 'string') return v.slice(0, 10);
  return String(v);
}

// Bigint ids come back from pg as strings. NULL means the row's identity
// column never got a value — surface that loudly instead of producing the
// literal string "null", which silently propagates into later inserts.
function requireId(v: unknown, table: string, column = 'id'): string {
  if (v === null || v === undefined || v === '') {
    throw new Error(
      `${table}.${column} is NULL — run docs/migrations/001-bigint-identity-for-app-inserts.sql so identity columns auto-generate.`
    );
  }
  return String(v);
}

function mapDepartment(r: Record<string, unknown>): Department {
  return {
    id: requireId(r.id, 'departments'),
    name: String(r.name),
    created_at: toIso(r.created_at),
  };
}

function mapUser(r: Record<string, unknown>): User {
  return {
    id: requireId(r.id, 'users'),
    name: String(r.name),
    department: requireId(r.department, 'users', 'department'),
    can_self_opt_in: r.can_self_opt_in === undefined ? true : Boolean(r.can_self_opt_in),
    can_bulk_opt_in: r.can_bulk_opt_in === undefined ? false : Boolean(r.can_bulk_opt_in),
  };
}

function mapMeal(r: Record<string, unknown>): Meal {
  return {
    id: requireId(r.id, 'meals'),
    name: String(r.name),
    description: String(r.description ?? ''),
    menu_id: requireId(r.menu_id, 'meals', 'menu_id'),
    created_at: r.created_at ? toIso(r.created_at) : undefined,
  };
}

function mapMenuRow(
  r: Record<string, unknown>,
  meals?: MenuMeal[]
): Menu {
  return {
    id: requireId(r.id, 'menu'),
    name: String(r.name),
    date: toDateStr(r.date),
    deadline: toIso(r.deadline),
    status: String(r.status) as MenuStatus,
    todays_special: r.todays_special ? String(r.todays_special) : null,
    created_at: r.created_at ? toIso(r.created_at) : undefined,
    meals,
  };
}

function mapSelection(r: Record<string, unknown>): Selection {
  return {
    id: requireId(r.id, 'selections'),
    user_id: requireId(r.user_id, 'selections', 'user_id'),
    meal_id: requireId(r.meal_id, 'selections', 'meal_id'),
    opted_in: Boolean(r.opted_in),
    created_at: r.created_at ? toIso(r.created_at) : undefined,
  };
}

/* ---------- departments ---------- */

export async function listDepartments(): Promise<Department[]> {
  const { rows } = await pool.query(
    `SELECT id, name, created_at FROM departments ORDER BY name ASC`
  );
  return rows.map((r) => mapDepartment(r as Record<string, unknown>));
}

export async function createDepartment(name: string): Promise<Department> {
  const { rows } = await pool.query(
    `INSERT INTO departments (name, created_at) VALUES ($1, now()) RETURNING id, name, created_at`,
    [name]
  );
  return mapDepartment(rows[0] as Record<string, unknown>);
}

export async function updateDepartment(
  id: string,
  name: string
): Promise<Department> {
  const { rows } = await pool.query(
    `UPDATE departments SET name = $1 WHERE id = $2 RETURNING id, name, created_at`,
    [name, id]
  );
  return mapDepartment(rows[0] as Record<string, unknown>);
}

export async function deleteDepartment(id: string): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `DELETE FROM selections
         WHERE user_id IN (SELECT id FROM users WHERE department = $1)`,
      [id]
    );
    await client.query(`DELETE FROM users WHERE department = $1`, [id]);
    await client.query(`DELETE FROM departments WHERE id = $1`, [id]);
  });
}

export async function getDepartmentById(
  id: string
): Promise<Department | null> {
  const { rows } = await pool.query(
    `SELECT id, name, created_at FROM departments WHERE id = $1`,
    [id]
  );
  return rows[0] ? mapDepartment(rows[0] as Record<string, unknown>) : null;
}

export async function searchDepartments(q: string): Promise<Department[]> {
  const { rows } = await pool.query(
    `SELECT id, name, created_at FROM departments WHERE name ILIKE $1 ORDER BY name ASC`,
    [`%${q}%`]
  );
  return rows.map((r) => mapDepartment(r as Record<string, unknown>));
}

export async function checkDepartmentExists(
  name: string,
  excludeId?: string
): Promise<boolean> {
  if (excludeId) {
    const { rows } = await pool.query(
      `SELECT id FROM departments WHERE name ILIKE $1 AND id <> $2 LIMIT 1`,
      [name, excludeId]
    );
    return rows.length > 0;
  }
  const { rows } = await pool.query(
    `SELECT id FROM departments WHERE name ILIKE $1 LIMIT 1`,
    [name]
  );
  return rows.length > 0;
}

/* ---------- users ---------- */

export async function listUsers(): Promise<User[]> {
  const { rows } = await pool.query(
    `SELECT id, name, department, can_self_opt_in, can_bulk_opt_in, created_at FROM users ORDER BY created_at DESC`
  );
  return rows.map((r) => mapUser(r as Record<string, unknown>));
}

export async function createUser(
  name: string,
  department: string
): Promise<User> {
  const { rows } = await pool.query(
    `INSERT INTO users (name, department, created_at) VALUES ($1, $2, now())
     RETURNING id, name, department, can_self_opt_in, can_bulk_opt_in, created_at`,
    [name, department]
  );
  return mapUser(rows[0] as Record<string, unknown>);
}

export async function updateUser(
  id: string,
  patch: {
    name?: string;
    department?: string;
    can_self_opt_in?: boolean;
    can_bulk_opt_in?: boolean;
  }
): Promise<User> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (patch.name !== undefined) {
    sets.push(`name = $${i++}`);
    vals.push(patch.name);
  }
  if (patch.department !== undefined) {
    sets.push(`department = $${i++}`);
    vals.push(patch.department);
  }
  if (patch.can_self_opt_in !== undefined) {
    sets.push(`can_self_opt_in = $${i++}`);
    vals.push(patch.can_self_opt_in);
  }
  if (patch.can_bulk_opt_in !== undefined) {
    sets.push(`can_bulk_opt_in = $${i++}`);
    vals.push(patch.can_bulk_opt_in);
  }
  if (sets.length === 0) {
    const u = await getUserById(id);
    if (!u) throw new Error('User not found');
    return u;
  }
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${i} RETURNING id, name, department, can_self_opt_in, can_bulk_opt_in, created_at`,
    vals
  );
  return mapUser(rows[0] as Record<string, unknown>);
}

export async function deleteUser(id: string): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(`DELETE FROM selections WHERE user_id = $1`, [id]);
    await client.query(`DELETE FROM users WHERE id = $1`, [id]);
  });
}

export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await pool.query(
    `SELECT id, name, department, can_self_opt_in, can_bulk_opt_in, created_at FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] ? mapUser(rows[0] as Record<string, unknown>) : null;
}

export async function listUsersByDepartment(
  departmentId: string
): Promise<User[]> {
  const { rows } = await pool.query(
    `SELECT id, name, department, can_self_opt_in, can_bulk_opt_in, created_at FROM users WHERE department = $1 ORDER BY created_at DESC`,
    [departmentId]
  );
  return rows.map((r) => mapUser(r as Record<string, unknown>));
}

export async function searchUsersByName(q: string): Promise<User[]> {
  const { rows } = await pool.query(
    `SELECT id, name, department, can_self_opt_in, can_bulk_opt_in, created_at FROM users WHERE name ILIKE $1 ORDER BY created_at DESC`,
    [`%${q}%`]
  );
  return rows.map((r) => mapUser(r as Record<string, unknown>));
}

export async function bulkInsertUsers(
  rowsInput: { name: string; departmentId: string; rowNumber: number }[]
): Promise<{ rowNumber: number; message: string }[]> {
  const errors: { rowNumber: number; message: string }[] = [];
  const isValidId = (v: unknown): v is string =>
    typeof v === 'string' && /^[1-9][0-9]*$/.test(v);
  for (const row of rowsInput) {
    if (!row.name || !row.name.trim()) {
      errors.push({ rowNumber: row.rowNumber, message: 'Name is required' });
      continue;
    }
    if (!isValidId(row.departmentId)) {
      errors.push({
        rowNumber: row.rowNumber,
        message: `Invalid department id "${row.departmentId}"`,
      });
      continue;
    }
    try {
      await pool.query(
        `INSERT INTO users (name, department, created_at) VALUES ($1, $2::bigint, now())`,
        [row.name, row.departmentId]
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      errors.push({ rowNumber: row.rowNumber, message });
    }
  }
  return errors;
}

/* ---------- menu ---------- */

/** menu.status is plain text (CHECK constraint); ids are bigint */
export async function updateMenusStatus(
  ids: string[],
  status: string
): Promise<void> {
  if (ids.length === 0) return;
  await pool.query(
    `UPDATE menu SET status = $1 WHERE id = ANY($2::bigint[])`,
    [status, ids]
  );
}

export async function setMenuTodaysSpecial(
  menuId: string,
  mealId: string | null
): Promise<Menu> {
  const { rows } = await pool.query(
    `UPDATE menu SET todays_special = $1 WHERE id = $2 RETURNING id, name, date, deadline, status, todays_special, created_at`,
    [mealId, menuId]
  );
  return mapMenuRow(rows[0] as Record<string, unknown>);
}

export async function listMenus(): Promise<Menu[]> {
  const { rows } = await pool.query(
    `SELECT id, name, date, deadline, status, todays_special, created_at FROM menu ORDER BY date DESC`
  );
  return rows.map((r) => mapMenuRow(r as Record<string, unknown>));
}

export async function createMenu(data: MenuFormData): Promise<Menu> {
  const { rows } = await pool.query(
    `INSERT INTO menu (name, date, deadline, status, todays_special, created_at)
     VALUES ($1, $2::date, $3::timestamptz, $4, NULL, now())
     RETURNING id, name, date, deadline, status, todays_special, created_at`,
    [data.name, data.date, data.deadline, data.status]
  );
  return mapMenuRow(rows[0] as Record<string, unknown>);
}

export async function updateMenuRow(
  menuId: string,
  patch: Partial<MenuFormData>
): Promise<Menu> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (patch.name !== undefined) {
    sets.push(`name = $${i++}`);
    vals.push(patch.name);
  }
  if (patch.date !== undefined) {
    sets.push(`date = $${i++}::date`);
    vals.push(patch.date);
  }
  if (patch.deadline !== undefined) {
    sets.push(`deadline = $${i++}::timestamptz`);
    vals.push(patch.deadline);
  }
  if (patch.status !== undefined) {
    sets.push(`status = $${i++}`);
    vals.push(patch.status);
  }
  if (sets.length === 0) {
    const m = await getMenuById(menuId);
    if (!m) throw new Error('Menu not found');
    return m;
  }
  vals.push(menuId);
  const { rows } = await pool.query(
    `UPDATE menu SET ${sets.join(', ')} WHERE id = $${i} RETURNING id, name, date, deadline, status, todays_special, created_at`,
    vals
  );
  return mapMenuRow(rows[0] as Record<string, unknown>);
}

export async function deleteMenuRow(menuId: string): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `DELETE FROM selections
         WHERE meal_id IN (SELECT id FROM meals WHERE menu_id = $1)`,
      [menuId]
    );
    await client.query(`DELETE FROM meals WHERE menu_id = $1`, [menuId]);
    await client.query(`DELETE FROM menu WHERE id = $1`, [menuId]);
  });
}

export async function getMenuById(menuId: string): Promise<Menu | null> {
  const { rows } = await pool.query(
    `SELECT id, name, date, deadline, status, todays_special, created_at FROM menu WHERE id = $1`,
    [menuId]
  );
  return rows[0] ? mapMenuRow(rows[0] as Record<string, unknown>) : null;
}

export async function searchMenus(q: string): Promise<Menu[]> {
  const { rows } = await pool.query(
    `SELECT id, name, date, deadline, status, todays_special, created_at FROM menu WHERE name ILIKE $1 ORDER BY date DESC`,
    [`%${q}%`]
  );
  return rows.map((r) => mapMenuRow(r as Record<string, unknown>));
}

export async function listMenusByStatus(status: string): Promise<Menu[]> {
  const { rows } = await pool.query(
    `SELECT id, name, date, deadline, status, todays_special, created_at FROM menu WHERE status = $1 ORDER BY date DESC`,
    [status]
  );
  return rows.map((r) => mapMenuRow(r as Record<string, unknown>));
}

export async function listMenusByDateRange(
  startDate: string,
  endDate: string
): Promise<Menu[]> {
  const { rows } = await pool.query(
    `SELECT id, name, date, deadline, status, todays_special, created_at
     FROM menu WHERE date >= $1::date AND date <= $2::date ORDER BY date DESC`,
    [startDate, endDate]
  );
  return rows.map((r) => mapMenuRow(r as Record<string, unknown>));
}

type MenuWithMealsRow = Record<string, unknown> & { meals?: MenuMeal[] };

async function fetchMenusWithMeals(whereSql: string, params: unknown[]) {
  const { rows } = await pool.query(
    `SELECT m.id, m.name, m.date, m.deadline, m.status, m.todays_special, m.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', me.id,
            'name', me.name,
            'description', me.description,
            'menu_id', me.menu_id,
            'created_at', me.created_at
          ) ORDER BY me.created_at DESC
        ) FILTER (WHERE me.id IS NOT NULL),
        '[]'
      ) AS meals
     FROM menu m
     LEFT JOIN meals me ON me.menu_id = m.id
     WHERE ${whereSql}
     GROUP BY m.id, m.name, m.date, m.deadline, m.status, m.todays_special, m.created_at
     ORDER BY m.date ASC`,
    params
  );
  return rows as MenuWithMealsRow[];
}

export async function getActiveMenuWithExpiryUpdate(): Promise<Menu | null> {
  const today = new Date().toISOString().split('T')[0];
  const rows = await fetchMenusWithMeals(
    `m.status = 'active' AND m.date >= $1::date`,
    [today]
  );
  if (rows.length === 0) return null;

  const now = new Date();
  const menus = rows.map((r) =>
    mapMenuRow(r, (r.meals as MenuMeal[]) || [])
  );
  const expiredIds = menus
    .filter((m) => m.status === 'active' && new Date(m.deadline) < now)
    .map((m) => m.id);
  if (expiredIds.length > 0) {
    await updateMenusStatus(expiredIds, 'completed');
  }
  const activeMenus = menus.filter(
    (m) => !expiredIds.includes(m.id)
  );
  return activeMenus[0] || null;
}

export async function getTomorrowsMenuWithExpiryUpdate(): Promise<Menu | null> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];

  const rows = await fetchMenusWithMeals(`m.status = 'active'`, []);
  if (rows.length === 0) return null;

  const now = new Date();
  const menus = rows.map((r) =>
    mapMenuRow(r, (r.meals as MenuMeal[]) || [])
  );
  const expiredIds = menus
    .filter((m) => m.status === 'active' && new Date(m.deadline) < now)
    .map((m) => m.id);
  if (expiredIds.length > 0) {
    await updateMenusStatus(expiredIds, 'completed');
  }
  const activeMenus = menus.filter((m) => !expiredIds.includes(m.id));
  if (activeMenus.length === 0) return null;
  if (activeMenus.length === 1) return activeMenus[0];
  const tomorrowMenu = activeMenus.find((m) => m.date === tomorrowString);
  return tomorrowMenu || activeMenus[0];
}

/* ---------- meals ---------- */

export async function listMeals(): Promise<Meal[]> {
  const { rows } = await pool.query(
    `SELECT id, name, description, menu_id, created_at FROM meals ORDER BY created_at DESC`
  );
  return rows.map((r) => mapMeal(r as Record<string, unknown>));
}

export async function createMealRow(data: MealFormData): Promise<Meal> {
  const { rows } = await pool.query(
    `INSERT INTO meals (name, description, menu_id, created_at)
     VALUES ($1, $2, $3, now()) RETURNING id, name, description, menu_id, created_at`,
    [data.name, data.description, data.menu_id]
  );
  return mapMeal(rows[0] as Record<string, unknown>);
}

export async function updateMealRow(
  mealId: string,
  patch: Partial<MealFormData>
): Promise<Meal> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (patch.name !== undefined) {
    sets.push(`name = $${i++}`);
    vals.push(patch.name);
  }
  if (patch.description !== undefined) {
    sets.push(`description = $${i++}`);
    vals.push(patch.description);
  }
  if (patch.menu_id !== undefined) {
    sets.push(`menu_id = $${i++}`);
    vals.push(patch.menu_id);
  }
  if (sets.length === 0) {
    const m = await getMealById(mealId);
    if (!m) throw new Error('Meal not found');
    return m;
  }
  vals.push(mealId);
  const { rows } = await pool.query(
    `UPDATE meals SET ${sets.join(', ')} WHERE id = $${i} RETURNING id, name, description, menu_id, created_at`,
    vals
  );
  return mapMeal(rows[0] as Record<string, unknown>);
}

export async function deleteMealRow(mealId: string): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(`DELETE FROM selections WHERE meal_id = $1`, [mealId]);
    await client.query(`DELETE FROM meals WHERE id = $1`, [mealId]);
    await client.query(
      `UPDATE menu SET todays_special = NULL WHERE todays_special = $1`,
      [mealId]
    );
  });
}

export async function getMealById(mealId: string): Promise<Meal | null> {
  const { rows } = await pool.query(
    `SELECT id, name, description, menu_id, created_at FROM meals WHERE id = $1`,
    [mealId]
  );
  return rows[0] ? mapMeal(rows[0] as Record<string, unknown>) : null;
}

export async function searchMealsByName(q: string): Promise<Meal[]> {
  const { rows } = await pool.query(
    `SELECT me.id, me.name, me.description, me.menu_id, me.created_at
     FROM meals me
     INNER JOIN menu m ON m.id = me.menu_id
     WHERE me.name ILIKE $1
     ORDER BY m.date DESC, me.created_at DESC`,
    [`%${q}%`]
  );
  return rows.map((r) => mapMeal(r as Record<string, unknown>));
}

export async function listMealsByMenuId(menuId: string): Promise<Meal[]> {
  const { rows } = await pool.query(
    `SELECT id, name, description, menu_id, created_at FROM meals WHERE menu_id = $1 ORDER BY created_at DESC`,
    [menuId]
  );
  return rows.map((r) => mapMeal(r as Record<string, unknown>));
}

/* ---------- selections ---------- */

export async function listSelections(): Promise<Selection[]> {
  const { rows } = await pool.query(
    `SELECT id, user_id, meal_id, opted_in, created_at FROM selections ORDER BY created_at DESC`
  );
  return rows.map((r) => mapSelection(r as Record<string, unknown>));
}

export async function createSelectionRow(
  data: SelectionFormData
): Promise<Selection> {
  const { rows } = await pool.query(
    `INSERT INTO selections (user_id, meal_id, opted_in, created_at, updated_at)
     VALUES ($1, $2, $3, now(), now())
     RETURNING id, user_id, meal_id, opted_in, created_at`,
    [data.user_id, data.meal_id, data.opted_in]
  );
  return mapSelection(rows[0] as Record<string, unknown>);
}

export async function updateSelectionRow(
  id: string,
  patch: Partial<SelectionFormData>
): Promise<Selection> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (patch.user_id !== undefined) {
    sets.push(`user_id = $${i++}`);
    vals.push(patch.user_id);
  }
  if (patch.meal_id !== undefined) {
    sets.push(`meal_id = $${i++}`);
    vals.push(patch.meal_id);
  }
  if (patch.opted_in !== undefined) {
    sets.push(`opted_in = $${i++}`);
    vals.push(patch.opted_in);
  }
  sets.push(`updated_at = now()`);
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE selections SET ${sets.join(', ')} WHERE id = $${i} RETURNING id, user_id, meal_id, opted_in, created_at`,
    vals
  );
  return mapSelection(rows[0] as Record<string, unknown>);
}

export async function deleteSelectionRow(id: string): Promise<void> {
  await pool.query(`DELETE FROM selections WHERE id = $1`, [id]);
}

export async function listSelectionsByUserId(
  userId: string
): Promise<Selection[]> {
  const { rows } = await pool.query(
    `SELECT id, user_id, meal_id, opted_in, created_at FROM selections WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map((r) => mapSelection(r as Record<string, unknown>));
}

export async function listSelectionsByMealId(
  mealId: string
): Promise<Selection[]> {
  const { rows } = await pool.query(
    `SELECT id, user_id, meal_id, opted_in, created_at FROM selections WHERE meal_id = $1 ORDER BY created_at DESC`,
    [mealId]
  );
  return rows.map((r) => mapSelection(r as Record<string, unknown>));
}

export async function bulkCreateSelectionsSkipExisting(
  mealId: string,
  userIds: string[],
  optedIn: boolean
): Promise<{ created: Selection[]; skippedUserIds: string[] }> {
  if (userIds.length === 0) return { created: [], skippedUserIds: [] };

  const existing = await pool.query(
    `SELECT user_id FROM selections WHERE meal_id = $1 AND user_id = ANY($2::bigint[])`,
    [mealId, userIds]
  );
  const existingSet = new Set(
    existing.rows.map((r) => String((r as Record<string, unknown>).user_id))
  );
  const toInsert = userIds.filter((id) => !existingSet.has(id));

  if (toInsert.length === 0) {
    return { created: [], skippedUserIds: Array.from(existingSet) };
  }

  const { rows } = await pool.query(
    `INSERT INTO selections (user_id, meal_id, opted_in, created_at, updated_at)
     SELECT u::bigint, $1::bigint, $2, now(), now()
     FROM unnest($3::bigint[]) AS u
     RETURNING id, user_id, meal_id, opted_in, created_at`,
    [mealId, optedIn, toInsert]
  );

  return {
    created: rows.map((r) => mapSelection(r as Record<string, unknown>)),
    skippedUserIds: Array.from(existingSet),
  };
}

export interface SelectionDetailRow {
  id: string;
  userName: string;
  department: string;
  mealName: string;
  optedIn: boolean;
  createdAt: string;
}

export async function listSelectionsByMenuIdJoined(
  menuId: string
): Promise<SelectionDetailRow[]> {
  const { rows } = await pool.query(
    `SELECT s.id, s.opted_in, s.created_at,
            u.name AS user_name,
            d.name AS department_name,
            m.name AS meal_name
     FROM selections s
     INNER JOIN users u ON u.id = s.user_id
     INNER JOIN departments d ON d.id = u.department
     INNER JOIN meals m ON m.id = s.meal_id
     WHERE m.menu_id = $1
     ORDER BY s.created_at DESC`,
    [menuId]
  );
  return rows.map((r) => ({
    id: String((r as Record<string, unknown>).id),
    userName: String((r as Record<string, unknown>).user_name),
    department: String((r as Record<string, unknown>).department_name),
    mealName: String((r as Record<string, unknown>).meal_name),
    optedIn: Boolean((r as Record<string, unknown>).opted_in),
    createdAt: toIso((r as Record<string, unknown>).created_at),
  }));
}

/* ---------- dashboard ---------- */

export async function countUsers(): Promise<number> {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM users`);
  return rows[0]?.c ?? 0;
}

export async function countMeals(): Promise<number> {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM meals`);
  return rows[0]?.c ?? 0;
}

export async function countSelectionsToday(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS c FROM selections
     WHERE created_at >= $1::date AND created_at < ($1::date + interval '1 day')`,
    [today]
  );
  return rows[0]?.c ?? 0;
}

export async function countDistinctSelectionUsers(): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COUNT(DISTINCT user_id)::int AS c FROM selections`
  );
  return rows[0]?.c ?? 0;
}

export async function countMealsOnActiveMenus(): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS c FROM meals me
     INNER JOIN menu mn ON mn.id = me.menu_id AND mn.status = 'active'`
  );
  return rows[0]?.c ?? 0;
}
