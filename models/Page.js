const mongoose = require("mongoose");
const User = require("./User");
const { Schema, SchemaTypes, model } = mongoose;

const pageSchema = new Schema({
  user: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  profileImage: String,
  colors: {
    light: {
      name: String,
      lightFG: String,
      lightBG: String,
    },
    dark: {
      name: String,
      darkFG: String,
      darkBG: String,
    },
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
      type: {
        type: String,
        required: true,
      },
      fullLink: {
        link: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
      },
      content: [
        {
          title: {
            type: String,
            required: true,
          },
          image: String,
          imageAlt: String,
          author: String,
          description: String,
        },
      ],
    },
  ],
});

const Page = model("Page", pageSchema);
module.exports = Page;
