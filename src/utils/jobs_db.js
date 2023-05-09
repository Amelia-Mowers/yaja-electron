import PouchDB from 'pouchdb';
import path from 'path';

const dbPath = path.join('databases', 'jobs_db');
const jobs_db = new PouchDB(dbPath);

export default jobs_db;
