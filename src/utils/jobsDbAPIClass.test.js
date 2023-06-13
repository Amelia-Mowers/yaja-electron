import JobsDbAPI from "./jobsDbAPIClass";

describe('JobsDbAPI module', () => {
  
  let jobsDbAPI;
  let testDatabaseDir = "testDatabases";

  beforeEach(async () => {
    const uniqueDbName = 'test' + Math.random().toString(36).substring(7);
    jobsDbAPI = new JobsDbAPI(uniqueDbName, testDatabaseDir);
  });

  afterEach(async () => {
    await jobsDbAPI.deleteDb();
  });

  it('should add a job to the db', async () => {
    const job = {
      _id: 'job1',
      title: 'Test job'
    };

    await jobsDbAPI.addJob(job);
    const rawResult = await jobsDbAPI.getJob('job1');
    const compareResult = { 
        _id: rawResult._id,
        title: rawResult.title
    }

    expect(compareResult).toEqual(job);
  });

  it('should update a job', async () => {
    const job = {
      _id: 'job1',
      title: 'Test job'
    };
    const updatedJob = {
      _id: 'job1',
      title: 'Updated job'
    };

    await jobsDbAPI.addJob(job);
    await jobsDbAPI.updateJob('job1', updatedJob);
    const result = await jobsDbAPI.getJob('job1');

    expect(result.title).toEqual(updatedJob.title);
  });

  it('should add multiple jobs to the db', async () => {
    const jobs = [
      { _id: 'job1', title: 'Test job 1' },
      { _id: 'job2', title: 'Test job 2' },
      { _id: 'job3', title: 'Test job 3' },
    ];

    await jobsDbAPI.bulkAdd(jobs);

    const result1 = await jobsDbAPI.getJob('job1');
    const result2 = await jobsDbAPI.getJob('job2');
    const result3 = await jobsDbAPI.getJob('job3');

    expect(result1.title).toEqual(jobs[0].title);
    expect(result2.title).toEqual(jobs[1].title);
    expect(result3.title).toEqual(jobs[2].title);
  });

  it('should delete multiple jobs from the db', async () => {
    const jobs = [
      { _id: 'job1', title: 'Test job 1' },
      { _id: 'job2', title: 'Test job 2' },
    ];

    await jobsDbAPI.bulkAdd(jobs);
    await jobsDbAPI.bulkDelete(['job1', 'job2']);

    const result1 = await jobsDbAPI.hasJob('job1');
    const result2 = await jobsDbAPI.hasJob('job2');

    expect(result1).toEqual(false);
    expect(result2).toEqual(false);
  });

  it('should get all jobs from the db', async () => {
    const jobs = [
      { _id: 'job1', title: 'Test job 1' },
      { _id: 'job2', title: 'Test job 2' },
    ];

    await jobsDbAPI.bulkAdd(jobs);

    const result = await jobsDbAPI.getJobs({});
    expect(result.length).toEqual(jobs.length);
  });

  it('should clear the db', async () => {
    const jobs = [
      { _id: 'job1', title: 'Test job 1' },
      { _id: 'job2', title: 'Test job 2' },
    ];

    await jobsDbAPI.bulkAdd(jobs);
    await jobsDbAPI.clearDb();

    const allJobs = await jobsDbAPI.getAllJobs();
    expect(allJobs.length).toEqual(0);
  });

  // Here you might need to add custom properties to sort and filter by.
  it('should get sorted jobs from the db', async () => {
    const jobs = [
      { _id: 'job1', title: 'Test job 1', salary: 100 },
      { _id: 'job2', title: 'Test job 2', salary: 200 },
    ];

    await jobsDbAPI.bulkAdd(jobs);

    const result = await jobsDbAPI.getJobs({ sortProperty: 'salary' });
    expect(result[0]._id).toEqual('job2');
  });

  it('should get filtered jobs from the db', async () => {
    const jobs = [
      { _id: 'job1', title: 'Test job 1', location: 'London' },
      {_id: 'job2', title: 'Test job 2', location: 'New York' },
      { _id: 'job3', title: 'Test job 3', location: 'London' },
      ];

      await jobsDbAPI.bulkAdd(jobs);

      const result = await jobsDbAPI.getJobs({ filterProperty: 'location', filterValue: 'London' });
      expect(result.length).toEqual(2);
      expect(result[0]._id).toEqual('job1');
      expect(result[1]._id).toEqual('job3');
    });
});
