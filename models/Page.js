const mongoose = require("mongoose");
const User = require("./User");
const { Schema, SchemaTypes, model } = mongoose;

const pageSchema = new Schema({
  user: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  colors: {
    lightFG: String,
    lightBG: String,
    darkFG: String,
    darkBG: String,
  },
  permaLinks: [
    {
      text: {
        type: String,
        required: true,
      },
      link: {
        type: String,
        required: true,
      },
      icon: String,
    },
  ],
  oneLiner: String,
  bio: String,
  sectionOrdering: [String],
  sections: [
    {
      sectionName: {
        type: String,
        required: true,
      },
      icon: String,
      type: {
        type: String,
        required: true,
      },
      content: [
        {
          title: {
            type: String,
            required: true,
          },
          image: String,
          author: String,
          description: String,
        },
      ],
    },
  ],
});

const Page = model("Page", pageSchema);
module.exports = Page;
