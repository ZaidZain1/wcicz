// DOM Elements
const input = document.getElementById("ingredientsInput");
const button = document.getElementById("findRecipesBtn");
const container = document.getElementById("recipesContainer");
const modal = document.getElementById("recipeModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.querySelector(".close-modal");

// Error Message Element
const errorBox = document.createElement("div");
errorBox.className = "error-message";
document.body.prepend(errorBox);

// Configuration
const API_KEY = "d03ae65630564b68b0935448a715a608"; // Replace with your Spoonacular API key

// Show error function
const showError = (message) => {
  errorBox.textContent = message;
  errorBox.classList.add("visible");
  setTimeout(() => errorBox.classList.remove("visible"), 3000);
};

// Toggle loading state
const toggleLoading = (isLoading) => {
  button.innerHTML = isLoading
    ? `<span class="loader"></span> Searching...`
    : "Find Recipes";
  button.disabled = isLoading;
  input.disabled = isLoading;
};

// Show recipe modal with detailed instructions
const showRecipeModal = (recipe) => {
  modalContent.innerHTML = `
    <h2>${recipe.title}</h2>
    <img src="${recipe.image}" alt="${recipe.title}" class="modal-image" style="width:100%; max-height:300px; object-fit:cover; border-radius:12px; margin:1rem 0;">
    
    <div class="recipe-meta">
      <p><strong>⏱ Ready in:</strong> ${recipe.readyInMinutes} minutes</p>
      <p><strong>🍽 Servings:</strong> ${recipe.servings}</p>
    </div>
    
    <div class="ingredients-section">
      <h3>Ingredients</h3>
      <ul>
        ${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}
      </ul>
    </div>
    
    <div class="instructions-section">
      <h3>Instructions</h3>
      ${recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? 
        recipe.analyzedInstructions[0].steps.map(step => `
          <div class="instruction-step">
            <h4>Step ${step.number}</h4>
            <p>${step.step}</p>
          </div>
        `).join('') : 
        '<p>No instructions available. Please check the original source.</p>'}
    </div>
    
    ${recipe.nutrition ? `
    <div class="nutrition-facts">
      <h3>Nutrition Facts</h3>
      <p>Calories: ${recipe.nutrition.nutrients.find(n => n.name === "Calories")?.amount || 'N/A'} kcal</p>
    </div>
    ` : ''}
  `;
  
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
};

// Close modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
});

// Close when clicking outside modal
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// Create recipe card
const createRecipeCard = (recipe) => {
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
    <div class="recipe-content">
      <h3>${recipe.title}</h3>
      <p class="cook-time">⏱ ${recipe.readyInMinutes} mins</p>
      <div class="ingredients">
        <h4>Key Ingredients:</h4>
        <ul>
          ${recipe.extendedIngredients.slice(0, 5).map(ing => 
            `<li>${ing.original}</li>`).join("")}
        </ul>
      </div>
      <button class="view-instructions-btn">View Instructions</button>
    </div>
  `;
  
  // Add event listener to the button
  card.querySelector(".view-instructions-btn").addEventListener("click", () => {
    showRecipeModal(recipe);
  });
  
  return card;
};

// Fetch recipes by ingredients
const fetchRecipes = async (ingredients) => {
  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=6&ranking=1&ignorePantry=true&apiKey=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch recipes list");
  return await response.json();
};

// Fetch detailed recipe information
const fetchRecipeDetails = async (id) => {
  const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch recipe details");
  return await response.json();
};

// Main search handler
button.addEventListener("click", async () => {
  const ingredients = input.value.trim();
  if (!ingredients) {
    showError("Please enter ingredients first!");
    input.focus();
    return;
  }

  container.innerHTML = "";
  toggleLoading(true);

  try {
    const recipes = await fetchRecipes(ingredients);
    if (recipes.length === 0) {
      showError("No recipes found for those ingredients.");
      return;
    }

    for (const recipe of recipes) {
      const details = await fetchRecipeDetails(recipe.id);
      container.appendChild(createRecipeCard(details));
    }
  } catch (error) {
    showError("Something went wrong. Please try again.");
    console.error(error);
  } finally {
    toggleLoading(false);
  }
});

// Enter key support
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") button.click();
});