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

    try {
        // Check if the CSV file exists
        const csvExists = await checkCsvExistence(csvPath);
        if (!csvExists) {
            console.error(`CSV file '${csvPath}' not found.`);
            writeToLog(`CSV file '${csvPath}' not found. Aborting scraping.`, true);
            // End logs for scraping 
            closeLogs();
            return;
        }

        // Flag to track if the required column exists
        let columnExists = false; 

        // Read the CSV and check for the required column
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                if (row[pathColName] !== undefined) {
                    columnExists = true;
                }
            })
            .on('end', () => {
                if (!columnExists) {
                    console.error(`Column with the name '${pathColName}' not found in the CSV.`);
                    writeToLog(`Column with the name '${pathColName}' not found in the CSV. Aborting scraping.`, true);
                    // End logs for scraping 
                    closeLogs();
                    return;
                }

                // Proceed with scraping if the required column exists
                console.log('Column found. Proceeding with scraping.');
                writeToLog(`Column with the name '${pathColName}' found in the CSV. Proceeding with scraping.`);

                // Read the CSV again and perform scraping
                fs.createReadStream(csvPath)
                    .pipe(csv())
                    .on('data', async (row) => {
                        // Read col name specified in config to get relative path
                        const url = process.env.BASE_URL + row[pathColName];
                        await scrapeFile(url);
                    })
                    .on('end', () => {
                        console.log('Done.');
                        writeToLog("Done!");
                        // End logs for scraping 
                        closeLogs();
                    });
            });
    } catch (err) {
        console.error('Error occurred while checking CSV file existence:', err);
        writeToLog(`Error occurred while checking CSV file existence: ${err}`, true);
        // End logs for scraping 
        closeLogs();
    }
}

// Function to check if CSV file exists
function checkCsvExistence(csvPath) {
    return new Promise((resolve) => {
        fs.access(csvPath, fs.constants.F_OK, (err) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}


// Main execution
//initOutput();
scrapeFiles();
