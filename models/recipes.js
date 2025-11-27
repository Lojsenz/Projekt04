const food_categories = {
  "French": {
    name: "French",
    recipes: [
      { name: "ex1", recipe: "recipe1" },
      { name: "ex2", recipe: "recipe2" },
      { name: "ex3", recipe: "recipe3" },
      { name: "ex4", recipe: "recipe4" },
      { name: "ex5", recipe: "recipe5" },
    ],
  },
  "Italian": {
    name: "Italian",
    recipes: [
      { name: "ex1", recipe: "recipe1" },
      { name: "ex2", recipe: "recipe2" },
      { name: "ex3", recipe: "recipe3" },
      { name: "ex4", recipe: "recipe4" },
      { name: "ex5", recipe: "recipe5" },
    ],
  },
  "Asian": {
    name: "Asian",
    recipes: [
      { name: "ex1", recipe: "recipe1" },
      { name: "ex2", recipe: "recipe2" },
      { name: "ex3", recipe: "recipe3" },
      { name: "ex4", recipe: "recipe4" },
      { name: "ex5", recipe: "recipe5" },
    ],
  },
};

export function getCategorySummaries() {
  return Object.entries(food_categories).map(([id, category]) => {
    return { id, name: category.name };
  });
}

export function hasCategory(categoryId) {
  return food_categories.hasOwnProperty(categoryId);
}

export function getCategory(categoryId) {
  if (hasCategory(categoryId))
    return { id: categoryId, ...food_categories[categoryId] };
  return null;
}

export function addRecipe(categoryId, recipe) {
  if (hasCategory(categoryId)) food_categories[categoryId].recipes.push(recipe);
}

export function addCategory(categoryId, name) {
  if (!hasCategory(categoryId)) {
    food_categories[categoryId] = { name: name, recipes: [] };
    return true;
  }
  return false;
}

export default {
  getCategorySummaries,
  hasCategory,
  getCategory,
  addRecipe,
  addCategory,
};