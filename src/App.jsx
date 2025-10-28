import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Heart, ChefHat, X } from 'lucide-react';

function App() {
  const [searchMode, setSearchMode] = useState('ingredient');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const categories = ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian', 'Breakfast', 'Side'];

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('recipeFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
    } catch (err) {
      console.error('Error saving favorites:', err);
    }
  }, [favorites]);

  const searchRecipes = async (query = searchQuery) => {
    if (!query && searchMode !== 'random') {
      setError('Please enter a search term');
      return;
    }
    
    setLoading(true);
    setError(null);
    setRecipes([]);

    try {
      let url = '';
      
      if (searchMode === 'ingredient') {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`;
      } else if (searchMode === 'name') {
        url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
      } else if (searchMode === 'category') {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.meals && data.meals.length > 0) {
        setRecipes(data.meals);
        setError(null);
      } else {
        setRecipes([]);
        setError('No recipes found. Try a different search!');
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Something went wrong: ' + err.message);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const getRandomRecipe = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const data = await response.json();

      if (data.meals && data.meals.length > 0) {
        setSelectedRecipe(data.meals[0]);
        setError(null);
      } else {
        setError('Could not fetch random recipe.');
      }
    } catch (err) {
      console.error('Error fetching random recipe:', err);
      setError('Could not fetch random recipe: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecipeDetails = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await response.json();

      if (data.meals && data.meals.length > 0) {
        setSelectedRecipe(data.meals[0]);
        setError(null);
      } else {
        setError('Could not load recipe details.');
      }
    } catch (err) {
      console.error('Error fetching recipe details:', err);
      setError('Could not load recipe details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (recipe) => {
    const isFav = favorites.some(fav => fav.idMeal === recipe.idMeal);
    
    if (isFav) {
      setFavorites(favorites.filter(fav => fav.idMeal !== recipe.idMeal));
    } else {
      setFavorites([...favorites, recipe]);
    }
  };

  const isFavorite = (recipeId) => {
    return favorites.some(fav => fav.idMeal === recipeId);
  };

  const getIngredients = (recipe) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe['strIngredient' + i];
      const measure = recipe['strMeasure' + i];
      
      if (ingredient && ingredient.trim()) {
        ingredients.push((measure + ' ' + ingredient).trim());
      }
    }
    return ingredients;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchRecipes();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center transform hover:scale-110 transition-transform">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    TasteFinder
                  </h1>
                  <p className="text-sm text-purple-200">Crafted for Taylor</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="group relative px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 shadow-lg shadow-pink-500/50"
              >
                <div className="flex items-center gap-2">
                  <Heart className={"w-5 h-5 text-white " + (favorites.length > 0 ? 'fill-white' : '') + " group-hover:scale-110 transition-transform"} />
                  <span className="text-white font-semibold">{favorites.length}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                What's Cooking?
              </h2>
              <p className="text-xl text-purple-200">Discover your next favorite meal in seconds</p>
            </div>

            <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => { 
                    setSearchMode('ingredient'); 
                    setRecipes([]); 
                    setError(null); 
                    setShowFavorites(false);
                  }}
                  className={"px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 " + (searchMode === 'ingredient' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/50' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20')}
                >
                  By Ingredient
                </button>
                <button
                  onClick={() => { 
                    setSearchMode('name'); 
                    setRecipes([]); 
                    setError(null);
                    setShowFavorites(false);
                  }}
                  className={"px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 " + (searchMode === 'name' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/50' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20')}
                >
                  By Name
                </button>
                <button
                  onClick={() => { 
                    setSearchMode('category'); 
                    setRecipes([]); 
                    setError(null);
                    setShowFavorites(false);
                  }}
                  className={"px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 " + (searchMode === 'category' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/50' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20')}
                >
                  By Category
                </button>
                <button
                  onClick={() => {
                    setShowFavorites(false);
                    getRandomRecipe();
                  }}
                  className="ml-auto px-6 py-3 rounded-2xl font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-purple-500/50"
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Surprise Me!
                </button>
              </div>

              {searchMode === 'category' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setShowFavorites(false);
                        searchRecipes(cat);
                      }}
                      className="px-5 py-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 border border-white/20 transition-all font-medium transform hover:scale-105 hover:shadow-lg"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300 group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={searchMode === 'ingredient' ? 'chicken, tomato, rice...' : 'pasta carbonara, chocolate cake...'}
                      className="w-full pl-12 pr-6 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-purple-300 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowFavorites(false);
                      searchRecipes();
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl hover:from-orange-600 hover:to-pink-600 transition-all font-semibold transform hover:scale-105 shadow-lg shadow-orange-500/50"
                  >
                    Search
                  </button>
                </div>
              )}
            </div>
          </div>

          {showFavorites && (
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">Your Collection</h2>
              {favorites.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
                  <p className="text-purple-200 text-lg">No favorites yet. Start building your collection!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map(recipe => (
                    <div
                      key={recipe.idMeal}
                      onClick={() => getRecipeDetails(recipe.idMeal)}
                      className="group relative backdrop-blur-xl bg-white/5 rounded-3xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all cursor-pointer transform hover:scale-105 hover:shadow-2xl"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={recipe.strMealThumb}
                          alt={recipe.strMeal}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-white text-lg line-clamp-2">{recipe.strMeal}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {loading && !selectedRecipe && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="backdrop-blur-xl bg-white/10 rounded-3xl overflow-hidden border border-white/20 animate-pulse">
                  <div className="aspect-video bg-white/5"></div>
                  <div className="p-6">
                    <div className="h-4 bg-white/10 rounded-full w-3/4 mb-3"></div>
                    <div className="h-3 bg-white/10 rounded-full w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center">
              <p className="text-red-200 font-medium text-lg">{error}</p>
            </div>
          )}

          {!loading && !error && recipes.length > 0 && !showFavorites && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe, index) => (
                <div
                  key={recipe.idMeal}
                  onClick={() => getRecipeDetails(recipe.idMeal)}
                  className="group relative backdrop-blur-xl bg-white/5 rounded-3xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all cursor-pointer transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20"
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={recipe.strMealThumb}
                      alt={recipe.strMeal}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe);
                      }}
                      className="absolute top-4 right-4 p-3 backdrop-blur-xl bg-white/20 rounded-full border border-white/20 hover:scale-110 transition-all shadow-lg"
                    >
                      <Heart
                        className={"w-5 h-5 transition-all " + (isFavorite(recipe.idMeal) ? 'fill-pink-500 text-pink-500' : 'text-white')}
                      />
                    </button>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2 group-hover:text-pink-300 transition-colors">
                      {recipe.strMeal}
                    </h3>
                    {recipe.strCategory && (
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-200 text-sm rounded-full border border-orange-500/20">
                        {recipe.strCategory}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && recipes.length === 0 && !showFavorites && (
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center transform hover:scale-110 transition-transform">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Ready to discover?</h3>
              <p className="text-purple-200 text-lg max-w-md mx-auto">
                Search by ingredient, browse categories, or let us surprise you with something amazing!
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 backdrop-blur-xl bg-white/10 border-b border-white/20 p-6 flex justify-between items-start z-10">
              <div className="flex-1 pr-4">
                <h2 className="text-3xl font-bold text-white mb-3">{selectedRecipe.strMeal}</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.strCategory && (
                    <span className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-200 rounded-full border border-orange-500/30">
                      {selectedRecipe.strCategory}
                    </span>
                  )}
                  {selectedRecipe.strArea && (
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-200 rounded-full border border-purple-500/30">
                      {selectedRecipe.strArea}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="p-3 backdrop-blur-xl bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-8">
              <div className="rounded-3xl overflow-hidden mb-8 shadow-2xl">
                <img
                  src={selectedRecipe.strMealThumb}
                  alt={selectedRecipe.strMeal}
                  className="w-full h-80 object-cover"
                />
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-white mb-6">Ingredients</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getIngredients(selectedRecipe).map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-pink-500/50 transition-all"
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500"></div>
                      <span className="text-purple-100">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-white mb-6">Instructions</h3>
                <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10">
                  <p className="text-purple-100 whitespace-pre-line leading-relaxed">
                    {selectedRecipe.strInstructions}
                  </p>
                </div>
              </div>

              {selectedRecipe.strYoutube ? <a href={selectedRecipe.strYoutube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl hover:from-red-600 hover:to-rose-600 transition-all font-semibold transform hover:scale-105 shadow-lg shadow-red-500/50"><span>Watch Video Tutorial</span></a> : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
