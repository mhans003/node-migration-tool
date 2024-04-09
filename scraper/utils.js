const fs = require('fs');

const { errorOutputFile, logOutputFile } = require('./config');

function writeToLog(message, isError = false) {
    const outputFile = isError ? errorOutputFile : logOutputFile;
    fs.appendFileSync(outputFile, `${message}\n`, (err) => {
        if(err) console.error(`Error writing to output file: ${err}`);
    });
}

function initLogs() {
    const currentTime = getTime();

    writeToLog(`Successful downloads - ${currentTime}\n-----`);
    writeToLog(`Download Errors - ${currentTime}\n-----`, true);
}

function closeLogs() {
    writeToLog(`-----\n\n`, true);
    writeToLog(`-----\n\n`);
}

function getTime() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';

    //Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours? hours: 12; 

    //Prevent single digit
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${month}/${day}/${year} ${hours}:${formattedMinutes} ${ampm}`;
}

module.exports = {
    initLogs,
    closeLogs,
    writeToLog
}