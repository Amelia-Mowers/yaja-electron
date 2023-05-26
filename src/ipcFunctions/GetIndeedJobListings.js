const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function GetIndeedJobListings(tools, config) {
    try {
        const searchQuery = config.searchQueries.join();
        const location = config.location;
        const numPages = config.numPages;
        const waitTimeMs = config.waitTimeMs;
        const headless = config.headless;
        const closeBrowser = config.closeBrowser;

        puppeteer.use(StealthPlugin());

        tools.sendUpdate('Starting Browser...');

        const browser = await puppeteer.launch({ headless });
        const page = await browser.newPage();

        tools.sendUpdate('Browser Initialized!');

        const allJobData = new Map();
        const pagesData = [];

        tools.sendUpdate(`Starting Scrape Page ${1}/${numPages}...`);

        pagesData.push(await scrapeIndeedJobPage(searchQuery, location, 1, page));

        tools.sendUpdate(`Completed Scrape Page ${1}/${numPages}!`);

        for (let i = 2; i <= numPages; i++) {
            const response = await tools.sendUpdateWithResponse(`Starting Scrape Page ${i}/${numPages}...`);
            if (response.cancelled) {
              tools.sendUpdate('Task Cancelled');
              return { success: false, error: 'Task Cancelled' };
            }

            tools.sendUpdate(`Waiting ${waitTimeMs}Ms...`);
            await delay(waitTimeMs);
            
            pagesData.push(await scrapeIndeedJobPage(searchQuery, location, i, page));
            tools.sendUpdate(`Completed Scrape Page ${i}/${numPages}!`);
        }
        
        if (closeBrowser) { await browser.close(); }

        tools.sendUpdate(`Starting Process Data...`);

        for (const job of pagesData.flat()) {
            if (!allJobData.has(job._id)) {
                allJobData.set(job._id, job);
            }
        }

        const jobsArray = Array.from(allJobData.values())

        tools.sendUpdate(`Processed Data!`);

        return { success: true, data: jobsArray };
    } catch (err) {
        console.error('Error Scraping Indeed:', err);
        return { success: false, error: err };
    }
}

async function scrapeIndeedJobPage(searchQuery, location, pageNum, page) {
    const encodedSearchQuery = encodeURIComponent(searchQuery);
    const encodedLocation = encodeURIComponent(location);
    var url = "";
    if (pageNum > 1) {
        const start = (pageNum - 1) * 10;
        url = `https://www.indeed.com/jobs?q=${encodedSearchQuery}&l=${encodedLocation}&sort=date&start=${start}`;
    } else {
        url = `https://www.indeed.com/jobs?q=${encodedSearchQuery}&l=${encodedLocation}&sort=date`;
    }

    await page.goto(url);

    const jobData = await page.evaluate(() => {
        function parseSalary(salaryRaw) {
            const numbersMatch = salaryRaw.match(/(\d+[\.,]?\d?\w?)+/g);
            if (!numbersMatch) {
                return { salaryRaw, salaryEqMin: null, salaryEqMax: null };
            }
            
            const numbers = numbersMatch.map(num => {
                const value = parseFloat(num.replace(/,/g, ''));
                return num.includes('K') ? value * 1000 : value;
            });
            
            const isHourly = salaryRaw.includes('hour');
            if (isHourly) {
                numbers[0] *= 40 * 52;
                numbers[1] *= 40 * 52;
            }
            return {
                salaryRaw,
                salaryEqMin: numbers[0],
                salaryEqMax: numbers[1]
            };
        }

        function extractJobData(jobCard) {
            const jobTitleElement = jobCard.querySelector('.jcs-JobTitle');
            if (!jobTitleElement) return null;

            const title = jobTitleElement.textContent;
            const link = 'https://www.indeed.com' + jobTitleElement.getAttribute('href');
            const _id = jobTitleElement.getAttribute('id');
            const companyName = jobCard.querySelector('.companyName')?.textContent || 'Not provided';
            const rating = jobCard.querySelector('.ratingNumber span[aria-hidden="true"]')?.textContent || 'Not provided';
            const companyLocation = jobCard.querySelector('.companyLocation')?.textContent || 'Not provided';
            const salaryContainer = jobCard.querySelector('.salary-snippet-container') || jobCard.querySelector('.salaryOnly');
            const salaryRaw = salaryContainer?.textContent.trim() || 'Not provided';
            const salary = salaryRaw !== 'Not provided' ? parseSalary(salaryRaw) : { salaryRaw, salaryEqMin: null, salaryEqMax: null };

            return {
                title,
                link,
                _id,
                companyName,
                rating,
                companyLocation,
                ...salary
            };
        }

        const jobCards = Array.from(document.querySelectorAll('.cardOutline'));
        return jobCards.map(extractJobData).filter(job => job !== null);
    });

    return jobData;
}

module.exports = GetIndeedJobListings;



