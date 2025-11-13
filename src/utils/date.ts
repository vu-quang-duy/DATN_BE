import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { ENV } from 'src/config/environment';
import { DateFormatTemplate } from 'src/types/date.type';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(ENV.TIME_ZONE);

export class DateUtil {
  // Function to get the abbreviation of the month
  static format = (val, format: DateFormatTemplate) => dayjs(val).format(format);
  static formatTz = (val, format: DateFormatTemplate, tz = ENV.TIME_ZONE) => dayjs.tz(val, tz).format(format);

  static getMonthAbbreviation = (month) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[month];
  };

  static startOfDay = (date) => dayjs(date).startOf('day');

  static subtract = (date, day) => dayjs(date, day).subtract(1, 'day');

  static isAfterOrEqual = (date1, date2) => dayjs(date1).isAfter(date2) || dayjs(date1).isSame(date2);

  static formattedLondonIdDate = (date) =>
    `${this.getMonthAbbreviation(date.getMonth())}/${date.getDate()}/${date.getFullYear()}`;

  static calculateYearDuration = (startDate: Date, endDate: Date) => {
    // Get the years of the start and end dates
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    // Calculate the difference in years
    let yearDifference = endYear - startYear;

    // Check if the end date falls before the start date in the same year
    if (endDate < new Date(endYear, startDate.getMonth(), startDate.getDate())) {
      yearDifference--;
    }

    return yearDifference;
  };

  static getDaysListInRange = (startDate: Date, endDate: Date) => {
    // Array to hold the list of dates
    const dateList = [];

    // Loop from the start date to the end date
    const currentDate = startDate;
    while (currentDate <= endDate) {
      // Format the date as a string and add to the list
      dateList.push(currentDate.toISOString().split('T')[0]);

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateList;
  };

  static getTimeFuture = (date, hour = 0, minute = 0, second = 0) =>
    dayjs(date).add(hour, 'hour').add(minute, 'minute').add(second, 'second').toISOString();
}
