import { PI, ABS, RADIANS, DEGREES, SIN, COS, TAN, ASIN, ACOS, ATAN, ATAN2 } from './math.utilities';
import { J2000_1200, J100, J1970_1200 } from '@core/models/constants';
import { D_HOURS, D_MINUTES, D_MILLI_SECONDS, M_HOUR } from '@shared/models/constants';
import { BaseNumbers, SolarParameters } from '@shared/models/date.model';

export class SunriseSunset {
    //PUBLIC
    static getJulianCentury(baseMidNight: number): number {
        const julianDay = this.calculateJulianDay(baseMidNight);
        return (julianDay - J2000_1200) / J100;
    }

    // PUBLIC
    static getBaselineNumbers(julianCentury: number): BaseNumbers {
        const geomMeanLongSun = this.calculateGeomMeanLongSun(julianCentury);//I
        const geomMeanAnomSun = this.calculateGeomMeanAnomSun(julianCentury);//J
        const eccentEarthOrbit = this.calculateEccentEarthOrbit(julianCentury);//K
        const sunEqOfCtr = this.calculateSunEqOfCtr(julianCentury, geomMeanAnomSun);//L
        const sunTrueLong = geomMeanLongSun + sunEqOfCtr;//M
        const sunTrueAnom = geomMeanAnomSun + sunEqOfCtr;//N
        const sunVectorRad = this.calculateSunVectorRad(eccentEarthOrbit, sunTrueAnom);//O        
        const sunAppLong = this.calculateSunAppLong(julianCentury, sunTrueLong,);//P
        const meanObliqEcliptic = this.calculateMeanObliqEcliptic(julianCentury);//Q
        const obliqCorr = this.calculateObliqCorr(julianCentury, meanObliqEcliptic);//R
        const sunRightAscen = this.calculateSunRightAcsen(sunAppLong, obliqCorr);//S Incorrect
        const sunDecl = this.calculateSunDec(sunAppLong, obliqCorr);//T
        const varY = this.calculateVarY(obliqCorr); //U
        const eqOfTime = this.calculateEqOfTime(geomMeanLongSun, geomMeanAnomSun, eccentEarthOrbit, sunEqOfCtr, varY); //V
        return { eqOfTime, sunDecl };
    }

    static getMidDayHA(longitude: number, timeZone: number, eqOfTime: number): number {
        return ((720 - 4 * longitude - eqOfTime + timeZone * M_HOUR) / D_MINUTES);
    }

    static calculateHAOffset(latitude: number, sunDecl: number, midDayHA: number, solarAngle: number = 0): number {
        const ha = this.calculateHourAngle(solarAngle, latitude, sunDecl);
        return solarAngle < 90 ? (midDayHA * D_MINUTES - ha * 4) / D_MINUTES : (midDayHA * D_MINUTES + ha * 4) / D_MINUTES;
    }

    static calculateAsrHA(latitude: number, solarParams: SolarParameters, asrJuristic: number = 1) {
        const asrHAOffset = DEGREES((1 / 15) *
            ACOS(
                (SIN(PI / 2 -
                    ATAN(asrJuristic +
                        TAN(ABS(RADIANS(latitude) - RADIANS(solarParams.sunDecl)))))
                    - SIN(RADIANS(solarParams.sunDecl)) * SIN(RADIANS(latitude))) /
                (COS(RADIANS(solarParams.sunDecl)) * COS(RADIANS(latitude)))
            ));
        return solarParams.midDayHA + asrHAOffset / D_HOURS;
    }

    static calculateTimeFromHA(ha: number, baseMidNight: number): number {
        return ha * D_MILLI_SECONDS + baseMidNight;
    }

    private static calculateJulianDay(baseMidNight: number): number {
        return baseMidNight / D_MILLI_SECONDS + J1970_1200;
    }

    private static calculateGeomMeanLongSun(julianCentury: number): number {
        return (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) % 360;
    }

    private static calculateGeomMeanAnomSun(julianCentury: number): number {
        return 357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury);
    }

    private static calculateEccentEarthOrbit(julianCentury: number): number {
        return 0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury);
    }

    private static calculateSunEqOfCtr(julianCentury: number, geomMeanAnomSun: number): number {
        const sinMeanAnom = SIN(RADIANS(geomMeanAnomSun));
        const sin2MeanAnom = SIN(2 * RADIANS(geomMeanAnomSun));
        const sin3MeanAnom = SIN(3 * RADIANS(geomMeanAnomSun));
        return sinMeanAnom * (1.914602 - julianCentury * (0.004817 + 0.000014 * julianCentury)) +
            sin2MeanAnom * (0.019993 - 0.000101 * julianCentury) +
            sin3MeanAnom * 0.000289;
    }

    private static calculateSunVectorRad(eccentEarthOrbit: number, sunTrueAnom: number): number {
        return (1.000001018 * (1 - eccentEarthOrbit * eccentEarthOrbit)) / (1 + eccentEarthOrbit * COS(RADIANS(sunTrueAnom)));
    }

    private static calculateSunAppLong(julianCentury: number, sunTrueLong: number): number {
        return sunTrueLong - 0.00569 - 0.00478 * SIN(RADIANS(125.04 - 1934.136 * julianCentury));
    }

    private static calculateMeanObliqEcliptic(julianCentury: number): number {
        return 23 + (26 + ((21.448 - julianCentury * (46.815 + julianCentury * (0.00059 - julianCentury * 0.001813)))) / 60) / 60;
    }

    private static calculateObliqCorr(julianCentury: number, meanObliqEcliptic: number): number {
        return meanObliqEcliptic + 0.00256 * COS(RADIANS(125.04 - 1934.136 * julianCentury));
    }

    private static calculateSunRightAcsen(sunAppLong: number, obliqCorr: number): number {
        return DEGREES(ATAN2(COS(RADIANS(sunAppLong)), COS(RADIANS(obliqCorr)) * SIN(RADIANS(sunAppLong))));
    }
    private static calculateSunDec(sunAppLong: number, obliqCorr: number): number {
        return DEGREES(ASIN(SIN(RADIANS(obliqCorr)) * SIN(RADIANS(sunAppLong))))
    }

    private static calculateVarY(obliqCorr: number): number {
        return TAN(RADIANS(obliqCorr / 2)) * TAN(RADIANS(obliqCorr / 2))
    }

    private static calculateEqOfTime(geomMeanLongSun: number, geomMeanAnomSun: number, eccentEarthOrbit: number, sunEqOfCtr: number, varY: number): number {
        return 4 * DEGREES(varY * SIN(2 * RADIANS(geomMeanLongSun))
            - 2 * eccentEarthOrbit * SIN(RADIANS(geomMeanAnomSun))
            + 4 * eccentEarthOrbit * varY * SIN(RADIANS(geomMeanAnomSun))
            * COS(2 * RADIANS(geomMeanLongSun))
            - 0.5 * varY * varY * SIN(4 * RADIANS(geomMeanLongSun))
            - 1.25 * eccentEarthOrbit * eccentEarthOrbit * SIN(2 * RADIANS(geomMeanAnomSun)))
    }

    private static calculateHourAngle(solarAngle: number, latitude: number, sunDecl: number,): number {
        return DEGREES(ACOS(COS(RADIANS(solarAngle)) / (COS(RADIANS(latitude)) * COS(RADIANS(sunDecl))) - TAN(RADIANS(latitude)) * TAN(RADIANS(sunDecl))));
    }
}