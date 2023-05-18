const GetIndeedJobListings = require("../src/ipcFunctions/GetIndeedJobListings");

const config = {
    searchQueries: ["software developer", "software engineer"],
    location: "New York",
    numPages: 2,
    waitTimeMs: 5000,
    closeBrowser: false,
    headless: false,
    maxJobsDescToScrape: 2,
    maxConcurrentPageLimit: 3,
    api_key: "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",
    maxGptAnalysis: 1
};

(async () => {
    const result = await GetIndeedJobListings(null, config);
    console.log(result);
})();