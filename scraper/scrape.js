const axios = require('axios');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

require('dotenv').config();

// Import variables and functions
const { csvPath, pathColName, defaultExtension, defaultIndexName } = require('./config');
const { writeToLog, initLogs, closeLogs } = require('./utils');

//Handle HTTP requests
async function getURL(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                //User Agent header info stored in config
                'User-Agent': process.env.USER_AGENT
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to scrape: ${url} (${error.message})`);
        writeToLog(`Failed to scrape: ${url} (${error.message})`, true);
        return "";
    }
}

//Scrape a single URL and store file locally
async function scrapeFile(url) {
    console.log(`Attempting to scrape: ${url}`);
    writeToLog(`Attempting to scrape: ${url}`);
    try {
        const pageContent = await getURL(url);
        if (!pageContent) return;

        const fileEnding = await getFileEnding(url);

        const filePath = path.join(__dirname, 'files', new URL(url).pathname + fileEnding);
        const folderPath = path.dirname(filePath);

        // Create directories if they don't exist
        fs.mkdirSync(folderPath, { recursive: true });

        console.log('Writing file: ' + filePath);
        writeToLog('Writing file: ' + filePath);

        fs.writeFileSync(filePath, pageContent);
    } catch (error) {
        console.error(`Failed to scrape ${url}: ${error}`);
        writeToLog(`Failed to scrape "${url}": ${error}`, true);
    }
}

async function getFileEnding(url) {
    // Check if URL ends with '/'
    if (url.endsWith('/')) {
        return defaultIndexName + defaultExtension;
    } else {
        // Check if URL ends with defaultExtension
        if (!url.endsWith(defaultExtension)) {
            return defaultExtension;
        }
    }
    return '';
}

// Function to scrape files based on the provided CSV
async function scrapeFiles() {
    //Begin logs for scraping
    initLogs();

    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', async (row) => {
            //Read col name specified in config to get relative path
            const url = process.env.BASE_URL + row[pathColName]; 
            await scrapeFile(url);
        })
        .on('end', () => {
            console.log('Done.');
            writeToLog("Done!");
        });

    //End logs for scraping 
    closeLogs();
}

// Main execution
//initOutput();
scrapeFiles();
