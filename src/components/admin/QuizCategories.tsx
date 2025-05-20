"use client";
import React, { useState } from "react";

const QuizCategories = () => {
  const [categories, setCategories] = useState([
    { name: "Programming", difficulty: "Easy" },
    { name: "Science", difficulty: "Medium" },
    { name: "Mathematics", difficulty: "Hard" },
  ]);

  const [newCategory, setNewCategory] = useState({ name: "", difficulty: "Easy" });

  const handleAddCategory = () => {
    if (newCategory.name) {
      setCategories([...categories, newCategory]);
      setNewCategory({ name: "", difficulty: "Easy" });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Quiz Categories</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Category Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <select
          value={newCategory.difficulty}
          onChange={(e) => setNewCategory({ ...newCategory, difficulty: e.target.value })}
          className="border p-2 mr-2"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <button onClick={handleAddCategory} className="bg-blue-500 text-white p-2">
          Add Category
        </button>
      </div>
      <ul>
        {categories.map((category, index) => (
          <li key={index} className="border-b py-2">
            {category.name} - {category.difficulty}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizCategories;