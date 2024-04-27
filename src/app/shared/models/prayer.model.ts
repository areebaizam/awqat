interface BaseDataModel {
    shortLabel: string;
    longLabel: string;
    value: number;
}

interface Coordinates {
    latitude: number;
    longitude: number;
    timeZone: number;
}

export interface PrayerOffsetModel {
    selector: OffsetSelector,
    value: number,
    factor: eOffsetFactor,
    label: string,
}

export enum eOffsetFactor {
    ADD = 1,
    SUBTRACT = -1,
}

enum ePrayerCalcMethod {
    CSTM,
    BCMA,
    EGA,
    ISNA,
    IUK,
    MWL,
    MAK,
    MAKR, //Makkah Ramadan Timings
    SIA,
    TRN,
}

export enum OffsetSelector {
    DEGREE = 'degrees',
    MINUTES = 'minutes',
}

enum eAsrJuristic {
    STD = 1, //1 for Shafi Maliki Hanbali
    HNF = 2, // 2 for Hanafi (Shadow length is twice the object)
    SHA = 4 / 7, // 4/7 for Shia (Shadow length is 4/7 the object)
}

export enum eHighLatitudeMethod {
    NONE = 0,
    ANGLE = 1 / 60, // Angle/60 of Night Portion DEFAULT 
    MIDNIGHT = 1 / 2, // mid of night portion
    ONE_SEVENTH = 1 / 7, // On Seventh of night portion
}

//TODO Verify Names
export const AsrJuristicMap: Map<eAsrJuristic, BaseDataModel> = new Map([
    [eAsrJuristic.STD, { shortLabel: "Standard", longLabel: 'Shafi, Mailiki and Hanbali', value: 1 }],
    [eAsrJuristic.HNF, { shortLabel: "Hanafi", longLabel: 'Hanafi', value: 2 }],
    [eAsrJuristic.SHA, { shortLabel: "Shia", longLabel: 'Shia Ithna', value: 4 / 7 }]
])

//TODO Rewrite long label
export const HighLatitudeMap: Map<eHighLatitudeMethod, BaseDataModel> = new Map([
    [eHighLatitudeMethod.NONE, { shortLabel: "None", longLabel: 'No adjustment', value: eHighLatitudeMethod.NONE }],
    [eHighLatitudeMethod.ANGLE, { shortLabel: "Twilight Angle", longLabel: 'Default', value: eHighLatitudeMethod.ANGLE }],
    [eHighLatitudeMethod.MIDNIGHT, { shortLabel: "Middle of the Night", longLabel: 'Shia Ithna', value: eHighLatitudeMethod.MIDNIGHT }],
    [eHighLatitudeMethod.ONE_SEVENTH, { shortLabel: "Seventh of the night", longLabel: 'Shia Ithna', value: eHighLatitudeMethod.ONE_SEVENTH }],
])

export class PrayerConfigModel {
    private _asrJuristic = AsrJuristicMap.get(eAsrJuristic.HNF);
    private _highLatitudeMethod = HighLatitudeMap.get(eHighLatitudeMethod.ANGLE);
    private _prayerCalcMethod = PrayerCalcMethodMap.get(ePrayerCalcMethod.BCMA);
    constructor() {
        if (!!this._prayerCalcMethod)
            this.prayerCalcMethod = this._prayerCalcMethod;
        if (!!this._asrJuristic)
            this.asrJuristic = this._asrJuristic;
        if (!!this._highLatitudeMethod)
            this.highLatitudeMethod = this._highLatitudeMethod;


        this.location = { latitude: 49.2919796, longitude: -123.1693839, timeZone: -7 }
        // this.location = { latitude: 64.8284192, longitude: -147.8338081, timeZone: -8 }
        // this.location = { latitude: 21.4224829, longitude: 39.8237026, timeZone: 3 }
        // this.location = { latitude: 48.4689275, longitude: -122.3729532, timeZone: -7 }
        // this.location = { latitude: 47.6088285, longitude: -122.5046094, timeZone: -7 }
        // this.location = { latitude: 45.5428359, longitude: -122.8192132, timeZone: -7 }//Portland
        // this.location = { latitude: 45, longitude: -122.8192132, timeZone: -7 }//Portland 45
        // this.location = { latitude: 43.88591511, longitude: -122.13488378, timeZone: -7 }
    }

    location!: Coordinates;
    prayerCalcMethod!: PrayerCalcMethodModel;
    asrJuristic!: BaseDataModel;
    highLatitudeMethod!: BaseDataModel;
    // offsetInMinutes: PrayerOffset;
}

export class PrayerCalcMethodModel {
    Organization: string = "";
    Label: string = "";
    FajrParams: PrayerOffsetModel;
    IshraqParams: PrayerOffsetModel;
    DhurParams: PrayerOffsetModel;
    MaghribParams: PrayerOffsetModel;
    IshaParams: PrayerOffsetModel;
    constructor(
        org: string,
        lbl: string,
        fp: PrayerOffsetModel,
        qp: PrayerOffsetModel,
        dp: PrayerOffsetModel,
        mp: PrayerOffsetModel,
        ip: PrayerOffsetModel,
    ) {
        this.Organization = org;
        this.Label = lbl;
        this.FajrParams = fp;
        this.IshraqParams = qp;
        this.DhurParams = dp;
        this.MaghribParams = mp;
        this.IshaParams = ip;
    }
}

export const PrayerCalcMethodMap: Map<ePrayerCalcMethod, PrayerCalcMethodModel> = new Map([
    [
        ePrayerCalcMethod.BCMA,
        new PrayerCalcMethodModel(
            "BCMA and Sharia Council of B.C.",
            "BCMA Timings (Fajr: 18° / Isha: 15°)",
            { selector: OffsetSelector.DEGREE, value: 18, label: 'before Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.DEGREE, value: 4 , label: 'after Sunrise', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.MINUTES, value: 2, label: 'after Zawal', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.MINUTES, value: 1, label: 'after Sunset', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.DEGREE, value: 15, label: 'after Sunset', factor: eOffsetFactor.ADD },
        ),
    ],
    [
        ePrayerCalcMethod.EGA,
        new PrayerCalcMethodModel(
            "Egyptian General Authority",
            "Egypt (Fajr: 19.5° / Isha: 17.5°)",
            { selector: OffsetSelector.DEGREE, value: 19.5, label: 'before Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.DEGREE, value: 4 , label: 'after Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.MINUTES, value: 2, label: 'after Zawal', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.MINUTES, value: 1, label: 'after Sunset', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.DEGREE, value: 17.5, label: 'after Sunset', factor: eOffsetFactor.ADD },
        ),
    ],
    [
        ePrayerCalcMethod.ISNA,
        new PrayerCalcMethodModel(
            "Islamic Society of North America",
            "ISNA (Fajr: 15° / Isha: 15°)",
            { selector: OffsetSelector.DEGREE, value: 15, label: 'before Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.DEGREE, value: 4 , label: 'after Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.MINUTES, value: 2, label: 'after Zawal', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.MINUTES, value: 1, label: 'after Sunset', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.DEGREE, value: 15, label: 'after Sunset', factor: eOffsetFactor.ADD },
        ),
    ],
    [
        ePrayerCalcMethod.IUK,
        new PrayerCalcMethodModel(
            "Karachi (University Of Islamic Sciences)",
            "Karachi (Fajr: 18° / Isha: 18°)",
            { selector: OffsetSelector.DEGREE, value: 18, label: 'before Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.DEGREE, value: 4 , label: 'after Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.MINUTES, value: 2, label: 'after Zawal', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.MINUTES, value: 1, label: 'after Sunset', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.DEGREE, value: 18, label: 'after Sunset', factor: eOffsetFactor.ADD },
        ),
    ],
    [
        ePrayerCalcMethod.MAK,
        new PrayerCalcMethodModel(
            "Makkah (Umm al-Qura University)",
            "Makkah (Fajr: 18.5° / Isha: Maghrib + 90')",
            { selector: OffsetSelector.DEGREE, value: 18.5, label: 'before Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.DEGREE, value: 4 , label: 'after Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.MINUTES, value: 2, label: 'after Zawal', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.MINUTES, value: 1, label: 'after Sunset', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.MINUTES, value: 90 + 1, label: 'after Maghrib', factor: eOffsetFactor.ADD },
        ),
    ],
    [
        ePrayerCalcMethod.MAKR,
        new PrayerCalcMethodModel(
            "Makkah (Ramadan Timings)",
            "Makkah-R (Fajr: 18.5° / Isha: Maghrib + 120')",
            { selector: OffsetSelector.DEGREE, value: 18.5, label: 'before Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.DEGREE, value: 4 , label: 'after Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.MINUTES, value: 2, label: 'after Zawal', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.MINUTES, value: 1, label: 'after Sunset', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.MINUTES, value: 120 + 1, label: 'after Maghrib', factor: eOffsetFactor.ADD },
        ),
    ],
    [
        ePrayerCalcMethod.MWL,
        new PrayerCalcMethodModel(
            "Muslim World League",
            "MWL (Fajr: 18° / Isha: 17°)",
            { selector: OffsetSelector.DEGREE, value: 18, label: 'before Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.DEGREE, value: 4 , label: 'after Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.MINUTES, value: 2, label: 'after Zawal', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.MINUTES, value: 1, label: 'after Sunset', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.DEGREE, value: 17, label: 'after Sunset', factor: eOffsetFactor.ADD },
        ),
    ],
    [
        ePrayerCalcMethod.SIA,
        new PrayerCalcMethodModel(
            "Shia Ithna Ashari",
            "SIA Jaffari (Fajr: 16° / Maghrib: 4° / Isha: 14°)",
            { selector: OffsetSelector.DEGREE, value: 16, label: 'before Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.DEGREE, value: 4 , label: 'after Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.MINUTES, value: 2, label: 'after Zawal', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.DEGREE, value: 4, label: 'after Sunset', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.DEGREE, value: 14, label: 'after Sunset', factor: eOffsetFactor.ADD },
        ),
    ],
    [
        ePrayerCalcMethod.TRN,
        new PrayerCalcMethodModel(
            "Tehran (Institute of Geophysics)",
            "Tahran (Fajr: 17.7° / Maghrib: 4.5° / Isha: 14°)",
            { selector: OffsetSelector.DEGREE, value: 17.7, label: 'before Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.DEGREE, value: 4 , label: 'after Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.MINUTES, value: 2, label: 'after Zawal', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.DEGREE, value: 4.5, label: 'after Sunset', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.DEGREE, value: 14, label: 'after Sunset', factor: eOffsetFactor.ADD },
        ),
    ],
    [
        ePrayerCalcMethod.CSTM,
        new PrayerCalcMethodModel(
            "Custom Timings",
            "",
            { selector: OffsetSelector.DEGREE, value: 18, label: 'before Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.DEGREE, value: 4 , label: 'after Sunrise', factor: eOffsetFactor.SUBTRACT },
            { selector: OffsetSelector.MINUTES, value: 2, label: 'after Zawal', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.MINUTES, value: 1, label: 'after Sunset', factor: eOffsetFactor.ADD },
            { selector: OffsetSelector.DEGREE, value: 15, label: 'after Sunset', factor: eOffsetFactor.ADD },
        ),
    ],
]);

