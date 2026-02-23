import express from "express";
import { getCategorySummaries, hasCategory, getCategory, addRecipe, addCategory, deleteCategory, deleteRecipe } from "./models/database.js";

const port = 8000;


const app = express();

app.use(express.static("main"));
app.use('/css', express.static('css'));
app.set("view engine", "ejs");
app.use(express.urlencoded());

app.get("/food/categories/", async (req, res) => {
  const summaries = await getCategorySummaries();
  res.render("categories", {
    title: "Categories",
    categories: summaries.map((c) => c.name),
  });
});

app.get("/food/new_category", (req, res) => {
  res.render("forms/new_category", {
    title: "New Category",
  });
});

app.post("/food/new_category", async (req, res) => {
  const name = req.body.name && req.body.name.trim();
  if (!name) {
    res.render("forms/new_category", { title: "New Category", name: req.body.name });
    return;
  }

  const id = name; 
  const created = await addCategory(id, name);
  if (!created) {
    
    res.render("forms/new_category", { title: "New Category", name: req.body.name });
    return;
  }

  res.redirect("/food/categories/");
});


app.get("/food/:category", async (req, res) => {
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

app.post("/food/:category_id/new", async (req, res) => {
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

app.post("/food/:category_id/delete", async (req, res) => {
  const category_id = req.params.category_id;
  if (await hasCategory(category_id)) {
    await deleteCategory(category_id);
    res.redirect("/food/categories/");
  } else {
    res.sendStatus(404);
  }
});

app.post("/food/:category_id/recipe/:recipe_id/delete", async (req, res) => {
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
