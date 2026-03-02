import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";

const db = new sqlite3.Database("recipes.db");
db.run("PRAGMA foreign_keys = ON");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(name, user_id)
    );
    
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      recipe TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);
  
  // Create admin user if it doesn't exist
  db.get("SELECT * FROM users WHERE username = ?", ["admin"], async (err, user) => {
    if (!user) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      db.run(
        "INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)",
        ["admin", hashedPassword, 1],
        function(err) {
          if (err) {
            console.log("Error creating admin user:", err.message);
          } else {
            console.log("Admin user created successfully");
          }
        }
      );
    }
  });
});

export function addCategory(id, name, userId) {
  return new Promise((resolve) => {
    db.run("INSERT INTO categories (id, name, user_id) VALUES (?, ?, ?)", [id, name, userId], function(err) {
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

export function getCategorySummaries(userId) {
  return new Promise((resolve) => {
    db.all("SELECT id, name FROM categories WHERE user_id = ?", [userId], (err, rows) => {
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

export function registerUser(username, password) {
  return new Promise(async (resolve) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        function(err) {
          if (err) {
            console.log("Error registering user:", err.message);
            resolve(false);
          } else {
            resolve(true);
          }
        }
      );
    } catch (err) {
      console.log("Error hashing password:", err.message);
      resolve(false);
    }
  });
}

export function loginUser(username, password) {
  return new Promise(async (resolve) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
      if (err || !user) {
        resolve(null);
        return;
      }
      
      try {
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          resolve({ id: user.id, username: user.username, is_admin: user.is_admin });
        } else {
          resolve(null);
        }
      } catch (err) {
        console.log("Error comparing passwords:", err.message);
        resolve(null);
      }
    });
  });
}