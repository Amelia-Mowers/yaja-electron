import jobsDbAPI from '../utils/jobsDbAPI';

function AddTestJob() {

  const randomInt = Math.floor(Math.random() * 1000);
  
  jobsDbAPI.addJob(
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
  );
}
  
export default AddTestJob;
  