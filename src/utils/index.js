const _ = require("lodash");
const { Types } = require("mongoose");

const getInfoData = ({ object = {}, fields = [] }) => {
  return _.pick(object, fields);
};
/*
  ['type', 1],
  ['col', 2]
  => {
    type: 1,
    col: 2
  }
*/
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((e) => [e, 1]));
};
const getUnselectData = (select = []) => {
  return Object.fromEntries(select.map((e) => [e, 0]));
};
const removeUndefinedInObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) delete obj[key];
  });
  return obj;
};
const convertToObjectId = (id) => new Types.ObjectId(id);

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d.toFixed(1);
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
function daysOfMonth(month, year) {
  const monthsHave31Days = [1, 3, 5, 7, 8, 10, 12];
  const monthsHave30Days = [4, 6, 9, 11];
  if (monthsHave31Days.includes(month)) {
    return 31;
  } else if (monthsHave30Days.includes(month)) {
    return 30;
  } else {
    if (isLeapYear(year)) {
      return 29;
    } else 28;
  }
}
module.exports = {
  getInfoData,
  getSelectData,
  getUnselectData,
  convertToObjectId,
  removeUndefinedInObject,
  getDistanceFromLatLonInKm,
  daysOfMonth,
};
