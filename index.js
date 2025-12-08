import express from "express";
import { getCategorySummaries, hasCategory, getCategory, addRecipe, addCategory, deleteCategory, deleteRecipe } from "./models/database.js";

const port = 8000;


const app = express();

app.use(express.static("main"));
app.use('/css', express.static('css'));
app.set("view engine", "ejs");
app.use(express.urlencoded());

app.get("/food/categories/", (req, res) => {
  res.render("categories", {
    title: "Categories",
    categories: getCategorySummaries().map((c) => c.name),
  });
});

app.get("/food/new_category", (req, res) => {
  res.render("forms/new_category", {
    title: "New Category",
  });
});

app.post("/food/new_category", (req, res) => {
  const name = req.body.name && req.body.name.trim();
  if (!name) {
    res.render("forms/new_category", { title: "New Category", name: req.body.name });
    return;
  }

  const id = name; 
  const created = addCategory(id, name);
  if (!created) {
    
    res.render("forms/new_category", { title: "New Category", name: req.body.name });
    return;
  }

  res.redirect("/food/categories/");
});


app.get("/food/:category", (req, res) => {
  const categoryId = req.params.category;
  if (hasCategory(categoryId)) {
    const category = getCategory(categoryId);
    res.render("category", {
      title: category.name,
      category,
    });
  } else {
    res.sendStatus(404);
  }
});

app.post("/food/:category_id/new", (req, res) => {
  const category_id = req.params.category_id;
  if (!hasCategory(category_id)) {
    res.sendStatus(404);
  } else {
    addRecipe(category_id, {
      name: req.body.name,
      recipe: req.body.recipe,
    });
    res.redirect(`/food/${category_id}`);
  }
});

app.post("/food/:category_id/delete", (req, res) => {
  const category_id = req.params.category_id;
  if (hasCategory(category_id)) {
    deleteCategory(category_id);
    res.redirect("/food/categories/");
  } else {
    res.sendStatus(404);
  }
});

app.post("/food/:category_id/recipe/:recipe_id/delete", (req, res) => {
  const category_id = req.params.category_id;
  const recipe_id = req.params.recipe_id;
  if (hasCategory(category_id)) {
    deleteRecipe(recipe_id);
    res.redirect(`/food/${category_id}`);
  } else {
    res.sendStatus(404);
  }
});


app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
