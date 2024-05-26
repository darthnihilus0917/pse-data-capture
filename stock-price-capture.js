const readline = require("readline");
const dotenv = require("dotenv");
dotenv.config();

const { processes } = require('./lib/options/options');
const { loadTitle } = require('./lib/utils/utils');
const { appLabels } = require('./lib/contants/contants');

const { generatePSEData } = require('./lib/processes/generateDataSource');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

function askQuestion(question, options) {
    return new Promise((resolve, reject) => {
        const numberedOptions = options.map((option, index) => `[${index + 1}] ${option}`);
        rl.question(question + "\n" + numberedOptions.join("\n") + "\n", (answer) => {
                const selectedOption = options[parseInt(answer) - 1];
                if (selectedOption) {
                    resolve(selectedOption.toUpperCase());
                } else {
                    console.log(appLabels.invalidAnswer);
                    askQuestion(question, options).then(resolve).catch(reject);
                }
            }
        );
    });
}

async function main() {
    try {
        loadTitle();

        let actions = processes;
        let action = "";

        while (action !== "EXIT") {
            action = await askQuestion("\nWhat do you want to do?", actions);

            if (action === "EXIT") {
                const confirmation = await askQuestion(`\n${appLabels.confirmExit}`, ["Yes", "No"]);
                if (confirmation === "NO") {
                    action = ""; // Reset action to continue the loop
                    continue;
                }
                console.log(appLabels.closingApp);
                rl.close();
                return;
            }
            console.log('\nYou selected:', action);

            if (action === "CAPTURE PSE STOCK PRICE") {
                console.log(`Generating PSE data source. Please wait...`);
                await generatePSEData(action);
            }            
        }
    } catch (err) {
        console.error(err.message);
  
    } finally {
        rl.close();
    }
}
  
main();