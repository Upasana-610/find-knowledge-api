const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  subcategories: [
    {
      Subcategory: {
        type: String,
      },
    },
  ],
});

categorySchema.index(
  { SubCategory: 1 },
  {
    unique: true,
    partialFilterExpression: {
      SubCategory: { $ne: null },
    },
  }
);

const categoryModel = mongoose.model("categories", categorySchema);
module.exports = categoryModel;
