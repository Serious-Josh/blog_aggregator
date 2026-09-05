gator is a cli driven rss aggregator

gator runs using Typescript and postgresDB

//Dependencies
-The most recent LTS version of NodeJS
-PostgresDB
    +A database named "gator" will need to be created using either `createdb gator` or `CREATE DATABASE gator;` within the postgresdb cli
    +Running `npx drizzle-kit generate` and `npx drizzle-kit migrate` is necessary for the database to be setup correctly


//Installation (once downloaded)
-`npm install` to install other dependencies


//Config
Create a .gatorconfig.json at your home directory (ex. ~/user_name/)
A template for said config file is:

    `{"db_url":"postgres://username:password@localhost:5432/gator","current_user_name":"name"}`


//Running
Run gator commands using:

    `npm start -- <command> [args...]`

For example:

    `npm start -- register John`


//Commands
-register : Create a new user
-login: Login a created user
-users: Get a list of all created users
-addFeed: Add a new rss feed
-feeds: Get a list of all feeds registered to the database
-follow: Follow a feed from current user
-following: Get a list of all feeds the current user is following
-unfollow: Unfollow a specified feed for the current user
-agg: Main post aggregator function. Scrapes feeds and adds new posts to database
-browse: See most recent posts added for current user with specific limit