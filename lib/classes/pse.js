const dotenv = require("dotenv");
dotenv.config();

const axios = require('axios');
const ExcelJS = require('exceljs');

class PSE {
    constructor() {
        this.action = null;
    }

    setAction(action) { this.action = action; }
    getAction() { return this.action; }

    clearDataSheet(workbook) {
        workbook.xlsx.readFile(`${process.env.OUTPUT_FILE}`).then(() => {
            const dataSheet = workbook.worksheets[0];
            const dataCount = dataSheet.rowCount;
            for (let i = dataCount; i > 1; i--) { dataSheet.spliceRows(i, 1); }
            
            workbook.xlsx.writeFile(`${process.env.OUTPUT_FILE}`);
        });
    }  

    async generateOutputData() {
        try {
            const destinationWB = new ExcelJS.Workbook();
            this.clearDataSheet(destinationWB);

            const response = await axios.get(process.env.REFERENCE_WEBSITE);
            const data = response.data;
            if (data !== undefined || data !== null) {

                return await destinationWB.xlsx.readFile(`${process.env.OUTPUT_FILE}`).then(async() => {
                    const destinationSheet = destinationWB.worksheets[0];
                    data.stock.forEach((stock) => {
                        const newRowData = [
                            stock.name,
                            stock.symbol,
                            parseFloat(stock.price.amount).toFixed(3),
                            stock.volume,                            
                            stock.percent_change,
                            stock.price.currency
                        ];
                        // console.log(newRowData)
                        destinationSheet.addRow(newRowData);
                    });
                    await destinationWB.xlsx.writeFile(`${process.env.OUTPUT_FILE}`);

                    destinationSheet.eachRow({ includeEmpty: false, firstRow: 1}, (row, rowNumber) => {
                        if (rowNumber > 1) {
                            row.getCell(3).alignment = { horizontal: 'right' }; // VOLUME
                        }
                    });                    

                    destinationWB.xlsx.writeFile(`${process.env.OUTPUT_FILE}`).then(() => {
                        return true;
    
                    }).then(() => {
                        return true;
    
                    }).catch((err) => {
                        console.error(err);
                        return false;
                    });
                }).then(async() => {
                    return {
                        isProcessed: true,
                        statusMsg: `PSE DATA CAPTURE COMPLETE. PLEASE CHECK THE OUTPUT FOLDER.`
                    }
    
                }).catch(async(err) => {
                    return {
                        isProcessed: false,
                        statusMsg: err
                    }
                });

            } else {
                return {
                    isProcessed: false,
                    statusMsg: `SOURCE WEBSITE IS DOWN.`
                }
            }            
        } catch(e) {
            return {
                isProcessed: false,
                statusMsg: e
            }   
        }
    }
}

module.exports = { PSE }