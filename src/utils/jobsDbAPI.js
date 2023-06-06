import PouchDB from 'pouchdb';
import path from 'path-browserify';
import pouchdbFind from 'pouchdb-find';
import eventBus from './eventBus'; 

PouchDB.plugin(pouchdbFind);

const dbPath = path.join('databases', 'jobs_db');

const indexes = [
    {name: 'applyAt', values: ['External', 'Internal']},
    {name: 'yearsOfExpRequired', values: Array.from({length: 10}, (v, k) => k+1)},
    {name: 'Remote', values: [true, false]}
]; 

const sortProperties = [
    'salaryEqMin',
    'timeOfJobScraping'
]; 

var jobs_db;

async function getDb() {
    if (!jobs_db) {
        jobs_db = await newDb();
    }
    return jobs_db;
}

async function newDb() {
    const db = new PouchDB(dbPath);
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
        for (let property of indexes) {
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

class JobsDbAPI {
    async addJob(job) {
        const db = await getDb();
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
        const db = await getDb();
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
        const db = await getDb();
        try {
            const doc = await db.get(id);
            return doc;
        } catch (err) {
            console.error(err);
        }
    }

    async hasJob(id) {
        const db = await getDb();
        try {
            await db.get(id);
            return true;
        } catch (err) {
            return false;
        }
    }

    async bulkGet(ids) {
        const db = await getDb();
        try {
            const docs = await db.allDocs({ 
                keys: ids,
                include_docs: true
            });
            return docs.rows.map(row => row.doc);
        } catch (err) {
            console.error(err);
        }
    }

    async deleteJob(id) {
        const db = await getDb();
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
        const db = await getDb();
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
        const db = await getDb();
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
        const db = await getDb();
        try {
            const response = await db.bulkDocs(jobs);
            eventBus.dbChange.publish(response);
            return response;
        } catch (err) {
            console.error(err);
        }
    }

    async getAllJobs() {
        const db = await getDb();
        try {
            return await db.allDocs({ 
                include_docs: true,
                startkey: '_design0' 
            });
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

        const db = await getDb();
        try {
            return await db.find({
                selector: {
                    [sortProperty]: {$gte: null}
                },
                sort: [{[sortProperty]: direction}]
              });
        } catch (err) {
            console.error(err);
        }
    }

    async getFilteredJobs(sortProperty, filters, dir = true) {
        // TODO
    }

    async getJobs({
        sortProperty,
        filters,
        dir = true,
    }) {
        if (!sortProperty) {
            return this.getAllJobs()
        } else if (sortProperty && !filters) {
            this.getSortedJobs(sortProperty, dir)
        } else if (sortProperty && filters) {
            this.getFilteredJobs(sortProperty, filters, dir)
        } 
    }

    async clearDb() {
        const oldDb = await getDb();
        try {
            const response = await oldDb.destroy();
            jobs_db = newDb();
            eventBus.dbChange.publish(response);
            return response;
        } catch (err) {
            console.error(err);
        }
    }

    getIndexes() {
        return indexes;
    }    

    getSortProperties() {
        return sortProperties;
    }        
};

const jobsDbAPI = new JobsDbAPI();
export default jobsDbAPI;
