import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { queryNotionDatabase, retreiveNotionPageProperties, createNotionDatabasePages, } from "./repository/notionDatabaseRepo";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
const japanDevUrl = "https://api.japan-dev.com/api/v1/jobs?limit=300";
const databaseId = process.env.NOTION_DATABASE_ID;
const propertyId = process.env.NOTION_ID_PROPERTY;
async function getJobIds() {
    let propertyIdQuery = [];
    let results = [];
    let databaseQuery = await queryNotionDatabase(databaseId);
    results = [...databaseQuery.results];
    while (databaseQuery.has_more) {
        const nextCursor = databaseQuery.next_cursor;
        databaseQuery = await queryNotionDatabase(databaseId, nextCursor);
        results = [...results, ...databaseQuery.results];
    }
    await Promise.all(results
        .map((page) => page.id)
        .map(async (pageId) => {
        const page = await retreiveNotionPageProperties(pageId, propertyId);
        const jobId = Object.values(page).pop();
        propertyIdQuery = [...propertyIdQuery, jobId];
    }));
    return propertyIdQuery;
}
app.get("/api", async (req, res) => {
    if (req.method !== "GET") {
        return res.status(405).send({ err: "Method Not Allowed" });
    }
    const response = await axios.get(japanDevUrl);
    if (response.status !== 200) {
        console.log(response.status);
        throw new Error("Something went wrong trying to get the resource");
    }
    try {
        const jobsFromJapanDev = response.data.data;
        const jobIdsFromNotion = await getJobIds();
        if (jobIdsFromNotion.length === 0) {
            console.log("Notion Database is empty. Populating datbase with jobs from japan-dev.com");
            await createNotionDatabasePages(jobsFromJapanDev, databaseId);
            res.status(200).send({
                data: `${jobsFromJapanDev.length} Jobs from Japan-Dev have been added to notion database`,
            });
        }
        else {
            console.log("Notion Datbase is not empty. Checking to see if any new jobs have been added to Japan-Dev");
            const jobsNotIncludedInNotion = jobsFromJapanDev.filter((job) => {
                const jobId = job.attributes.id;
                if (jobIdsFromNotion.includes(jobId)) {
                    return null;
                }
                return job;
            });
            if (jobsNotIncludedInNotion.length === 0) {
                console.log("No new jobs have been added");
                res.status(200).send({ data: "No New Jobs Found!" });
            }
            else {
                await createNotionDatabasePages(jobsNotIncludedInNotion, databaseId);
                res.status(200).send({
                    data: `${jobsNotIncludedInNotion.length} new jobs have been found! Adding them to the notion database`,
                });
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            err: "Something went wrong! Notion Database could not be updated!",
        });
    }
});
export default app;
//# sourceMappingURL=index.js.map