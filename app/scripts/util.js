
var padLeft = function(str, pad, size) {
  while (str.length < size) {
    str = pad + str;
  }
  return str;
};

var getDateString = function(date) {
  return date.getFullYear() + "-" 
    + padLeft(String(date.getUTCMonth() + 1), "0", 2) + "-"
    + padLeft(String(date.getUTCDate()), "0", 2);
};

var getISODateString = function(date) {
  return getDateString(date) + "T";
};

var getISODateTimeString = function(date) {
  return getISODateString(date)
    + padLeft(String(date.getUTCHours()), "0", 2) + ":"
    + padLeft(String(date.getUTCMinutes()), "0", 2) + ":"
    + padLeft(String(date.getUTCSeconds()), "0", 2) + "Z";
};

var htmlTemplate = function(selector, values) {
  var tmplString = $(selector).html();
  return _.template(tmplString, values);
};

var utc = function(year, month, day, hours, minutes, seconds, milliseconds) {
  var date = new Date(Date.UTC.apply(null, arguments));
  return date;
};

// TODO: move this to libcoverage.js
var getCoverageXML = function(coverageid, options) {
  if (!coverageid) {
      throw new Error("Parameters 'coverageid' is mandatory.");
  }
  options = options || {};
  subsetCRS = options.subsetCRS || "http://www.opengis.net/def/crs/EPSG/0/4326";
  var params = [
    '<wcs:GetCoverage service="WCS" version="2.0.0" xmlns:wcs="http://www.opengis.net/wcs/2.0" xmlns:wcscrs="http://www.opengis.net/wcs/crs/1.0" xmlns:wcsmask="http://www.opengis.net/wcs/mask/1.0">',
    '<wcs:CoverageId>' + coverageid + '</wcs:CoverageId>',
  ], extension = [];

  if (options.format)
    params.push("<wcs:format>" + options.format + "</wcs:format>");
  if (options.bbox && !options.subsetX && !options.subsetY) {
    options.subsetX = [options.bbox[0], options.bbox[2]];
    options.subsetY = [options.bbox[1], options.bbox[3]];
  }
  if (options.subsetX) {
    params.push('<wcs:DimensionTrim><wcs:Dimension crs="' + subsetCRS + '">x</wcs:Dimension>' +
                "<wcs:TrimLow>" + options.subsetX[0] + "</wcs:TrimLow>" +
                "<wcs:TrimHigh>" + options.subsetX[1] + "</wcs:TrimHigh></wcs:DimensionTrim>");
  }
  if (options.subsetY) {
    params.push('<wcs:DimensionTrim><wcs:Dimension crs="' + subsetCRS + '">y</wcs:Dimension>' +
                "<wcs:TrimLow>" + options.subsetY[0] + "</wcs:TrimLow>" +
                "<wcs:TrimHigh>" + options.subsetY[1] + "</wcs:TrimHigh></wcs:DimensionTrim>");
  }
  
  if (options.outputCRS) {
    /* the crs extension is not released. Mapserver expects a <wcs:OutputCRS> 
     * in the root. Will stick to that atm, but requires a change in the future.
    */
    //extension.push("<wcscrs:outputCrs>" + options.outputCRS + "</wcscrs:outputCrs>");
    params.push("<wcs:OutputCrs>" + options.outputCRS + "</wcs:OutputCrs>");
  }

  // raises an exception in MapServer
  //extension.push("<wcscrs:subsettingCrs>" + subsetCRS + "</wcscrs:subsettingCrs>");
  
  if (options.mask) {
    extension.push("<wcsmask:polygonMask>" + options.mask + "</wcsmask:polygonMask>");
  }
  if (options.multipart) {
    params.push("<wcs:mediaType>multipart/related</wcs:mediaType>");
  }

  if (extension.length > 0) {
    params.push("<wcs:Extension>");
    for(var i = 0; i < extension.length; ++i) {
      params.push(extension[i]);
    }
    params.push("</wcs:Extension>");
  }
  params.push('</wcs:GetCoverage>');
  return params.join("");
};
