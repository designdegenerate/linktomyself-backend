const req = require("express/lib/request");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const pageSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  userId: req(User._id),
  colors: {
    lightFG: String,
    lightBG: String,
    darkFG: String,
    darkBg: String,
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
