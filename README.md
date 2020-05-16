# Test API for MySQL

Test API for running MySQL CRUD operations. The code provided in this repository is not meant for production.

This project builds on [Matthias Hagemann's](https://medium.com/@mhagemann?source=post_page-----6984a09d49f4----------------------) article published on [Medium](https://medium.com/@mhagemann/create-a-mysql-database-middleware-with-node-js-8-and-async-await-6984a09d49f4) on how to use a MySQL pool connection module that supports async/await.

You should have a local instance of MySQL running and created the `users` table by running the `test_db.sql` script provided.

Create a ".env" file at the root folder with the following info:

```reStructuredText
DB_HOST=localhost
DB_USER=web_user
DB_PASSWORD=secret_password
DB_DATABASE=my_database
```

Finally, the `sqlInjection.js` file provides an insight as to why **not** to use template literals when building queries from request parameters.
