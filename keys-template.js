//Insert your MongoURI here
const mongoURI = "mongodb+srv://dbAdmin:yourmongodburl";

//Enter a string/password. This will be used to encrypt JWT tokens. I'd recommend using a very long string.
const jwtKey = "";

//Change this to the location of your front-end server. Don't forget to whitelist this server in your MongoDB as well.
const frontEndServer = "http://localhost:3000";

//Enter your Cloudinary API keys here
const cloudinaryKeys = {
  cloud_name: '',
  api_key: '',
  api_secret: '',
}

module.exports = {mongoURI, jwtKey, cloudinaryKeys, frontEndServer} ;