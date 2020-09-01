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
  activated CHAR(36) NULL,
  registration_date DATETIME NOT NULL DEFAULT NOW(),
  modified DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_level) REFERENCES user_level(level_id) ON UPDATE CASCADE
);

INSERT INTO
  user_level (level_id, description)
VALUES
  (0, 'General Access'),
  (1, 'Administrator');

CREATE
OR REPLACE VIEW show_users AS
SELECT
  *
FROM
  users
ORDER BY
  last_name ASC;