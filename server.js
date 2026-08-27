/* =========================================
    AJB IMPORT SERVER
   ExcelJS Integration
========================================= */

const express = require("express");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;


/* Allow local file and preview-server pages to submit quotes. */
app.use((req, res, next) => {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});


/* =========================================
   MIDDLEWARE
========================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* =========================================
   FRONTEND
========================================= */

app.use(express.static(__dirname));


/* =========================================
   EXCEL FILE
========================================= */

const excelFile = path.join(
    process.env.EXCEL_DATA_DIR || __dirname,
    "CoastBridge_Quote_Submissions.xlsx"
);


/* =========================================
   EXCEL HEADERS
========================================= */

const headers = [
    "Submission Date",
    "Customer Name",
    "Company",
    "Phone",
    "Email",
    "Service Requested",
    "Origin",
    "Destination",
    "Cargo / Package Details",
    "Cargo Weight",
    "Cargo Volume",
    "Shipping Date",
    "Preferred Contact",
    "Message",
    "Status",
    "Admin Notes"
];


async function appendToGoogleSheet(data) {

    const credentials = JSON.parse(
        process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    );

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
            "https://www.googleapis.com/auth/spreadsheets"
        ]
    });

    const sheets = google.sheets({
        version: "v4",
        auth
    });

    const values = [[
        new Date().toISOString(),
        data.fullName || "",
        data.company || "",
        data.phone || "",
        data.email || "",
        data.service || "",
        data.origin || "",
        data.destination || "",
        data.cargoType || "",
        data.cargoWeight || "",
        data.cargoVolume || "",
        data.shippingDate || "",
        "Email / Phone",
        data.message || "",
        "New",
        ""
    ]];

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Quote Submissions!A:P",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values }
    });

    return response.data.updates.updatedRange;
}


/* =========================================
   STATUS OPTIONS
========================================= */

const statusOptions = [
    "New",
    "Contacted",
    "Quoted",
    "In Progress",
    "Completed",
    "Cancelled"
];


/* =========================================
   CREATE WORKBOOK IF MISSING
========================================= */

async function createWorkbook() {

    if (fs.existsSync(excelFile)) {
        return;
    }

    const workbook =
        new ExcelJS.Workbook();


    const worksheet =
        workbook.addWorksheet(
            "Quote Submissions"
        );


    /* ================================
       COASTBRIDGE TITLE
    ================================= */

    worksheet.mergeCells(
        "A1:P1"
    );

    const title =
        worksheet.getCell("A1");

    title.value =
        "COASTBRIDGE LOGISTICS GHANA";

    title.font = {
        name: "Calibri",
        size: 18,
        bold: true,
        color: {
            argb: "FFFFFFFF"
        }
    };

    title.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "FF06263A"
        }
    };

    title.alignment = {
        horizontal: "center",
        vertical: "middle"
    };

    worksheet.getRow(1).height = 32;


    /* ================================
       SUBTITLE
    ================================= */

    worksheet.mergeCells(
        "A2:P2"
    );

    const subtitle =
        worksheet.getCell("A2");

    subtitle.value =
        "CUSTOMER QUOTE & CONTACT SUBMISSIONS";

    subtitle.font = {
        name: "Calibri",
        size: 11,
        bold: true,
        color: {
            argb: "FF06263A"
        }
    };

    subtitle.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "FFD4A62A"
        }
    };

    subtitle.alignment = {
        horizontal: "center",
        vertical: "middle"
    };


    /* ================================
       HEADER
    ================================= */

    const headerRow =
        worksheet.getRow(4);

    headers.forEach(
        (header, index) => {

            const cell =
                headerRow.getCell(
                    index + 1
                );

            cell.value = header;

            cell.font = {
                bold: true,
                color: {
                    argb: "FFFFFFFF"
                }
            };

            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: "FF06263A"
                }
            };

            cell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true
            };

        }
    );

    headerRow.height = 30;


    /* ================================
       COLUMN WIDTHS
    ================================= */

    const widths = [
        22, 25, 25, 18,
        32, 25, 22, 22,
        40, 18, 18, 18,
        20, 45, 18, 40
    ];

    widths.forEach(
        (width, index) => {

            worksheet.getColumn(
                index + 1
            ).width = width;

        }
    );


    /* ================================
       STATUS DROPDOWN
    ================================= */

    for (
        let row = 5;
        row <= 1000;
        row++
    ) {

        worksheet.getCell(
            `O${row}`
        ).dataValidation = {

            type: "list",

            allowBlank: true,

            formulae: [
                `"${statusOptions.join(",")}"`
            ],

            showErrorMessage: true,

            errorTitle:
                "Invalid Status",

            error:
                "Please select a valid CoastBridge status."

        };

    }


    /* ================================
       FILTER
    ================================= */

    worksheet.autoFilter = {
        from: "A4",
        to: "P4"
    };


    /* ================================
       FREEZE HEADER
    ================================= */

    worksheet.views = [
        {
            state: "frozen",
            ySplit: 4
        }
    ];


    /* ================================
       SAVE
    ================================= */

    await workbook.xlsx.writeFile(
        excelFile
    );

}


/* =========================================
   INITIALIZE
========================================= */

createWorkbook()
    .catch(error => {

        console.error(
            "Unable to create Excel workbook:",
            error
        );

    });


/* =========================================
   QUOTE API
========================================= */

app.post(
    "/api/quote",
    async (req, res) => {

        try {

            const {
                fullName,
                company,
                email,
                phone,
                service,
                origin,
                destination,
                cargoType,
                cargoWeight,
                cargoVolume,
                shippingDate,
                message
            } = req.body;


            /* ================================
               VALIDATION
            ================================= */

            if (
                !fullName ||
                !email ||
                !phone ||
                !service ||
                !origin ||
                !destination ||
                !message
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please complete all required fields."

                });

            }


            if (
                process.env.GOOGLE_SHEET_ID &&
                process.env.GOOGLE_SERVICE_ACCOUNT_JSON
            ) {

                const updatedRange =
                    await appendToGoogleSheet({
                        fullName,
                        company,
                        email,
                        phone,
                        service,
                        origin,
                        destination,
                        cargoType,
                        cargoWeight,
                        cargoVolume,
                        shippingDate,
                        message
                    });

                return res.status(200).json({
                    success: true,
                    message:
                        "Your quote request has been received successfully.",
                    range: updatedRange
                });

            }


            /* ================================
               LOAD EXISTING WORKBOOK
            ================================= */

            const workbook =
                new ExcelJS.Workbook();


            await workbook.xlsx.readFile(
                excelFile
            );


            /* ================================
               GET EXISTING SHEET
            ================================= */

            let worksheet =
                workbook.getWorksheet(
                    "Quote Submissions"
                );


            /* ================================
               SAFETY FALLBACK
            ================================= */

            if (!worksheet) {

                worksheet =
                    workbook.addWorksheet(
                        "Quote Submissions"
                    );

            }


            /* ================================
               FIND NEXT EMPTY ROW
            ================================= */

            const nextRow =
                Math.max(
                    worksheet.lastRow.number + 1,
                    5
                );


            /* ================================
               DATA
            ================================= */

            const row =
                worksheet.getRow(
                    nextRow
                );


            row.values = [

                new Date(),

                fullName || "",

                company || "",

                phone || "",

                email || "",

                service || "",

                origin || "",

                destination || "",

                cargoType || "",

                cargoWeight || "",

                cargoVolume || "",

                shippingDate || "",

                "Email / Phone",

                message || "",

                "New",

                ""

            ];


            /* ================================
               DATE FORMAT
            ================================= */

            row.getCell(1).numFmt =
                "dd-mmm-yyyy hh:mm";


            /* ================================
               WRAP TEXT
            ================================= */

            row.eachCell(
                cell => {

                    cell.alignment = {
                        vertical: "top",
                        wrapText: true
                    };

                }
            );


            /* ================================
               STATUS DROPDOWN
            ================================= */

            row.getCell(15)
                .dataValidation = {

                    type: "list",

                    allowBlank: true,

                    formulae: [
                        `"${statusOptions.join(",")}"`
                    ],

                    showErrorMessage: true,

                    errorTitle:
                        "Invalid Status",

                    error:
                        "Please select a valid CoastBridge status."

                };


            /* ================================
               STATUS DEFAULT
            ================================= */

            row.getCell(15).value =
                "New";


            /* ================================
               ROW HEIGHT
            ================================= */

            row.height = 42;


            /* ================================
               PRESERVE / APPLY FILTER
            ================================= */

            worksheet.autoFilter = {
                from: "A4",
                to: "P4"
            };


            /* ================================
               PRESERVE FREEZE PANES
            ================================= */

            worksheet.views = [
                {
                    state: "frozen",
                    ySplit: 4
                }
            ];


            /* ================================
               SAVE WORKBOOK
            ================================= */

            await workbook.xlsx.writeFile(
                excelFile
            );


            console.log(
                "======================================"
            );

            console.log(
                "NEW COASTBRIDGE QUOTE"
            );

            console.log(
                "Customer:",
                fullName
            );

            console.log(
                "Service:",
                service
            );

            console.log(
                "Origin:",
                origin
            );

            console.log(
                "Destination:",
                destination
            );

            console.log(
                "Excel Row:",
                nextRow
            );

            console.log(
                "======================================"
            );


            /* ================================
               RESPONSE
            ================================= */

            return res.status(200).json({

                success: true,

                message:
                    "Your quote request has been received successfully.",

                row: nextRow

            });


        } catch (error) {

            console.error(
                "QUOTE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "We could not save your quote request. Please try again."

            });

        }

    }
);


/* =========================================
   SERVER STATUS
========================================= */

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success: true,

            service:
                "CoastBridge Logistics Ghana",

            status:
                "online",

            timestamp:
                new Date().toISOString()

        });

    }
);


/* =========================================
    START SERVER
========================================= */

if (require.main === module) {

     app.listen(
          PORT,
          () => {

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            " COASTBRIDGE LOGISTICS GHANA"
        );

        console.log(
            " Server running successfully"
        );

        console.log(
            ` http://localhost:${PORT}`
        );

        console.log(
            "======================================"
        );

        }
    );

}

module.exports = app;