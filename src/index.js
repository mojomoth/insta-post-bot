import fs from 'fs';
import schedule from 'node-schedule';
import { action } from './instagram';

const DEFAULT_SCHEDULE = '* * * * *';
const getRandomIntInclusive = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomTime = (start, end, max) => {
  if (start <= end) {
    return getRandomIntInclusive(start, end);
  } else {
    const t1 = getRandomIntInclusive(start, max);
    const t2 = getRandomIntInclusive(0, end);
    return Math.floor(Math.random()) === 1 ? t1 : t2;
  }
}

// import config
const configData = fs.readFileSync('config.json', 'utf8');
const config = JSON.parse(configData);

// import accounts
const accountData = fs.readFileSync('account.json', 'utf8');
const account = JSON.parse(accountData);

const startTime = config.start_time;
const endTime = config.end_time;


// * * * * * *
// second (0 - 59, OPTIONAL)
// minute (0 - 59)
// hour (0 - 23)
// day of month (1 - 31)
// month (1 - 12)
// day of week (0 - 7) (0 or 7 is Sun)
let cron = DEFAULT_SCHEDULE;
try {
  if (startTime) {
    const startTimeArr = startTime.split(':');
    const startHour = parseInt(startTimeArr[0]);
    const startMin = parseInt(startTimeArr[1]);
    const startSec = parseInt(startTimeArr[2]);
  
    cron = `${startSec} ${startMin} ${startHour} * * *`;

    if (endTime) {
      const endTimeArr = endTime.split(':');
      const endHour = parseInt(endTimeArr[0]);
      const endMin = parseInt(endTimeArr[1]);
      const endSec = parseInt(endTimeArr[2]);

      const sec = getRandomTime(startSec, endSec, 59);
      const min = getRandomTime(startMin, endMin, 59);
      const hour = getRandomTime(startHour, endHour, 23);

      cron = `${sec} ${min} ${hour} * * *`;
    }
  }
} catch (e) {
  console.log("Invalid time string");
}

// timer action
// s m h day month week(0-7)
console.log(`CRON : ${cron}`);

action(account, config);
// instagram.action(id, password)
// schedule.scheduleJob(cron, () => instagram.action(id, password));


