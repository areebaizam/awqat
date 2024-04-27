import { MS_DAY, MS_MINUTE } from "@shared/models/constants";

export class DateHelper {

    public static getMidnight(date: Date): number {
        return date.setHours(0, 0, 0, 0);
    }

    public static dAddDays(date: Date, daysToAdd: number): number {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + daysToAdd);
        //SET to midnight
        return this.getMidnight(newDate);
    }

    public static eAddMinutes(time: number, minutes: number): number {
        return time + minutes * MS_MINUTE;
    }

    public static eAddDays(time: number, days: number): number {
        return time + days * MS_DAY;
    }

}