import { HIJRI_MONTHS } from "@shared/models/constants";

export interface BaseNumbers {
    eqOfTime: number;
    sunDecl: number;
}

export interface SolarParameters extends BaseNumbers {
    baseMidNight: number;
    midDayHA: number;
}

export class HijriDateModel {
    constructor(hY: number, hM: number, hD: number, hL: number = 0) {
        this.hYear = hY;
        this.hMonth = hM;
        this.hDay = hD;
        this.hLength = hL;
        this.hLabel = HIJRI_MONTHS[this.hMonth - 1] + ' ' + this.hDay + ', ' + this.hYear + ' AH'
    }
    hYear: number;
    hMonth: number;
    hDay: number;
    hLength?: number;
    hLabel?: string;
}