DROP DATABASE IF EXISTS registration;

CREATE DATABASE registration;

USE registration;

CREATE TABLE user_level (
  level_id TINYINT UNSIGNED NOT NULL,
  description VARCHAR(45) NOT NULL,
  PRIMARY KEY (level_id)
);

CREATE TABLE users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(45) NOT NULL,
  last_name VARCHAR(45) NOT NULL,
  email VARCHAR(60) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_level TINYINT UNSIGNED NOT NULL DEFAULT 0,
  registration_date DATETIME NOT NULL,
  modified DATETIME NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_level) REFERENCES user_level(level_id) -- MariaDB: CONSTRAINT email_unique UNIQUE (email)
);

INSERT INTO
  user_level (level_id, description)
VALUES
  (0, 'General Access'),
  (1, 'Administrator');