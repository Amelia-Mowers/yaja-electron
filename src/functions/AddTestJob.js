import jobsDbAPI from '../utils/jobsDbAPI';

function getRandomValue(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSalary(level) {
  switch (level) {
    case 'Senior':
      return getRandomInt(70, 120) * 1000;
    case 'Señor':
      return getRandomInt(70, 120) * 1000;
    case 'Lead':
      return getRandomInt(70, 120) * 1000;
    case 'Principle':
      return getRandomInt(70, 120) * 1000;
    case 'Associate':
      return getRandomInt(50, 80) * 1000;
    case 'Junior':
      return getRandomInt(30, 50) * 1000;
    default:
      return getRandomInt(50, 80) * 1000;
  }
}

function generateYearsOfExpRequired(level) {
  switch (level) {
    case 'Senior':
      return getRandomInt(6, 10);
    case 'Señor':
      return getRandomInt(6, 10);
    case 'Lead':
      return getRandomInt(6, 10);
    case 'Principle':
      return getRandomInt(6, 10);
    case 'Associate':
      return getRandomInt(3, 5);
    case 'Junior':
      return getRandomInt(1, 2);
    default:
      return getRandomInt(1, 2);
  }
}


function AddTestJob() {
  const technologies = ["Full Stack", "App", "Python", "Experience", "DotNet", "Database", "Crypto", "AI", "R&D", "Cloud", "Industrial", "React"];
  const levels = ["Senior", "Junior", "Principle", "Associate", "Lead", "Señor"];
  const positions = ["Engineer", "Developer", "Programmer", "Monkey"];
  const titleConnections = [" ", " — ", ", "];
  const companies = ["CloudCanvas", "ByteDream", "SoftSavvy", "SynergyCode", "PixelPivot", "DataPioneer", "OptimumNexus", "AlphaTide", "EchoNode", "PrismPixel"];
  const applyAtOptions = ["Internal", "External"];
  const remoteOptions = [true, false];

  const wordOrders = [
    (level, technology, position) => `${level}${getRandomValue(titleConnections)}${technology} ${position}`,
    (level, technology, position) => `${technology} ${position}${getRandomValue(titleConnections)}${level}`,
    (level, technology, position) => `${level} ${position}${getRandomValue(titleConnections)}${technology}`,
  ];

  for(let i = 0; i < 10; i++) {
    const randomInt = Math.floor(Math.random() * 1000);
    const level = getRandomValue(levels);
    const technology = getRandomValue(technologies);
    const position = getRandomValue(positions);
    const title = getRandomValue(wordOrders)(level, technology, position);
    const salary = generateSalary(level);
    const yearsOfExpRequired = generateYearsOfExpRequired(level);

    jobsDbAPI.addJob(
      {
        _id: `test_job_${randomInt}`,
        title: title,
        companyName: getRandomValue(companies),
        salaryEqMin: salary,
        applyAt: getRandomValue(applyAtOptions),
        yearsOfExpRequired: yearsOfExpRequired,
        Remote: getRandomValue(remoteOptions),
      }
    );
  }
}

export default AddTestJob;
