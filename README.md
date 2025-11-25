# TXI Matheus challenge

## Prerequisites

- node 22

- linux or wsl

## Run instructions

For a clean project run, execute

```shell
    npm run prepare-and-run
```

This will create and populate the database, build the application and start it on port 3000

The images and database are already fetched, you can see the script used to fetch them in the scripts folder, if you wish to execute this script simply run

```shell
   npm run download-images
```

If needed, ou can restart the application by executing

```shell
    npm run start
```

## Design choices

The application was built with Next.js and sqlite, and the fetchApi was used to consume the PokéApi

### Next.js

> Next was used for the SSR capabilities, allowing the API to stay hiddend, and allowing future SEO improvements. NExt was also chosen for it's powerfull cacheing tools, that would be usefull in the pokemons list

### sqlite

> sqlite was chosen because it offers an easy and robust implementation that is more likely to work locally on a foreign computer than NoSql alternatives. Also, using sql is good for code maintenence since most developers are familiar with it.

> But The nail on the coffin was this, the faster query on large datasets that NoSql databases provide would not show to be very effective in this scenario since there are, at max, 1164 pokémons. So I traded slightly better performance for a more robust, known and secure aproach

### FetchAPI

> FetchAPI was chosen since the project would not benefit of more complex http libraries, but specially because fetch seamlessly integrates with Next cache system, having it's request cached automaticly

## AI agents

Chat GPT 5.1 was used to help implement this project specially helping with architecture decisions and the local database part of the project. The full conversation can be seen here https://chatgpt.com/share/6923e9cc-aa28-8006-bf5c-d176f514430a

## GIT

The project is publicly availabe on the link https://github.com/MatheusFraresso/matheus-fraresso-txi-challenge
