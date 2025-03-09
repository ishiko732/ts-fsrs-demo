-- Create users table
CREATE TABLE users (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  password varchar(255) DEFAULT '',
  oauthId varchar(255) NOT NULL,
  oauthType varchar(255) NOT NULL,
  created timestamptz NOT NULL DEFAULT now(),
  updated timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_index ON users(email);
CREATE UNIQUE INDEX users_oauth_index ON users(oauthId, oauthType);
CREATE INDEX users_created_index ON users(created);

-- Create decks table
CREATE TABLE decks (
  id serial PRIMARY KEY,
  uid integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description text,
  fsrs jsonb NOT NULL,
  card_limit jsonb NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  created timestamptz NOT NULL DEFAULT now(),
  updated timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX decks_uid_index ON decks(uid);
CREATE INDEX decks_created_index ON decks(created);

-- Create notes table
CREATE TABLE notes (
  id serial PRIMARY KEY,
  uid integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  did integer NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  sourceId varchar(255),
  extend jsonb NOT NULL DEFAULT '{}'::jsonb,
  deleted boolean NOT NULL DEFAULT false,
  created timestamp NOT NULL DEFAULT now(),
  updated timestamp NOT NULL DEFAULT now()
);

CREATE INDEX notes_uid_index ON notes(uid);
CREATE INDEX notes_did_index ON notes(did);

-- Create cards table
CREATE TABLE cards (
  id serial PRIMARY KEY,
  uid integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  did integer NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  nid integer NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  due integer NOT NULL,
  stability float8 NOT NULL,
  difficulty float8 NOT NULL,
  elapsed_days integer NOT NULL,
  last_elapsed_days integer NOT NULL,
  scheduled_days integer NOT NULL,
  reps integer NOT NULL,
  state varchar(50) NOT NULL,
  last_review timestamptz,
  suspended boolean NOT NULL DEFAULT false,
  deleted boolean NOT NULL DEFAULT false,
  created timestamptz NOT NULL DEFAULT now(),
  updated timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cards_uid_did_index ON cards(uid, did);

-- Create revlog table
CREATE TABLE revlog (
  id serial PRIMARY KEY,
  uid integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  did integer NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  cid integer NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  grade varchar(50) NOT NULL,
  state varchar(50) NOT NULL,
  due timestamptz NOT NULL,
  stability float8 NOT NULL,
  difficulty float8 NOT NULL,
  elapsed_days integer NOT NULL,
  last_elapsed_days integer NOT NULL,
  scheduled_days integer NOT NULL,
  review timestamptz NOT NULL,
  duration integer NOT NULL,
  deleted boolean NOT NULL DEFAULT false
);

CREATE INDEX revlog_uid_index ON revlog(uid);
CREATE INDEX revlog_did_index ON revlog(uid, did);
CREATE INDEX revlog_cid_index ON revlog(uid, cid);

-- Create extra table
CREATE TABLE extras (
  id serial PRIMARY KEY,
  uid integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  did integer NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description text,
  extra jsonb NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  created timestamptz NOT NULL DEFAULT now(),
  updated timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX extra_uid_index ON extras(uid);
CREATE INDEX extra_did_index ON extras(uid, did);