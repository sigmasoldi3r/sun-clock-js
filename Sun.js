/*
 * # Sun clock
 * 
 * Sunrise/sunset clock, written as an Es6 class by Pablo Blanco Celdrán.
 * 
 * Original script by Matt Kane, ported from github.
 */

/**
 * Simple, pretty-printable time span of two dates.
 */
class TimeSpan {
  /**
   * @param {Date} from
   * @param {Date} to
   */
  constructor(from, to) {
    this.from = from;
    this.to = to;
    if (from > to) {
      this.from = to;
      this.to = from;
    }
  }

  toString() {
    return `from ${this.from} to ${this.to}`;
  }
}

/**
 * Based on a given sun object, provides the time spans for the golden hour at
 * sunrise and sunset.
 */
class GoldenHour {
  /**
   * @param {Sun} sun
   */
  constructor(sun) {
    this.sun = sun;
  }

  /**
   * A half of an hour, in milliseconds.
   * @type {number}
   */
  static HALF_HOUR = 30 * 60 * 1000;

  /**
   * Gets the start and end of the sunrise's golden hour.
   * @returns {{start: Date, end: Date}}
   */
  get sunrise() {
    const time = this.sun.sunrise.getTime();
    return new TimeSpan(
      new Date(time - GoldenHour.HALF_HOUR),
      new Date(time + GoldenHour.HALF_HOUR));
  }

  /**
   * Gets the start and end of the sunset's golden hour.
   * @returns {{start: Date, end: Date}}
   */
  get sunset() {
    const time = this.sun.sunset.getTime();
    return new TimeSpan(
      new Date(time - GoldenHour.HALF_HOUR),
      new Date(time + GoldenHour.HALF_HOUR));
  }
}

/**
 * Represents the sun's rise and set.
 */
class Sun {
  /**
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} zenith Optionally specify the zenith.
   * @param {Date} now Optionally for another day that is not the current.
   */
  constructor(latitude, longitude, zenith = 90.8333, now = undefined) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.zenith = zenith;
    this.now = now;
  }

  /**
   * Sunrise time, given the current location.
   * @returns {Date}
   */
  get sunrise() {
    return Sun.sunriseSet(this.latitude, this.longitude, true, this.zenith, this.date);
  }

  /**
   * Sunset time, given the current location.
   * @returns {Date}
   */
  get sunset() {
    return Sun.sunriseSet(this.latitude, this.longitude, false, this.zenith, this.date);
  }

  /**
   * Gets the golden hour object, which calculates the time span of the golden
   * hour (For photography) at sunrise and sunset.
   * @returns {GoldenHour}
   */
  get golden() {
    return new GoldenHour(this);
  }

  /**
   * Internal algorithm.
   * >	Sunrise/sunset script. By Matt Kane. 
   * >> 
   * >>  Based loosely and indirectly on Kevin Boone's SunTimes Java implementation 
   * >>  of the US Naval Observatory's algorithm.
   * >> 
   * >>  Copyright © 2012 Triggertrap Ltd. All rights reserved.
   * >>
   * > This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General
   * > Public License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option)
   * > any later version.
   * >
   * > This library is distributed in the hope that it will be useful,but WITHOUT ANY WARRANTY; without even the implied
   * > warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
   * > details.
   * > You should have received a copy of the GNU Lesser General Public License along with this library; if not, write to
   * > the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA,
   * > or connect to: http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
   * @param {number} latitude
   * @param {number} longitude
   * @param {boolean} sunrise
   * @param {number} zenith
   * @param {Date} now Optional current day.
   * @returns {Date}
   */
  static sunriseSet(latitude, longitude, sunrise, zenith, now = new Date()) {
    const hoursFromMeridian = longitude / Sun.DEGREES_PER_HOUR;
    const dayOfYear = Sun.getDayOfYear(now);
    const approxTimeOfEventInDays = dayOfYear + (((sunrise ? 6 : 18) - hoursFromMeridian) / 24);
    const sunMeanAnomaly = (0.9856 * approxTimeOfEventInDays) - 3.289;
    let sunTrueLongitude = sunMeanAnomaly + (1.916 * Sun.sinDeg(sunMeanAnomaly)) + (0.020 * Sun.sinDeg(2 * sunMeanAnomaly)) + 282.634;
    sunTrueLongitude = Sun.mod(sunTrueLongitude, 360);
    const ascension = 0.91764 * Sun.tanDeg(sunTrueLongitude);
    let rightAscension = 360 / (2 * Math.PI) * Math.atan(ascension);
    rightAscension = Sun.mod(rightAscension, 360);
    const lQuadrant = Math.floor(sunTrueLongitude / 90) * 90;
    const raQuadrant = Math.floor(rightAscension / 90) * 90;
    rightAscension = rightAscension + (lQuadrant - raQuadrant);
    rightAscension /= Sun.DEGREES_PER_HOUR;
    const sinDec = 0.39782 * Sun.sinDeg(sunTrueLongitude);
    const cosDec = Sun.cosDeg(Sun.asinDeg(sinDec));
    const cosLocalHourAngle = ((Sun.cosDeg(zenith)) - (sinDec * (Sun.sinDeg(latitude)))) / (cosDec * (Sun.cosDeg(latitude)));
    let localHourAngle = Sun.acosDeg(cosLocalHourAngle)
    if (sunrise) {
      localHourAngle = 360 - localHourAngle;
    }
    const localHour = localHourAngle / Sun.DEGREES_PER_HOUR;
    const localMeanTime = localHour + rightAscension - (0.06571 * approxTimeOfEventInDays) - 6.622;
    let time = localMeanTime - (longitude / Sun.DEGREES_PER_HOUR);
    time = Sun.mod(time, 24);
    const midnight = new Date(0);
    midnight.setUTCFullYear(now.getUTCFullYear());
    midnight.setUTCMonth(now.getUTCMonth());
    midnight.setUTCDate(now.getUTCDate());
    const milliseconds = midnight.getTime() + (time * 60 * 60 * 1000);
    return new Date(milliseconds);
  }

  static DEGREES_PER_HOUR = 360 / 24;

  static getDayOfYear(date) {
    const first = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((date - first) / 86400000);
  }

  static degToRad(num) {
    return num * Math.PI / 180;
  }

  /**
   * Converts radians to degrees.
   * @param {number} radians 
   * @returns {number}
   */
  static radToDeg(radians) {
    return radians * 180.0 / Math.PI;
  }

  /**
   * Sine operation but the input is in degrees instead of radians.
   * @param {number} deg 
   * @returns {number}
   */
  static sinDeg(deg) {
    return Math.sin(deg * 2.0 * Math.PI / 360.0);
  }

  /**
   * Gets the arc-cosine in degrees.
   * @param {number} x Cosine factor, 0 to 1.
   * @returns {number}
   */
  static acosDeg(x) {
    return Math.acos(x) * 360.0 / (2 * Math.PI);
  }

  /**
   * Gets the arc-sine in degrees.
   * @param {number} x Sine factor, 0 to 1.
   * @returns {number}
   */
  static asinDeg(x) {
    return Math.asin(x) * 360.0 / (2 * Math.PI);
  }

  /**
   * @param {number} deg
   * @returns {number}
   */
  static tanDeg(deg) {
    return Math.tan(deg * 2.0 * Math.PI / 360.0);
  }

  /**
   * Cosine operation but the input is in degrees.
   * @param {number} deg
   * @returns {number}
   */
  static cosDeg(deg) {
    return Math.cos(deg * 2.0 * Math.PI / 360.0);
  }

  static mod(a, b) {
    let result = a % b;
    if (result < 0) {
      result += b;
    }
    return result;
  }
}

module.exports = { Sun, GoldenHour, TimeSpan };
