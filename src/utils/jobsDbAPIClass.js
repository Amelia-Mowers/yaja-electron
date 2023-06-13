import PouchDB from 'pouchdb';
import path from 'path-browserify';
import pouchdbFind from 'pouchdb-find';
import eventBus from './eventBus'; 
import compareValues from './compareValues'; 

PouchDB.plugin(pouchdbFind);

const filterProperties = [
    {name: 'applyAt', values: ['External', 'Internal']},
    {name: 'yearsOfExpRequired', values: Array.from({length: 10}, (v, k) => k+1)},
    {name: 'Remote', values: [true, false]}
]; 

const sortProperties = [
    'salaryEqMin',
    'timeOfJobScraping'
]; 

async function newDb(dbDirectory, dbName) {
    const db = new PouchDB(path.join('jobDatabases', dbName));
    await ensureSortedIndexes(db);

    return db;
}

async function ensureSortedIndexes(jobs_db) {
    for (let val of sortProperties) {
        try {
            await jobs_db.createIndex({
                index: {
                    fields: [val],
                    ddoc: `${val}`
                }
            });
        } catch (err) {
            console.error(`Error creating index on ${val}:`, err);
        }
        for (let property of filterProperties) {
            try {
                await jobs_db.createIndex({
                    index: {
                        fields: [property.name, val],
                        ddoc: `${property.name}-${val}`
                    }
                });
            } catch (err) {
                console.error(`Error creating index on ${property}:`, err);
            }
        }
    }
}

class SortDir {
    static Ascending = new SortDir('asc');
    static Descending = new SortDir('desc');
  
    constructor(name) {
      this.name = name;
    }
    toString() {
      return `Color.${this.name}`;
    }
}

class IndexCrawler {
    constructor(
        db,
        filterProperty, 
        filterPropertyVal, 
        sortProperty,
        dir = SortDir.Ascending
    ) {
        this.db = db;
        this.filterProperty = filterProperty;
        this.filterPropertyVal = filterPropertyVal;
        this.sortProperty = sortProperty;
        this.dir = dir;
        this.xThenOrEqual = this.dir === SortDir.Ascending ? '$gte' : '$lte';
        this.xThen = this.dir === SortDir.Ascending ? '$gt' : '$lt';
        
        this.indexName = `${filterProperty}-${sortProperty}`
    }

    async initialize() {
        const query = {
            selector: {
              [this.filterProperty]: this.filterPropertyVal,
            },
            fields: [this.filterProperty, this.sortProperty, '_id'],
            limit: 1,
            use_index: this.indexName,
            sort: [{[this.filterProperty]: this.dir}]
        };

        const docs = (await this.db.find(query)).docs;

        if (docs.length === 0) {
            this.currentDoc = null;
        } else {
            this.currentDoc = docs[0];
        }
    }
    
    peek() {
        return this.currentDoc;
    }

    async next() {
        const query = {
            selector: {
                [this.filterProperty]: this.filterPropertyVal,
                [this.sortProperty]: {
                    [this.xThenOrEqual]: this.currentDoc[this.sortProperty]
                },
                _id: {
                    [this.xThen]: this.currentDoc['_id']
                }
            },
            fields: [this.filterProperty, this.sortProperty, '_id'],
            limit: 2,
            use_index: this.indexName,
            sort: [{[this.sortProperty]: this.dir}]
        };

        const docs = (await this.db.find(query)).docs;

        if (docs.length === 0) {
            this.currentDoc = null;
        } else {
            this.currentDoc = docs[0];
        }
    }

    async jump(sortPropertyValue, id) {
        const query = {
            selector: {
                [this.filterProperty]: this.filterPropertyVal,
                [this.sortProperty]: {
                    [this.xThenOrEqual]: sortPropertyValue
                },
                _id: {
                    [this.xThenOrEqual]: id
                }
            },
            fields: [this.filterProperty, this.sortProperty, '_id'],
            limit: 1,
            use_index: this.indexName,
            sort: [{[this.sortProperty]: this.dir}]
        };

        const docs = (await this.db.find(query)).docs;

        if (docs.length === 0) {
            this.currentDoc = null;
        } else {
            this.currentDoc = docs[0];
        }
    }
}

class JobsDbAPI {
    constructor(
        name,
        directory
        ) {
        this.dbName = name || 'default';
        this.dbDirectory = directory || 'jobsDatabases';
    }

    async getDb() {
        if (!this.jobs_db) {
            this.jobs_db = await newDb(this.dbName, this.dbDirectory);
        }
        return this.jobs_db;
    }

    changeDb(name) {
        this.dbName = name;
        eventBus.dbChange.publish();
    }

    async addJob(job) {
        const db = await this.getDb();
        try {
            let existingJob;
            try {
                existingJob = await db.get(job._id);
            } catch (err) {
                if (err.name !== 'not_found') {
                    throw err;
                }
            }
            
            if (existingJob) {
                console.warn(`Job with id ${job._id} already exists.`);
                return;
            }

            const response = await db.put(job);
            eventBus.dbChange.publish(response); 
            return response;
        } catch (err) {
            console.error(err);
        }
    }

    async bulkAdd(jobs) {
        const db = await this.getDb();
        try {
            const ids = jobs.map(job => job._id);
            const existingJobs = await db.allDocs({ keys: ids });
            const existingIds = new Set(existingJobs.rows.map(row => row.id));
            const newJobs = jobs.filter(job => !existingIds.has(job._id));
            const response = await db.bulkDocs(newJobs);
            eventBus.dbChange.publish(response); 
            return response;
        } catch (err) {
            console.error(err);
        }
    }

    async getJob(id) {
        const db = await this.getDb();
        try {
            const doc = await db.get(id);
            return doc;
        } catch (err) {
            console.error(err);
        }
    }

    async hasJob(id) {
        const db = await this.getDb();
        try {
            await db.get(id);
            return true;
        } catch (err) {
            return false;
        }
    }

    async bulkGet(ids) {
        const db = await this.getDb();
        try {
            const response = await db.allDocs({ 
                keys: ids,
                include_docs: true
            });
            return response.rows ? response.rows.map(row => row.doc) : [];
        } catch (err) {
            console.error(err);
        }
    }

    async deleteJob(id) {
        const db = await this.getDb();
        try {
            const doc = await this.getJob(id);
            const response = await db.remove(doc);
            eventBus.dbChange.publish(response);
            return response;
        } catch (err) {
            console.error(err);
        }
    }

    async bulkDelete(ids) {
        const db = await this.getDb();
        try {
            const docs = await this.bulkGet(ids);
            const docsToDelete = docs.map(doc => ({ ...doc, _deleted: true }));
            const response = await db.bulkDocs(docsToDelete);
            eventBus.dbChange.publish(response); 
            return response;
        } catch (err) {
            console.error(err);
        }
    }

    async updateJob(id, job) {
        const db = await this.getDb();
        try {
            const doc = await this.getJob(id);
            const response = await db.put({ ...doc, ...job });
            eventBus.dbChange.publish(response);
            return response;
        } catch (err) {
            console.error(err);
        }
    }

    async bulkUpdate(jobs) {
        const db = await this.getDb();
        try {
            const response = await db.bulkDocs(jobs);
            eventBus.dbChange.publish(response);
            return response;
        } catch (err) {
            console.error(err);
        }
    }

    async getAllJobs() {
        const db = await this.getDb();
        try {
            const response = await db.allDocs({ 
                include_docs: true,
                startkey: '_design0' 
            });
            // map the rows to extract job documents
            return response.rows ? response.rows.map(row => row.doc) : [];
        } catch (err) {
            console.error(err);
        }
    }

    async getSortedJobs(sortProperty, dir = true) {
        if (!sortProperties.includes(sortProperty)) {
            throw new Error(`${sortProperty} is not a defined sort property`);
        }

        var direction;

        if (dir) { direction = 'asc' }
        else { direction = 'desc' }

        const db = await this.getDb();
        try {
            const response = await db.find({
                selector: {
                    [sortProperty]: {$gte: null}
                },
                sort: [{[sortProperty]: direction}]
            });
            // If response has 'docs' property, use that as the fetchedJobs
            return response.docs || [];
        } catch (err) {
            console.error(err);
        }
    }

    async getFilteredJobs(sortProperty, filters, amount, dir = true) {
        const db = await this.getDb();
        const crawlers = [];

        for (const filter of filters) {
            const crawler = new IndexCrawler(
                db, 
                filter.property, 
                filter.val,
                sortProperty, 
                dir
            );
            await crawler.initialize();
            crawlers.push(crawler);
        }

        const outputIds = [];
        var farthestSortVal = null;
        var farthestId = null;
        var crawlerEnded = false;

        while (outputIds.length < amount && !crawlerEnded) {
            var i = 0;
            for ( ; i < crawlers.length; i++) {
                const crawler = crawlers[i];
                const doc = crawler.peek();

                if (!doc) {
                    crawlerEnded = true;
                    break; 
                }

                var sortValComp = compareValues(farthestSortVal, doc[sortProperty]);
                if (!dir) { sortValComp *= -1; }

                if (sortValComp < 0){
                    farthestSortVal = doc[sortProperty];
                    farthestId = doc['_id'];
                    break;
                } else if (sortValComp > 0) {
                    await crawler.jump(farthestSortVal, farthestId);
                    break;
                } 

                var idComp = compareValues(farthestId, doc['_id']);
                if (!dir) { idComp *= -1; }
                
                if (idComp < 0) {
                    farthestId = doc['_id'];
                    break;
                } else if (idComp > 0) {
                    await crawler.jump(farthestSortVal, farthestId);
                    break;
                } 
            }

            if (crawlerEnded) { break; }

            if (i === crawlers.length) {
                outputIds.push(farthestId);
            }
        }

        return await this.bulkGet(outputIds);
    }

    async getJobs({
        sortProperty,
        filters,
        amount,
        dir = true,
    }) {
        if (!sortProperty) {
            return this.getAllJobs()
        } else if (filters.length === 0) {
            return this.getSortedJobs(sortProperty, dir)
        } else {
            return this.getFilteredJobs(sortProperty, filters, amount, dir)
        } 
    }

    async clearDb() {
        const oldDb = await this.getDb();
        try {
            const response = await oldDb.destroy();
            this.jobs_db = newDb();
            eventBus.dbChange.publish(response);
            return response;
        } catch (err) {
            console.error(err);
        }
    }

    async deleteDb() {
        try {
            const dbToDelete = await newDb(this.dbName, this.dbDirectory);
            await dbToDelete.destroy();
        } catch (err) {
            console.error(err);
        }
    }

    getFilterProperties() {
        return filterProperties;
    }    

    getSortProperties() {
        return sortProperties;
    }        
};

export default JobsDbAPI;
