# Schreef

A Schreefy Discord bot for doing Schreefy things.

*Schreef is love*, **Schreef is life**

# Installation

Schreef uses the [yarn package manager](https://yarnpkg.com/en/) to managed dependencies.

Once yarn is installed, install schreef's dependencies with

```
yarn install
```

# Running Schreef

Schreef requires that some environment variables be set in order to run, most importantly `DISCORD_API_KEY`.
In production, we set these using config vars provided by Heroku.
Locally, we use the [dotenv package](https://github.com/motdotla/dotenv). To use dotenv locally, create a `.env` file in the root directory, and fill it with environment variables that need to be set.

```
DISCORD_API_KEY=<discord api token>
DYNAMODB_TABLE_NAME=table1
...
```

To run schreef, use yarn.

```
yarn start
```
