import config from '../utils/config';
import jobs_db from '../utils/jobs_db';

async function GetListings() {

    const jobData = await scrapeMultiplePages(
        config.searchQueries,
        config.location,
        config.numPages,
        config.closeBrowser,
        config.headless
    );
    
    jobs_db.bulkDocs(jobData);
}
  
export default GetListings;

async function configureBrowser(headless = true) {
    return puppeteer.launch({
      headless,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--window-size=1920,1080',
        '--disable-dev-shm-usage',
        '--remote-debugging-port=9222'
      ],
    });
  }

async function scrapeIndeedJobs(searchQuery, location, pageNum, browser) {
    const encodedSearchQuery = encodeURIComponent(searchQuery);
    const encodedLocation = encodeURIComponent(location);
    const start = (pageNum - 1) * 10;
    const url = `https://www.indeed.com/jobs?q=${encodedSearchQuery}&l=${encodedLocation}&sort=date&start=${start}`;
    
    const page = await browser.newPage();
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

  page.close();
  return jobData;
}


async function scrapeMultiplePages(searchQueries, location, numPages = 20, closeBrowser = true, headless = true) {
  const browser = await configureBrowser(headless);
  const allJobData = new Map();

  for (const searchQuery of searchQueries) {
      const pagePromises = [];

      for (let i = 1; i <= numPages; i++) {
          pagePromises.push(scrapeIndeedJobs(searchQuery, location, i, browser));
      }

      const jobData = await Promise.all(pagePromises);

      console.log(`${searchQuery}: ${jobData.flat().length}`);

      for (const job of jobData.flat()) {
          if (!allJobData.has(job.id)) {
              allJobData.set(job.id, job);
          }
      }
  }

  if (closeBrowser) { await browser.close(); }

  return Array.from(allJobData.values());
}

async function saveJobDataToDB(jobData) {
  // Add time of job scraping property
  const timestamp = new Date().toISOString();
  jobData.timeOfJobScraping = timestamp;

  try {
    // Check if the job data already exists in the database
    await db.get(jobData.id);
    // If the job data exists, do nothing
  } catch (error) {
    if (error.name === 'not_found') {
      // If the job data does not exist, create a new document
      jobData._id = jobData.id; // Set the _id property to the same value as the id property
      await db.put(jobData);
      return true; // Return true to indicate a new job was added
    } else {
      console.error('Error saving job data to the database:', error);
    }
  }

  return false; // Return false to indicate no new job was added
}
  