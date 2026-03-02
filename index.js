import express from "express";
import session from "express-session";
import { getCategorySummaries, hasCategory, getCategory, addRecipe, addCategory, deleteCategory, deleteRecipe, registerUser, loginUser } from "./models/database.js";

const port = 8000;

const app = express();

app.use(express.static("main"));
app.use('/css', express.static('css'));
app.set("view engine", "ejs");
app.use(express.urlencoded());

// Session middleware
app.use(session({
  secret: "randklucz",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));


const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Auth Routes
app.get("/login", (req, res) => {
  res.render("auth/login", { title: "Login", error: null });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    res.render("auth/login", { title: "Login", error: "Username and password are required" });
    return;
  }

  const user = await loginUser(username, password);
  if (user) {
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.is_admin = user.is_admin;
    res.redirect("/food/categories/");
  } else {
    res.render("auth/login", { title: "Login", error: "Invalid username or password" });
  }
});

app.get("/register", (req, res) => {
  res.render("auth/register", { title: "Register", error: null });
});

app.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  
  if (!username || !password || !confirmPassword) {
    res.render("auth/register", { title: "Register", error: "All fields are required" });
    return;
  }

  if (password !== confirmPassword) {
    res.render("auth/register", { title: "Register", error: "Passwords do not match" });
    return;
  }

  if (password.length < 6) {
    res.render("auth/register", { title: "Register", error: "Password must be at least 6 characters" });
    return;
  }

  const success = await registerUser(username, password);
  if (success) {
    res.redirect("/login");
  } else {
    res.render("auth/register", { title: "Register", error: "Username already exists" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/food/categories/");
    }
    res.redirect("/login");
  });
});

app.get("/:food", (req, res) => {
  if (req.session.userId) {
    res.redirect("/food/categories/");
  } else {
    res.redirect("/login");
  }
});

app.get("/food/categories/", isAuthenticated, async (req, res) => {
  let summaries;
  if (req.session.is_admin) {
    // Admin sees all categories from all users
    summaries = await getCategorySummaries(null);
  } else {
    // Regular users only see their own categories
    summaries = await getCategorySummaries(req.session.userId);
  }
  res.render("categories", {
    title: "Categories",
    categories: summaries.map((c) => c.name),
    username: req.session.username,
    is_admin: req.session.is_admin
  });
});

app.get("/food/new_category", isAuthenticated, (req, res) => {
  res.render("forms/new_category", {
    title: "New Category",
  });
});

app.post("/food/new_category", isAuthenticated, async (req, res) => {
  const name = req.body.name && req.body.name.trim();
  if (!name) {
    res.render("forms/new_category", { title: "New Category", name: req.body.name });
    return;
  }

  

  const id = name; 
  const created = await addCategory(id, name, req.session.userId);
  if (!created) {
    
    res.render("forms/new_category", { title: "New Category", name: req.body.name });
    return;
  }

  res.redirect("/food/categories/");
});


app.get("/food/:category", isAuthenticated, async (req, res) => {
  const categoryId = req.params.category;
  if (await hasCategory(categoryId)) {
    const category = await getCategory(categoryId);
    res.render("category", {
      title: category.name,
      category,
    });
  } else {
    res.sendStatus(404);
  }
});

app.post("/food/:category_id/new", isAuthenticated, async (req, res) => {
  const category_id = req.params.category_id;
  if (!await hasCategory(category_id)) {
    res.sendStatus(404);
  } else {
    await addRecipe(category_id, {
      name: req.body.name,
      recipe: req.body.recipe,
    });
    res.redirect(`/food/${category_id}`);
  }
});

app.post("/food/:category_id/delete", isAuthenticated, async (req, res) => {
  const category_id = req.params.category_id;
  if (await hasCategory(category_id)) {
    await deleteCategory(category_id);
    res.redirect("/food/categories/");
  } else {
    res.sendStatus(404);
  }
});

app.post("/food/:category_id/recipe/:recipe_id/delete", isAuthenticated, async (req, res) => {
  const category_id = req.params.category_id;
  const recipe_id = req.params.recipe_id;
  if (await hasCategory(category_id)) {
    await deleteRecipe(recipe_id);
    res.redirect(`/food/${category_id}`);
  } else {
    res.sendStatus(404);
  }
});


app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
