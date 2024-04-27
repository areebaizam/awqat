//JULIAN CONSTANTS
export const J1970_1200 = 2440588; // 2440587.5 Julian Days + 0.5 for 12 noon
export const J2000_1200 = 2451545; // 2451544.5 Julian Days + 0.5 for 12 noon
export const J100 = 36525; // 365 * 100 + 25 (Days of Leap Years) Julian Days

//SOLAR CONSTANTS
export const ATM_RI_DEG = .833; // Amospheric Refractive index for dawn and dusk

//TIME CONSTANTS
export const D_HOURS = 24;
export const MS_SECOND = 1000;
export const S_MINUTE = 60;
export const M_HOUR = 60;

export const D_MINUTES = D_HOURS * M_HOUR; //1440
export const D_SECONDS = D_MINUTES * S_MINUTE; //86 400
export const D_MILLI_SECONDS = D_SECONDS * MS_SECOND; //86 400 000


export const MS_MINUTE = S_MINUTE * MS_SECOND; //60 000
export const MS_HOUR = M_HOUR * MS_MINUTE; //36 00 000
export const MS_DAY = D_HOURS * MS_HOUR; //864 00 000
