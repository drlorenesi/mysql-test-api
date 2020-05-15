# test-api

Test API for running MySQL CRUD operations. The code provided in this repository is not meant for production.

This project assumes you have a local instance of MySQL running and created the `users` table by running the `test_db.sql` script provided.

Create a ".env" file at the root folder with the following info:

```reStructuredText
DB_HOST=localhost
DB_USER=web_user
DB_PASSWORD=secret_password
DB_DATABASE=my_database
```

Finally, the `sqlInjection.js` provides an insight as to why not to use template literals when building queries from the request parameters.
