# Linktomyself Server
The server side component of linktomyself, a homepage builder. Read more about it in [the front-end repo](https://github.com/designdegenerate/linktomyself-frontend). Built in Node.js using Express.

## Additional Requirements
- Your own mongoDB server or MongoDB Atlas.
- Cloudinary account

## ToDo someday
- Split up the monster AuthRouter into smaller routes.
- More validation of content.
- Refactor AuthRouter to be more DRY.

## Running the server
Rename ``dotenv-template`` into ``.env``, and then fill in your MongoDB and Cloudinary credentials, and some sort of password for JWT key encryption.

Then, run the server using ``node server.js`` or ``nodemon server.js`` if nodemon is globally installed.

## License
Licensed under the terms of the MIT license.