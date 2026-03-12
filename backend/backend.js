"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const fs_1 = require("fs");
const morgan_1 = tslib_1.__importDefault(require("morgan"));
const swagger_ui_express_1 = tslib_1.__importDefault(require("swagger-ui-express"));
const swagger_output_json_1 = tslib_1.__importDefault(require("../backend/swagger-output.json"));
const app = (0, express_1.default)();
const PORT = 3000;
// Middleware to parse request body
app.use(express_1.default.json());
// Add Swagger UI to the app
const options = { swaggerOptions: { tryItOutEnabled: true } };
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default, options));
// Enabled CORS (Cross-Origin Resource Sharing):
app.use((0, cors_1.default)());
// Logger middleware: log all requests to the console
app.use((0, morgan_1.default)("dev"));
app.get("/api/journeys", async (req, res) => {
    // #swagger.tags = ['Journeys']
    // #swagger.summary = 'Read all data from journeys table'
    try {
        const data = await readDataFromFile("journeys");
        if (data) {
            res.send(data.sort((a, b) => a.id - b.id));
        }
        else {
            res.status(404).send({ message: "Hiba az adatok olvasásakor!" });
        }
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
});
app.get("/api/journeys/:page/:limit/:filter", async (req, res) => {
    // #swagger.tags = ['Journeys']
    // #swagger.summary = 'Az utazási ajánlatok lekérdezése szűréssel és paginálással'
    // #swagger.parameters['page'] = { example: '1', description: 'Hányadik oldaltól kezdjünk (min: 1)' }
    // #swagger.parameters['limit'] = { example: '2', description: 'Mennyi rekord történjen küldésre oldalanként' }
    // #swagger.parameters['filter'] = { example: 'tenger', description: 'Csillag karakter (*), ha nincs szűrés.' }
    try {
        const data = await readDataFromFile("journeys");
        let filteredJourneys = [];
        if (req.params.filter != "*") {
            const filter = req.params.filter.toLocaleLowerCase();
            filteredJourneys = data.filter(e => e.description.toLowerCase().includes(filter));
        }
        else {
            filteredJourneys = data;
        }
        const page = parseInt(req.params.page);
        const limit = parseInt(req.params.limit);
        const fromIndex = (page - 1) * limit;
        const toIndex = fromIndex + limit;
        res.setHeader("number-of-records", filteredJourneys.length);
        res.send(filteredJourneys.slice(fromIndex, toIndex).map(ff => {
            return { ...ff };
        }));
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
});
app.get("/api/journeys/short", async (req, res) => {
    // #swagger.tags = ['Journeys']
    // #swagger.summary = 'Read limited journey data'
    try {
        const data = await readDataFromFile("journeys");
        if (data) {
            res.send(data
                .map((j) => {
                return {
                    id: j.id,
                    destination: `${j.country} (${j.departure})`,
                };
            })
                .sort((a, b) => a.id - b.id));
        }
        else {
            res.status(404).send({ message: "Hiba az adatok olvasásakor!" });
        }
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
});
app.post("/api/reserve", async (req, res) => {
    // #swagger.tags = ['Reservations']
    // #swagger.summary = 'Create a new reservation'
    // #swagger.description = 'Creates a new reservation for a journey. All fields are required.'
    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        journeyId: { type: "number", description: "ID of the journey" },
                        name: { type: "string", description: "Name of the participant" },
                        email: { type: "string", description: "Email address of the participant" },
                        numberOfParticipants: { type: "number", description: "Number of participants, between 1 and 49" },
                        lastCovidVaccineDate: { type: "string", format: "date", description: "Date of the last COVID vaccine" },
                        acceptedConditions: { type: "boolean", description: "Whether the participant accepted the terms and conditions" }
                    },
                    required: ["journeyId", "name", "email", "numberOfParticipants", "lastCovidVaccineDate", "acceptedConditions"],
                    example: {
                        journeyId: 2,
                        name: "Kiss Dóra",
                        email: "kiss.dora@mail.hu",
                        numberOfParticipants: 2,
                        lastCovidVaccineDate: "2024-08-28",
                        acceptedConditions: true
                    }
                }
            }
        }
    } */
    /* #swagger.responses[201] = {
        description: "Reservation successfully created",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        id: { type: "number", description: "ID of the newly created reservation" }
                    },
                    example: { id: 101 }
                }
            }
        }
    } */
    /* #swagger.responses[400] = {
        description: "Bad request, validation failed",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        message: { type: "string", description: "Error message explaining why the request failed" }
                    },
                    example: { message: "A résztvevők számának nagyobbnak kell lennie nullánál." }
                }
            }
        }
    } */
    try {
        const data = await readDataFromFile("reservations");
        if (data) {
            const newReservation = req.body;
            newReservation.id = Math.max(...data.map(e => e.id)) + 1;
            if (Object.keys(newReservation).length != 7 || !newReservation.journeyId || !newReservation.name || !newReservation.email || !newReservation.numberOfParticipants || !newReservation.lastCovidVaccineDate || typeof (newReservation.acceptedConditions) !== "boolean")
                throw new Error("A kérés mezői nem megfelelők, vagy nem tartalmaznak értéket.");
            if (newReservation.numberOfParticipants <= 0)
                throw new Error("A résztvevők számának nagyobbnak kell lennie nullánál.");
            if (newReservation.numberOfParticipants >= 50)
                throw new Error("A résztvevők számának kevesebbnek kell lennie 50-nél.");
            if (newReservation.acceptedConditions !== true)
                throw new Error("A feltételek elfogadása kötelező.");
            data.push(newReservation);
            const response = await saveDataToFile("reservations", data);
            if (response == "OK") {
                res.status(201).send({ id: newReservation.id });
            }
            else {
                res.status(400).send({ message: response });
            }
        }
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`Jedlik Json-Backend-Server Swagger: http://localhost:${PORT}/docs`);
});
// Utility functions to read/write data from/to file
async function readDataFromFile(table) {
    try {
        const data = await fs_1.promises.readFile(`db_${table}.json`, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        return [error.message];
    }
}
async function saveDataToFile(table, data) {
    try {
        await fs_1.promises.writeFile(`db_${table}.json`, JSON.stringify(data, null, 2), "utf8");
        return "OK";
    }
    catch (error) {
        return error.message;
    }
}
//# sourceMappingURL=backend.js.map