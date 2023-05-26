import typeOf from "./type";

const ConfigurationSchema = {
  searchQueries: { defaultValue: ["software developer", "software engineer"], type: "array", elementType: "string", label: "Search Queries" },
  location: { defaultValue: "New York", type: "string", label: "Location" },
  numPages: { defaultValue: 1, type: "number", label: "Number of Pages" },
  waitTimeMs: { defaultValue: 5000, type: "number", label: "Wait Time (ms)" },
  closeBrowser: { defaultValue: true, type: "boolean", label: "Close Browser" },
  headless: { defaultValue: "new", type: "string", options: ["new", "true", "false"], label: "Headless Mode" },
  maxJobsDescToScrape: { defaultValue: 2, type: "number", label: "Max Job Descriptions to Scrape" },
  maxConcurrentPageLimit: { defaultValue: 3, type: "number", label: "Max Concurrent Page Limit" },
  api_key: { defaultValue: "", type: "string", label: "API Key" },
  maxGptAnalysis: { defaultValue: 1, type: "number", label: "Max GPT Analysis" },
};

const appConfigKey = 'AppConfig';

const ConfigManager = {
  storage: window.localStorage,

  getConfig: function() {
    const storedConfigJson = this.storage.getItem(appConfigKey);
    if (!storedConfigJson) {
      const defaultConfigObj = this.getDefaultConfig();
      this.storage.setItem(appConfigKey, JSON.stringify(defaultConfigObj));
      return defaultConfigObj;
    }
    const storedConfig = JSON.parse(storedConfigJson);

    if (this.isValidConfig(storedConfig)) {
      return storedConfig;
    }

    const defaultConfigObj = this.getDefaultConfig();
    this.storage.setItem(appConfigKey, JSON.stringify(defaultConfigObj));
    return defaultConfigObj;
  },

  getDefaultConfig: function () {
    const config = {};
    for (const field in ConfigurationSchema) {
      config[field] = ConfigurationSchema[field].defaultValue;
    }
    return config;
  },

  setConfig: function(updatedConfig) {
    if (this.isValidConfig(updatedConfig)) {
      this.storage.setItem(appConfigKey, JSON.stringify(updatedConfig));
    }
  },

  resetConfig: function() {
    const defaultConfigObj = this.getDefaultConfig();
    this.storage.setItem(appConfigKey, JSON.stringify(defaultConfigObj));
  },

  getConfigurationSchema: function() {
    return ConfigurationSchema;
  },

  isValidConfig: function (config) {
    for (const item in ConfigurationSchema) {
      if (!config.hasOwnProperty(item)) {
        throw new Error(`Config is missing field: ${item}`);
      }
      if (ConfigurationSchema[item].nullable && config[item] === null) {
        continue;
      }
      if (typeOf(config[item]) !== ConfigurationSchema[item].type) {
        throw new Error(`Expected field ${item} to be of type ${ConfigurationSchema[item].type}, but received type ${typeof config[item]}`);
      }
      if (ConfigurationSchema[item].options && !ConfigurationSchema[item].options.includes(config[item])) {
        throw new Error(`Invalid value for ${item}. Expected one of ${ConfigurationSchema[item].options.join(', ')}, but received ${config[item]}`);
      }
      if (ConfigurationSchema[item].type === "array" && ConfigurationSchema[item].elementType) {
        if (!config[item].every(el => typeof el === ConfigurationSchema[item].elementType)) {
          throw new Error(`Array ${item} contains elements of type other than ${ConfigurationSchema[item].elementType}`);
        }
      }
    }
    return true;
  }
}

export default ConfigManager;