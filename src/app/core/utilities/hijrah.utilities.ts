import { DateHelper } from "./date.utilities";
import { FLOOR } from "./math.utilities";
import { UMMAL_QURA_CAL, UMMAL_QURA_CAL_OFFSET } from "@core/models/constants";
import { HijriDateModel } from "@shared/models/date.model";

/* Code inspired from https://github.com/xsoh/Hijri.js/blob/master/Hijri.js */

export class HijriDate {

    public static getHijriDate(date: Date, adjustDays: number = 0): HijriDateModel {
        let adjustedDate = new Date(DateHelper.dAddDays(date, adjustDays));
        let day = adjustedDate.getDate();
        let month = adjustedDate.getMonth();
        let year = adjustedDate.getFullYear();

        let m = month + 1;
        let y = year;

        // append January and February to the previous year (i.e. regard March as
        // the first month of the year in order to simplify leapday corrections)

        if (m < 3) {
            y -= 1;
            m += 12;
        }

        // determine offset between Julian and Gregorian calendar

        var a = FLOOR(y / 100);
        var jgc = a - FLOOR(a / 4) - 2;
        // compute Chronological Julian Day Number (CJDN)

        var cjdn = FLOOR(365.25 * (y + 4716)) + FLOOR(30.6001 * (m + 1)) + day - jgc - 1524;

        a = FLOOR((cjdn - 1867216.25) / 36524.25);
        jgc = a - FLOOR(a / 4.) + 1;
        var b = cjdn + jgc + 1524;
        var c = FLOOR((b - 122.1) / 365.25);
        var d = FLOOR(365.25 * c);
        month = FLOOR((b - d) / 30.6001);
        day = (b - d) - FLOOR(30.6001 * month);

        if (month > 13) {
            c += 1;
            month -= 12;
        }

        month -= 1;
        year = c - 4716;


        // compute Modified Chronological Julian Day Number (MCJDN)

        var mcjdn = cjdn - 2400000;

        // the MCJDN's of the start of the lunations in the Umm al-Qura calendar are stored in 'islamcalendar_dat.js'

        for (var i = 0; i < UMMAL_QURA_CAL.length; i++) {
            if (UMMAL_QURA_CAL[i] > mcjdn)
                break;
        }

        // compute and output the Umm al-Qura calendar date

        var iln = i + 16260;
        var ii = FLOOR((iln - 1) / 12);
        //TODO Optimize later for GREG to remove UmmQura Cal Data upto 2023
        var hY = ii + 1;//+ UMMAL_QURA_CAL_OFFSET;
        var hM = iln - 12 * ii;
        var hD = mcjdn - UMMAL_QURA_CAL[i - 1] + 1;
        var hL = UMMAL_QURA_CAL[i] - UMMAL_QURA_CAL[i - 1];
        return new HijriDateModel(hY, hM, hD, hL);
    }

    public static getGregorianDate(hDate: HijriDateModel): Date {
        var iy = hDate.hYear;
        var im = hDate.hMonth;
        var id = hDate.hDay;
        var ii = iy - 1;
        var iln = (ii * 12) + 1 + (im - 1);
        var i = iln - 16260;
        var mcjdn = id + UMMAL_QURA_CAL[i - 1] - 1;
        var cjdn = mcjdn + 2400000;
        return this.julianToGregorian(cjdn);
    }

    private static julianToGregorian(julianDate: number) {
        //source from: http://keith-wood.name/calendars.html
        var z = FLOOR(julianDate + 0.5);
        var a = FLOOR((z - 1867216.25) / 36524.25);
        a = z + 1 + a - FLOOR(a / 4);
        var b = a + 1524;
        var c = FLOOR((b - 122.1) / 365.25);
        var d = FLOOR(365.25 * c);
        var e = FLOOR((b - d) / 30.6001);
        var day = b - d - FLOOR(e * 30.6001);
        var month = e - (e > 13.5 ? 13 : 1);
        var year = c - (month > 2.5 ? 4716 : 4715);
        if (year <= 0) {
            year--;
        }// No year zero
        return new Date(year + "/" + (month) + "/" + day);
    }
}