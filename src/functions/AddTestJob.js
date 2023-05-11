import jobs_db from '../utils/jobs_db';

function AddTestJob() {

  const randomInt = Math.floor(Math.random() * 1000);

  var testJob = [
      {
      _id: 'test_job_' + randomInt,
      id: 'test_job_' + randomInt,
      title: 'Test Job_' + randomInt,
      companyName: 'Test Company',
      salaryEqMin: 50000,
      applyAt: 'Internal',
      yearsOfExpRequired: 2,
      Remote: false,
      }
  ];
  
  jobs_db.bulkDocs(testJob);
}
  
export default AddTestJob;
  