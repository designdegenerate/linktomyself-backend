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
      email: "a@a.nl",
      password: bcrypt.hashSync("a", saltRounds),
      username: "a",
      name: "Amalie Von der Kaasenbergen",
    });

    const secondUser = await User.create({
      email: "d@d.co",
      password: bcrypt.hashSync("davidpassword", saltRounds),
      username: "daviduser",
      name: "David",
    });

    const firstPage = await Page.create({
      user: firstUser._id,
      colors: {
        lightFG: "#181197",
        lightBG: "#ECEFF7",
        darkFG: "#ECEFF7",
        darkBG: "#181735",
      },
      permaLinks: [
        {
          text: "design portfolio",
          link: "https://laurensdesign.design",
        },
        {
          text: "Instagram",
          link: "https://laurensdesign.design",
        },
        {
          text: "Twitter",
          link: "https://laurensdesign.design",
        },
      ],
      oneLiner: "Full Stack developer and Designer, full of it",
      bio: "Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.",
      sectionOrdering: [],
      sections: [
        {
          sectionName: "Favourite Food",
          icon: "",
          type: "gallery",
          content: [
            {
              title: "kroket",
              image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Broodje_kroket_-_Febo_-_03.JPG/1024px-Broodje_kroket_-_Febo_-_03.JPG",
              author: "",
              description: "Dutch fine dining and very long text description you have to deal with.",
            },
            {
              title: "Even more kroket long string",
              image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/DSC_0082_broodje_kroket_chiang_mai_2009_0629.jpg/577px-DSC_0082_broodje_kroket_chiang_mai_2009_0629.jpg",
              author: "",
              description: "Dutch.",
            },
            {
              title: "Evil photooftheoneandonly",
              image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Barrica%2C_Fitzrovia%2C_London_%284093408145%29.jpg/1024px-Barrica%2C_Fitzrovia%2C_London_%284093408145%29.jpg",
              author: "",
              description: "Dutchlongsinglestringhahaha.",
            },
          ],
        },
        {
          sectionName: "Favourite Food",
          icon: "",
          type: "gallery",
          content: [
            {
              title: "kroket",
              image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Broodje_kroket_-_Febo_-_03.JPG/1024px-Broodje_kroket_-_Febo_-_03.JPG",
              author: "",
              description: "Dutch fine dining and very long text description you have to deal with.",
            },
            {
              title: "Even more kroket long string",
              image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/DSC_0082_broodje_kroket_chiang_mai_2009_0629.jpg/577px-DSC_0082_broodje_kroket_chiang_mai_2009_0629.jpg",
              author: "",
              description: "Dutch.",
            },
            {
              title: "Evil photooftheoneandonly",
              image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Barrica%2C_Fitzrovia%2C_London_%284093408145%29.jpg/1024px-Barrica%2C_Fitzrovia%2C_London_%284093408145%29.jpg",
              author: "",
              description: "Dutchlongsinglestringhahaha.",
            },
          ],
        },
      ]
    })

    const secondPage = await Page.create({
      user: secondUser._id,
      colors: {
        lightFG: "#181197",
        lightBG: "#ECEFF7",
        darkFG: "#ECEFF7",
        darkBG: "#181735",
      },
      permaLinks: [],
      oneLiner: "",
      bio: "",
      sectionOrdering: [],
      sections: []
    })

    await firstUser.update({page: firstPage._id});
    await secondUser.update({page: secondPage._id});

    await firstUser.save();
    await secondUser.save();

    console.log(firstPage, secondPage);
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

seedSomeUsersAndPages();