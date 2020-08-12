# Test API for MySQL

Test API for running MySQL CRUD operations on `users` on a database. The code provided in this repository is not meant for production.

This project builds on [Matthias Hagemann's](https://medium.com/@mhagemann?source=post_page-----6984a09d49f4----------------------) article published on [Medium](https://medium.com/@mhagemann/create-a-mysql-database-middleware-with-node-js-8-and-async-await-6984a09d49f4) on how to use a MySQL pool connection module that supports async/await.

You should have a local instance of MySQL running and created the `registration` database by running the `registration.sql` script provided.

Create a ".env" file at the root folder with the following info:

```reStructuredText
DB_HOST=localhost
DB_USER=dbUser
DB_PASSWORD=dbPassword
DB_DATABASE=database
jwtPrivateKey=myPrivateKey
EMAIL_HOST=myEmailHost
EMAIL_USER=myEmail
EMAIL_PASS=myEmailPassword
```

To start the server run:

```bash
npm start
```

or, if you have `nodemon` globally installed, run the `dev` environment:

```bash
npm run dev
```

NOTE: the `sqlInjection.js` file provides an insight as to why **not** to use template literals when building queries from request parameters. You can test this route on your browser: http://localhost:3000/api/test/1%20OR%20(1=1)
