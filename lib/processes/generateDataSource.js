const dotenv = require("dotenv");
dotenv.config();

const { PSE } = require('../classes/pse');

const generatePSEData = async(action) => {    
    const pse = new PSE();
    pse.action = action;
    const { isProcessed, statusMsg } = await pse.generateOutputData();
    if (isProcessed) {
        console.log(statusMsg);
    } else {
        console.log(statusMsg);
    }
}

module.exports = { generatePSEData };