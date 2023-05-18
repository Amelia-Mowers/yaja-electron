import PouchDB from 'pouchdb';
import path from 'path-browserify';

const dbPath = path.join('databases', 'jobs_db');
var jobs_db = new PouchDB(dbPath);

const jobsDbAPI = {
    getDb() {
        return jobs_db;
    },

    async addJob(job) {
        try {
            // Check if the job already exists in the database.
            let existingJob;
            try {
                existingJob = await jobs_db.get(job._id);
            } catch (err) {
                if (err.name !== 'not_found') {
                    // There was some other error, so throw it.
                    throw err;
                }
            }
            
            if (existingJob) {
                // The job already exists, so don't add it again.
                console.warn(`Job with id ${job._id} already exists.`);
                return;
            }
    
            // Add the new job to the database.
            const response = await jobs_db.put(job);
            return response;
        } catch (err) {
            console.error(err);
        }
    },

    async bulkAdd(jobs) {
        try {
            // Extract ids from jobs.
            const ids = jobs.map(job => job._id);
    
            // Fetch existing jobs from database.
            const existingJobs = await jobs_db.allDocs({ keys: ids });
    
            // Build a set of existing job ids.
            const existingIds = new Set(existingJobs.rows.map(row => row.id));
    
            // Filter out jobs that already exist in the database.
            const newJobs = jobs.filter(job => !existingIds.has(job._id));
    
            // Add new jobs to the database.
            const response = await jobs_db.bulkDocs(newJobs);
            return response;
        } catch (err) {
            console.error(err);
        }
    },

    async getJob(id) {
        try {
            const doc = await jobs_db.get(id);
            return doc;
        } catch (err) {
            console.error(err);
        }
    },

    async bulkGet(ids) {
        try {
            const docs = await jobs_db.allDocs({ 
                keys: ids,
                include_docs: true
            });
            return docs.rows.map(row => row.doc);
        } catch (err) {
            console.error(err);
        }
    },

    async deleteJob(id) {
        try {
            const doc = await this.getJob(id);
            const response = await jobs_db.remove(doc);
            return response;
        } catch (err) {
            console.error(err);
        }
    },

    async bulkDelete(ids) {
        try {
            const docs = await this.bulkGet(ids);
            const docsToDelete = docs.map(doc => ({ ...doc, _deleted: true }));
            const response = await jobs_db.bulkDocs(docsToDelete);
            return response;
        } catch (err) {
            console.error(err);
        }
    },

    async updateJob(id, job) {
        try {
            const doc = await this.getJob(id);
            const response = await jobs_db.put({ ...doc, ...job });
            return response;
        } catch (err) {
            console.error(err);
        }
    },

    async bulkUpdate(jobs) {
        try {
            const response = await jobs_db.bulkDocs(jobs);
            return response;
        } catch (err) {
            console.error(err);
        }
    },

    async getAllJobs() {
        try {
            return await jobs_db.allDocs({ include_docs: true });
        } catch (err) {
            console.error(err);
        }
    },

    async clearDb() {
        try {
            const response = await jobs_db.destroy();
            jobs_db = new PouchDB(dbPath); // Reinitialize the database
    
            // Emit a custom event indicating that the DB has been cleared
            const event = new CustomEvent('dbCleared', { detail: jobs_db });
            window.dispatchEvent(event);
    
            return response;
        } catch (err) {
            console.error(err);
        }
    }    
};

export default jobsDbAPI;
