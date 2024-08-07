import { Injectable } from '@angular/core';
import { SunriseSunset, DateHelper, ABS } from "@core/utilities";
import { PrayerConfigModel, eHighLatitudeMethod, OffsetSelector, PrayerOffsetModel, eOffsetFactor } from '@shared/models/prayer.model'
import { BaseNumbers, SolarParameters } from '@shared/models/date.model';
import { ATM_RI_DEG } from '@shared/models/constants';
import { eMidnightCalcMethod } from '../models/prayer.model';

@Injectable({
  providedIn: 'root'
})
export class PrayerService {

  //PUBLIC PROPERTIES
  CONFIG: PrayerConfigModel = new PrayerConfigModel();

  //DAY
  middayStart!: number;
  midnightStart!: number;
  sunriseStart!: number;
  // sunriseStartNextDay!: number;
  sunsetStartPrevDay!: number;
  // nightPortionNextDay!: number;
  nightPortion!: number;
  //PRAYERS
  fajrStart!: number;
  ishraqStart!: number;
  dhurStart!: number;
  asrStart!: number;
  sunsetStart!: number;
  maghribStart!: number;
  ishaStart!: number;
  ishaEnd!: number;

  calculatePrayerTime(date: Date) {
    const solarParams = this.getSolarParameters(DateHelper.getMidnight(date));

    this.middayStart = SunriseSunset.calculateTimeFromHA(solarParams.midDayHA, solarParams.baseMidNight);
    this.sunriseStart = this.getTimeFromHA(ATM_RI_DEG, eOffsetFactor.SUBTRACT, solarParams);
    this.sunsetStart = this.getTimeFromHA(ATM_RI_DEG, eOffsetFactor.ADD, solarParams);


    //Optimized by using Midnight for Next Day by adding a day to current midnight
    // const solarParamsNextDay = this.getSolarParameters(DateHelper.dAddDays(date, 1));
    const solarParamsPrevDay = this.getSolarParameters(DateHelper.dAddDays(date, -1));
    // this.sunriseStartNextDay = this.getTimeFromHA(ATM_RI_DEG, eOffsetFactor.SUBTRACT, solarParamsNextDay);
    this.sunsetStartPrevDay = this.getTimeFromHA(ATM_RI_DEG, eOffsetFactor.ADD, solarParamsPrevDay);
    // this.nightPortionNextDay = this.sunriseStartNextDay - this.sunsetStart;
    
    this.fajrStart = this.getTimeFromCalcMethod(this.CONFIG.prayerCalcMethod.FajrParams, this.sunriseStart, solarParams);
    
    const midnightEnd = this.CONFIG.prayerCalcMethod.MidnightCalc == eMidnightCalcMethod.STD ? this.sunriseStart : this.fajrStart;
    this.nightPortion = midnightEnd - this.sunsetStartPrevDay;
    this.midnightStart = midnightEnd - this.nightPortion / 2;

    this.ishraqStart = this.getIshraqTime(this.CONFIG.prayerCalcMethod.IshraqParams, solarParams);
    this.dhurStart = this.getTimeFromCalcMethod(this.CONFIG.prayerCalcMethod.DhurParams, this.middayStart, solarParams);
    this.asrStart = this.getAsrTime(solarParams)
    this.maghribStart = this.getTimeFromCalcMethod(this.CONFIG.prayerCalcMethod.MaghribParams, this.sunsetStart, solarParams);
    this.ishaStart = this.getTimeFromCalcMethod(this.CONFIG.prayerCalcMethod.IshaParams, this.sunsetStart, solarParams);
    // this.ishaEnd = this.sunriseStartNextDay - this.nightPortionNextDay / 2;
    this.ishaEnd = DateHelper.eAddDays(this.midnightStart, 1);
  }

  private getSolarParameters(baseMidNight: number): SolarParameters {
    const julianCentury = SunriseSunset.getJulianCentury(baseMidNight);
    const baseNumbers: BaseNumbers = SunriseSunset.getBaselineNumbers(julianCentury);
    const midDayHA = SunriseSunset.getMidDayHA(this.CONFIG.location.longitude, this.CONFIG.location.timeZone, baseNumbers.eqOfTime);
    return { baseMidNight, midDayHA, eqOfTime: baseNumbers.eqOfTime, sunDecl: baseNumbers.sunDecl }
  }

  private getTimeFromCalcMethod(offset: PrayerOffsetModel, baseTime: number, solarParams: SolarParameters): number {
    if (offset.selector === OffsetSelector.DEGREE) {
      const prayerTimeHA = this.getTimeFromHA(offset.value, offset.factor, solarParams);
      //High Latitude Adjustments
      if (this.CONFIG.highLatitudeMethod.value) {
        return this.adjustHighLatitude(baseTime, prayerTimeHA, offset);
      }
      return prayerTimeHA;
    }

    else return DateHelper.eAddMinutes(baseTime, offset.value * offset.factor);
  }



  private getTimeFromHA(solarAngle: number, offsetFactor: number, solarParams: SolarParameters): number {
    // modFactor = -1 for before midday, +1 for after midday
    const sa = (90 + solarAngle) * offsetFactor;
    const ha = SunriseSunset.calculateHAOffset(this.CONFIG.location.latitude, solarParams.sunDecl, solarParams.midDayHA, sa);
    return SunriseSunset.calculateTimeFromHA(ha, solarParams.baseMidNight);
  }

  private getIshraqTime(offset: PrayerOffsetModel, solarParams: SolarParameters): number {
    // Calculate from Sunrise hence ATM_RI_DEG    
    const offsetAdj = offset.selector === OffsetSelector.DEGREE ? { ...offset, value: offset.value - ATM_RI_DEG } : offset;
    const ishraqSunsetStart = this.getTimeFromCalcMethod(offsetAdj, this.sunsetStart, solarParams);
    return this.sunriseStart - this.sunsetStart + ishraqSunsetStart;
  }

  private getAsrTime(solarParams: SolarParameters): number {
    const asrHA: number = SunriseSunset.calculateAsrHA(this.CONFIG.location.latitude, solarParams, this.CONFIG.asrJuristic.value);
    return SunriseSunset.calculateTimeFromHA(asrHA, solarParams.baseMidNight);
  }

  private getHighLatitudeFactor(solarAngle: number): number {
    let factor = this.CONFIG.highLatitudeMethod.value;
    if (factor == eHighLatitudeMethod.ANGLE)
      return solarAngle * eHighLatitudeMethod.ANGLE;
    return factor;
  }

  private adjustHighLatitude(baseTime: number, prayerTime: number, prayerOffset: PrayerOffsetModel): number {

    // const nightPortion = prayerOffset.factor > 0 ? this.nightPortionNextDay : this.nightPortionPrevDay;
    const nightPortion = this.nightPortion;
    // Calculate for high Altitudes only - Optimize this by adding Lattitude > 45 check
    if (!!baseTime) {
      const offset = this.getHighLatitudeFactor(prayerOffset.value) * nightPortion;
      return !prayerTime || offset < ABS(baseTime - prayerTime) ? baseTime + offset * prayerOffset.factor : prayerTime;
    }
    return prayerTime;
  }

}
