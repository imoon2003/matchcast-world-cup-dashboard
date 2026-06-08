function CategoryTabs({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="category-tabs" aria-label="Coverage categories">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;

        return (
          <button
            key={category}
            className={isSelected ? "active-tab" : ""}
            aria-pressed={isSelected}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryTabs;