# Web Content Migration Tool - Node.js (v. 1.0)

CSV-guided content migration tool that serves two purposes: 
- Scrapes webpage content and stores local copies
- Migrates webpage content from local copies into predefined templates

Currently, this repo contains the web scraping portion.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Versions](#versions)
- [Contact](#contact)


## Introduction <a name="introduction"></a>

This repo serves to offer a web scraping experience using Node.js. 

## Getting Started <a name="getting-started"></a>

### Prerequisites <a name="prerequisites"></a>

Node.js and NPM should be installed on the local machine.

### Installation/Instructions <a name="installation"></a>

- Clone or download the files
- In the preferred IDE, navigate via terminal into the project folder and run npm install 
- In scraper/csv, place a CSV which contains relative paths to pages to be scraped. Make sure relative paths to the homepage of a folder ends in '/', or else it will be treated as a stand-alone file.
- In the /scraper directory, create a file called .env
- In /scraper/.env, enter the following global variables:

USER_AGENT=[Replace this with text to be used for User-Agent header]
BASE_URL=[Replace this with full base URL to the site being scraped]

- In scraper/config.js, adjust the value of the default values to the required values. Make sure the pathColName variable contains the name of the column header in the CSV which contains the file paths. The variables defaultExtension and defaultIndexName are used for creating local copies. Update csvPath to point to the correct CSV.
- Navigate into the scraper directory using the IDE terminal. 
- Run node scrape.js to initialize the program. Log data will output in scraper/logs, and if successful, scraper/files will be created that contains copies of the scraped HTML.

# Version History <a name="versions"></a>

## [1.0.0] - 2024-02-12

## Contact <a name="contact"></a>

- Michael Hanson
- michaeledwardhanson@gmail.com