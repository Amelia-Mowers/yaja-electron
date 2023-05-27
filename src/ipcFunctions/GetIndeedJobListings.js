const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const delay = ms => new Promise(res => setTimeout(res, ms));

puppeteer.use(StealthPlugin());

async function GetIndeedJobListings(tools, config) {
    try {
        const { searchQueries, location, numPages, waitTimeMs, headless, closeBrowser } = config;
        const searchQuery = searchQueries.join();

        const halfSecondChunks = Math.ceil(waitTimeMs / 500);
        const pageChunk = 95 / numPages;
        const pageChunkSection = pageChunk / halfSecondChunks

        tools.sendUpdate({ message: `Starting Browser`, progress: pageChunk * (1 / 3) , final: false });

        const browser = await puppeteer.launch({ headless });
        const page = await browser.newPage();

        tools.sendUpdate({ message: `Browser Initialized`, progress: pageChunk * (2 / 3), final: false });

        const allJobData = new Map();
        const pagesData = [];

        for (let i = 1; i <= numPages; i++) {
            if (i != 1) {

                for (let j = 0; j < halfSecondChunks; j++) {
                    await delay(500);
                    const progress = ((i - 1) * pageChunk) + (j * pageChunkSection);
                    tools.sendUpdate({
                        progress: progress,
                        final: false
                    });
                }
            }

            tools.sendUpdate({
                message: `Scraping page ${i} out of ${numPages}...`,
                progress:  i * pageChunk,
                final: false
            });

            pagesData.push(await scrapeIndeedJobPage(searchQuery, location, i, page));
        }
        
        if (closeBrowser) { await browser.close(); }

        tools.sendUpdate({ message: 'Job listings scraped successfully', progress: 100, final: true });

        for (const job of pagesData.flat()) {
            if (!allJobData.has(job._id)) {
                allJobData.set(job._id, job);
            }
        }

        const jobsArray = Array.from(allJobData.values())

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



