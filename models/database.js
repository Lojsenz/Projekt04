import Database from "better-sqlite3";

const db = new Database("recipes.db");
db.pragma("foreign_keys = ON");


db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );
  
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    recipe TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

export function addCategory(id, name) {
  try {
    const stmt = db.prepare("INSERT INTO categories (id, name) VALUES (?, ?)");
    stmt.run(id, name);
    return true;
  } catch (error) {
    console.log("Error adding category:", error.message);
    return false;
  }
}

export function hasCategory(id) {
  const stmt = db.prepare("SELECT 1 FROM categories WHERE id = ?");
  return stmt.get(id) !== undefined;
}

export function getCategory(id) {
  const stmt = db.prepare("SELECT * FROM categories WHERE id = ?");
  const category = stmt.get(id);
  if (!category) return null;
  
  const recipesStmt = db.prepare("SELECT * FROM recipes WHERE category_id = ?");
  category.recipes = recipesStmt.all(id);
  return category;
}

export function getCategorySummaries() {
  const stmt = db.prepare("SELECT id, name FROM categories");
  return stmt.all();
}

export function addRecipe(categoryId, recipe) {
  try {
    const stmt = db.prepare("INSERT INTO recipes (category_id, name, recipe) VALUES (?, ?, ?)");
    const result = stmt.run(categoryId, recipe.name, recipe.recipe);
    return result.lastInsertRowid;
  } catch (error) {
    console.log("Error adding recipe:", error.message);
    return null;
  }
}

export function deleteCategory(categoryId) {
  try {
    
    const deleteRecipesStmt = db.prepare("DELETE FROM recipes WHERE category_id = ?");
    deleteRecipesStmt.run(categoryId);
    
    
    const deleteCategoryStmt = db.prepare("DELETE FROM categories WHERE id = ?");
    const result = deleteCategoryStmt.run(categoryId);
    
    return result.changes > 0;
  } catch (error) {
    console.log("Error deleting category:", error.message);
    return false;
  }
}

export function deleteRecipe(recipeId) {
  try {
    const stmt = db.prepare("DELETE FROM recipes WHERE id = ?");
    const result = stmt.run(recipeId);
    return result.changes > 0;
  } catch (error) {
    console.log("Error deleting recipe:", error.message);
    return false;
  }
}