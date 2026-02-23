import sqlite3 from "sqlite3";

const db = new sqlite3.Database("recipes.db");
db.run("PRAGMA foreign_keys = ON");

db.serialize(() => {
  db.run(`
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
});

export function addCategory(id, name) {
  return new Promise((resolve) => {
    db.run("INSERT INTO categories (id, name) VALUES (?, ?)", [id, name], function(err) {
      if (err) {
        console.log("Error adding category:", err.message);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export function hasCategory(id) {
  return new Promise((resolve) => {
    db.get("SELECT 1 FROM categories WHERE id = ?", [id], (err, row) => {
      resolve(!err && row !== undefined);
    });
  });
}

export function getCategory(id) {
  return new Promise((resolve) => {
    db.get("SELECT * FROM categories WHERE id = ?", [id], (err, category) => {
      if (err || !category) {
        resolve(null);
        return;
      }
      
      db.all("SELECT * FROM recipes WHERE category_id = ?", [id], (err, recipes) => {
        category.recipes = recipes || [];
        resolve(category);
      });
    });
  });
}

export function getCategorySummaries() {
  return new Promise((resolve) => {
    db.all("SELECT id, name FROM categories", [], (err, rows) => {
      resolve(rows || []);
    });
  });
}

export function addRecipe(categoryId, recipe) {
  return new Promise((resolve) => {
    db.run(
      "INSERT INTO recipes (category_id, name, recipe) VALUES (?, ?, ?)",
      [categoryId, recipe.name, recipe.recipe],
      function(err) {
        if (err) {
          console.log("Error adding recipe:", err.message);
          resolve(null);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

export function deleteCategory(categoryId) {
  return new Promise((resolve) => {
    db.run("DELETE FROM recipes WHERE category_id = ?", [categoryId], function(err) {
      if (err) {
        console.log("Error deleting category:", err.message);
        resolve(false);
        return;
      }
      
      db.run("DELETE FROM categories WHERE id = ?", [categoryId], function(err) {
        if (err) {
          console.log("Error deleting category:", err.message);
          resolve(false);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  });
}

export function deleteRecipe(recipeId) {
  return new Promise((resolve) => {
    db.run("DELETE FROM recipes WHERE id = ?", [recipeId], function(err) {
      if (err) {
        console.log("Error deleting recipe:", err.message);
        resolve(false);
      } else {
        resolve(this.changes > 0);
      }
    });
  });
}