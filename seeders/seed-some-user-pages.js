const mongoose = require("mongoose");
const Page = require("../models/Page");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { mongoURI } = require("../keys");
const saltRounds = 10;

mongoose.connect(mongoURI);

// This is a very ugly way of doing
// it and just shown as a quick and 
// dirty example

const seedSomeUsersAndPages = async () => {
  try {
    const firstUser = await User.create({
      email: "laurens@laurens.com",
      password: bcrypt.hashSync("laurenspassword", saltRounds),
      username: "laurensuser",
      name: "laurens",
    });

    const secondUser = await User.create({
      email: "david@david.com",
      password: bcrypt.hashSync("davidpassword", saltRounds),
      username: "daviduser",
      name: "david",
    });

    const firstPage = await Page.create({
      user: firstUser._id,
      colors: {},
      permaLinks: [],
      oneLiner: "",
      bio: "",
      sectionOrdering: [],
      sections: []
    })

    const secondPage = await Page.create({
      user: secondUser._id,
      colors: {},
      permaLinks: [],
      oneLiner: "",
      bio: "",
      sectionOrdering: [],
      sections: []
    })

    console.log(firstPage, secondPage);
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

seedSomeUsersAndPages();