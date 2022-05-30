const mongoose = require("mongoose");
const authKey = require("../auth");
const Page = require("../models/Page");
const User = require("../models/User");

mongoose.connect(authKey);

// This is a very ugly way of doing
// it and just shown as a quick and 
// dirty example

const seedSomeUsersAndPages = async () => {
  try {
    const firstUser = await User.create({
      email: "laurens@laurens.com",
      password: "laurenspassword",
      username: "laurensuser",
      name: "laurens",
    });

    const secondUser = await User.create({
      email: "david@david.com",
      password: "davidpassword",
      username: "daviduser",
      name: "david",
    });

    const firstPage = await Page.create({
      name: firstUser.name,
      username: firstUser.username,
      userId: firstUser._id,
      colors: {},
      permaLinks: [],
      oneLiner: "",
      bio: "",
      sectionOrdering: [],
      sections: []
    })

    const secondPage = await Page.create({
      name: secondUser.name,
      username: secondUser.name,
      userId: secondUser._id,
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