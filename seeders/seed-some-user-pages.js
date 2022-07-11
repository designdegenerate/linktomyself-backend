require('dotenv').config()
const mongoose = require("mongoose");
const Page = require("../models/Page");
const User = require("../models/User");
const bcrypt = require("bcrypt");
// const { mongoURI } = require("../keys");
const saltRounds = 10;

mongoose.connect(process.env.mongoURI);

// This is a very ugly way of doing
// it and just shown as a quick and
// dirty example

const seedSomeUsersAndPages = async () => {
  try {
    const firstUser = await User.create({
      email: "a@a.nl",
      password: bcrypt.hashSync("a", saltRounds),
      username: "a",
      name: "Amalie",
    });

    const firstPage = await Page.create({
      user: firstUser._id,
      profileImage: "https://cataas.com/cat?type=sq",
      colors: {
        light: {
          name: "blue",
          lightFG: "#d8ecee",
          lightBG: "#00199d",
        },
        dark: {
          name: "blue",
          darkFG: "#5fb5bd",
          darkBG: "#0c0a2b",
        },
      },
      permaLinks: [
        {
          text: "design portfolio",
          link: "https://laurensdesign.design",
        },
        {
          text: "Instagram",
          link: "https://instagram.com",
        },
        {
          text: "Twitter",
          link: "https://t.co",
        },
      ],
      oneLiner: "Full Stack developer and Designer, full of it",
      bio: "Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.",
      sectionOrdering: [],
      sections: [
        {
          sectionName: "Favourite Food",
          type: "gallery",
          contentType: "food",
          fullLink: {
            link: "https://laurensdesign.design",
            text: "My Foodie Instagram",
            visible: true,
          },
          content: [
            {
              title: "kroket",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Broodje_kroket_-_Febo_-_03.JPG/1024px-Broodje_kroket_-_Febo_-_03.JPG",
              imageAlt: "",
              author: "",
              link: "https://laurensdesign.design",
              description:
                "Dutch fine dining and very long text description you have to deal with.",
            },
            {
              title: "Even more kroket long string",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/DSC_0082_broodje_kroket_chiang_mai_2009_0629.jpg/577px-DSC_0082_broodje_kroket_chiang_mai_2009_0629.jpg",
              imageAlt: "beautiful kroket",
              link: "https://laurensdesign.design",
              author: "",
              description: "Dutch.",
            },
            {
              title: "Evil photooftheoneandonly",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Barrica%2C_Fitzrovia%2C_London_%284093408145%29.jpg/1024px-Barrica%2C_Fitzrovia%2C_London_%284093408145%29.jpg",
              author: "",
              link: "https://laurensdesign.design",
              imageAlt: "",
              description: "Dutchlongsinglestringhahaha.",
            },
          ],
        },
        {
          sectionName: "Favourite Books",
          icon: "",
          type: "list",
          contentType: "books",
          fullLink: {
            link: "https://laurensdesign.design",
            text: "My Goodreads",
            visible: false,
          },
          content: [
            {
              title: "Dune",
              image: "",
              author: "Frank Herbert",
              link: "https://laurensdesign.design",
              description:
                "Dutch fine dining and very long text description you have to deal with.",
            },
            {
              title: "Even more kroket long string",
              image: "",
              author: "Sinterklaas",
              link: "https://laurensdesign.design",
              description: "Dutch.",
            },
            {
              title: "Evil photooftheoneandonly",
              image: "",
              link: "https://laurensdesign.design",
              author: "Steven King",
              description: "Dutchlongsinglestringhahaha.",
            },
          ],
        },
      ],
    });

    await firstUser.updateOne({ page: firstPage._id });

    await firstUser.save();

    console.log(firstPage);
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

seedSomeUsersAndPages();
