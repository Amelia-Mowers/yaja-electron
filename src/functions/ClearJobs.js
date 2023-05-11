import config from '../utils/config';
import jobs_db from '../utils/jobs_db';

function ClearJobs() {
    jobs_db.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {
      jobs_db.bulkDocs(
        result.rows.map(row => ({ ...row.doc, _deleted: true }))
      );
    }).catch(function (err) {
      console.log(err);
    });
  }
  
export default ClearJobs;
  