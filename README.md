# Schreef

A Schreefy Discord bot for doing Schreefy things.

*Schreef is love*, **Schreef is life**

# Installation

Schreef uses the [yarn package manager](https://yarnpkg.com/en/) to manage dependencies.

Once yarn is installed, install schreef's dependencies with

```
yarn install
```

# Running Schreef

## Environment Variables

Schreef requires that some environment variables be set in order to run, most importantly `DISCORD_API_KEY`.
In production, we set these using config vars provided by Heroku.
Locally, we use the [dotenv package](https://github.com/motdotla/dotenv). To use dotenv locally, change the  `.env.EXAMPLE` file in the root directory to `.env`, and fill it with environment variables that need to be set.

```
DISCORD_API_KEY=<discord api token>
OMDB_API_KEY=<omdb api key>
...
```

## Discord API Token

To run locally, you'll need to get your own Discord API token. You can get one by creating an app in the [Discord developer portal](https://discordapp.com/developers/applications/me). In your app's settings, make sure you enable it as an "App Bot User". Then you can get your token from the Bot settings section. It should go without saying, but **don't share this publicly**.

Set this as `DISCORD_API_KEY` in your `.env`.

## OMDB API Key

To run the _movie_ module locally, you need to get an API key for [OMBD](https://www.omdbapi.com/). You can get one [here](https://www.omdbapi.com/apikey.aspx).

Set this as `OMDB_API_KEY` in you `.env`.

## Starting Schreef

To start schreef, use yarn.

```
yarn start
```
