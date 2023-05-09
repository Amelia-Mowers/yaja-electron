const defaultConfig = {
    "searchQueries": ["software developer", "software engineer"],
    "location": "New York",
    "numPages": 3,
    "closeBrowser": true,
    "headless": false,
    "maxJobsDescToScrape": 2,
    "maxConcurrentPageLimit": 3,
    "api_key": "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",
    "maxGptAnalysis": 1
};

const appConfigKey = 'AppConfig';

function getConfig() {
  const storedConfig = localStorage.getItem(appConfigKey);

  if (storedConfig) {
    return JSON.parse(storedConfig);
  }

  localStorage.setItem(appConfigKey, JSON.stringify(defaultConfig));
  return defaultConfig;
}

function updateConfig(updatedConfig) {
  localStorage.setItem(appConfigKey, JSON.stringify(updatedConfig));
}

const config = getConfig();

export { config as default, updateConfig };

