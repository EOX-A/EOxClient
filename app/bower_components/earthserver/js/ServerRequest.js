//Namespace
var EarthServerGenericClient = EarthServerGenericClient || {};

/**
 * @class Generic Server Response Data object. All requests store the response in an instance of this object.
 * One instance can be given as parameter for different requests if all requests writes different fields.
 * Example: One WMS request for the texture and one WCS request for the heightmap.
 */
EarthServerGenericClient.ServerResponseData = function () {
    this.heightmap = null;          // Heightmap
    this.noDataValue = undefined;   // The value that should be considered as NODATA.
    this.heightmapUrl = "";         // If available, you can use the link as alternative.
    this.texture = new Image();     // Texture as image object
    this.texture.crossOrigin = '';  // Enable Texture to be edited (for alpha values for example)
    this.textureUrl = "";           // If available, you can use the link as alternative.
    this.width = 0;                 // Heightmap width
    this.height = 0;                // Heightmap height

    // The information about the heightmap are used to position a module correctly in the fishtank.
    // The minimum value as offset and the difference between minimum and maximum for scaling.
    this.minHMvalue =  Number.MAX_VALUE;// Lowest value in the heightmap
    this.maxHMvalue = -Number.MAX_VALUE;// Highest value in the heigtmap
    this.averageHMvalue = 0;        // Average value of the heightmap

    // Flags to customize the server response
    this.heightmapAsString = false;  // Flag if heightmap is encoded as a array of arrays(default) or as a string with csv.
    this.validateHeightMap = true;   // Flag if heightmap should be checked in validate().
    this.validateTexture   = false;  // Flag if the texture should be checked in validate().
    this.removeAlphaChannel = false; // Flag if the alpha channel contains e.g. height data it should be removed for the texture

    /**
     * Validates if the response full successfully: Was an image and a height map received?
     * @returns {boolean} - True if both image and heightmap are present, false if not.
     */
    this.validate = function()
    {
        //Texture
        if( this.validateTexture )
        {
            if( this.texture === undefined){    return false;   }
            if( this.texture.width <= 0 || this.texture.height <=0){    return false;   }
        }

        //Heightmap
        if( this.validateHeightMap )
        {
            if( this.heightmap === null){    return false;   }
            if( this.width === null || this.height === null){    return false;   }
            if( this.minHMvalue === Number.MAX_VALUE || this.maxHMvalue === -Number.MAX_VALUE){    return false;   }
        }

        //Everything OK
        return true;
    };
};

/**
 * Small helper to synchronise multiple request callbacks. After all callbacks to this helper
 * are received the ResponseData object with all response data is send to the module.
 * After each request is received a progress update is send to the module.
 * @param callback - Module which requests the data.
 * @param numberToCombine - Number of callbacks that shall be received.
 * @param saveDataInArray - In most cases one responseData is used. If set true the data is stored in an array.
 */
EarthServerGenericClient.combinedCallBack = function(callback,numberToCombine,saveDataInArray)
{
    var counter = 0;
    this.name = "Combined Callback: " + callback.name;
    this.dataArray = [];
    EarthServerGenericClient.MainScene.timeLogStart("Combine: " + callback.name);

    /**
     * @ignore
     * @param data - Server response data object
     */
    this.receiveData = function(data)
    {
        counter++;

        if(saveDataInArray)
            this.dataArray.push(data);

        if( counter ==  numberToCombine)
        {
            EarthServerGenericClient.MainScene.timeLogEnd("Combine: " + callback.name);

            if(saveDataInArray)// callback with the 1 responseData or the array
                callback.receiveData(this.dataArray);
            else
                callback.receiveData(data);
        }
    };

    /**
     * @ignore
     * @returns {undefined|float} - Returns the noData value of the dem from the module.
     */
    this.getDemNoDataValue = function()
    {
        return callback.getDemNoDataValue();
    };
};

/**
 * Requests a WMS image, stores it in the responseData and make the callback once it is loaded.
 * @param callback - Object to do the callback.
 * @param responseData - Instance of the ServerResponseData.
 * @param WMSurl - URL of the WMS service.
 * @param WMScoverID - Coverage/Layer ID.
 * @param WMSCRS - The Coordinate Reference System. (Should be like: "crs=1")
 * @param WMSImageFormat - The image format that should be returned.
 * @param BoundingBox - The bounding box of the image.
 * @param WMSVersion - WMS Version that should be used.
 * @param width - Width of the response image.
 * @param height - Height of the response image.
 */
EarthServerGenericClient.getCoverageWMS = function(callback,responseData,WMSurl,WMScoverID,WMSCRS,WMSImageFormat,BoundingBox,WMSVersion,width,height)
{
    responseData.textureUrl = WMSurl + "?service=WMS&version=" + WMSVersion +"&request=Getmap&layers=" + WMScoverID;
    responseData.textureUrl += "&" + WMSCRS + "&format=image/" + WMSImageFormat;
    responseData.textureUrl += "&bbox=" + BoundingBox.minLatitude + "," + BoundingBox.minLongitude + ","+ BoundingBox.maxLatitude + "," + BoundingBox.maxLongitude;
    responseData.textureUrl += "&width="+width+"&height="+height;

    responseData.texture.onload = function()
    {
        callback.receiveData(responseData);
    };
    responseData.texture.onerror = function()
    {
        x3dom.debug.logInfo("Could not load Image.");
        callback.receiveData(responseData);
    };
    responseData.texture.src = responseData.textureUrl;

};

/**
 * Starts a WCPS query and stores the received image in the responseData.
 * If a dem is encoded in the alpha channel it will be extracted and also stored. Set DemInAlpha Flag in this case.
 * @param callback - Object to do the callback.
 * @param responseData - Instance of the ServerResponseData.
 * @param url - URL of the WCPS service.
 * @param query - The WCPS query.
 * @param DemInAlpha - Flag if a dem is encoded in the alpha channel.
 */
EarthServerGenericClient.getWCPSImage = function(callback,responseData,url, query, DemInAlpha)
{
    try
    {
        responseData.texture.onload = function()
        {
            EarthServerGenericClient.MainScene.timeLogEnd("WCPS: " + callback.name);
            if(DemInAlpha)
            {
                responseData.heightmapUrl = responseData.texture.src;
                var demNoData = callback.getDemNoDataValue();

                var canvas = document.createElement('canvas');
                canvas.width = responseData.texture.width;
                canvas.height = responseData.texture.height;

                var context = canvas.getContext('2d');
                context.drawImage(responseData.texture, 0, 0);

                var hm = new Array(canvas.width);
                for(var k=0; k<canvas.width; k++)
                {
                    hm[k] = new Array(canvas.height);
                }

                responseData.width = hm.length;
                responseData.height = hm[0].length;

                var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                var total = 0;
                for(var i=3; i<imageData.data.length; i+=4)
                {
                    var index = i/4;
                    hm[parseInt(index%hm.length)][parseInt(index/hm.length)] = imageData.data[i];

                    if(imageData.data[i] !== demNoData)
                    {
                        if( responseData.minHMvalue > imageData.data[i] )
                        { responseData.minHMvalue = imageData.data[i]  }
                        if( responseData.maxHMvalue < imageData.data[i] )
                        { responseData.maxHMvalue = imageData.data[i]  }
                        total = total + parseFloat(imageData.data[i]);
                    }

                }
                responseData.averageHMvalue = parseFloat(total / imageData.data.length);
                responseData.heightmap = hm;

                context = null;
                canvas = null;
            }

            callback.receiveData(responseData);
        };
        responseData.texture.onerror = function()
        {
            responseData.texture = new Image();
            responseData.texture.onload = callback.receiveData(responseData);
            responseData.texture.src="defaultTexture.png";
            console.log("ServerRequest::wcpsRequest(): Could not load Image from url " + url);
        };

        responseData.textureUrl = url + "?query=" + encodeURIComponent(query);
        EarthServerGenericClient.MainScene.timeLogStart("WCPS: " + callback.name);
        responseData.texture.src = responseData.textureUrl;
    }
    catch(error)
    {
        x3dom.debug.logInfo('ServerRequest::getWCPSImage(): ' + error);
        callback.receiveData(responseData);
    }
};

/**
 * This function sends the WCPS query to the specified service and tries to interpret the received data as a DEM.
 * @param callback - Object to do the callback.
 * @param responseData - Instance of the ServerResponseData.
 * @param WCPSurl - URl of the WCPS service.
 * @param WCPSquery - The WCPS request query.
 */
EarthServerGenericClient.getWCPSDemCoverage = function(callback,responseData,WCPSurl,WCPSquery)
{
    EarthServerGenericClient.MainScene.timeLogStart("WCPS DEM Coverage: " + callback.name );
    var query = "query=" + encodeURIComponent(WCPSquery);

    $.ajax(
        {
            url: WCPSurl,
            type: 'GET',
            dataType: 'text',
            data: query,
            success: function(receivedData)
            {
                try{
                EarthServerGenericClient.MainScene.timeLogEnd("WCPS DEM Coverage: " + callback.name );
                var demNoData = callback.getDemNoDataValue();
                //The received data is a list of tuples: {value,value},{value,value},.....
                var tuples = receivedData.split('},');

                var sizeX = tuples.length;
                if( sizeX <=0 || isNaN(sizeX)  )
                {   throw "getCoverageWCS: "+WCPSurl+": Invalid data size ("+sizeX+")"; }


                var hm = new Array(sizeX);
                for(var o=0; o<sizeX;o++)
                {   hm[o] = []; }

                for (var i = 0; i < tuples.length; i++)
                {
                    var tmp = tuples[i].substr(1);
                    var valuesList = tmp.split(",");

                    for (var k = 0; k < valuesList.length; k++)
                    {
                        tmp = parseFloat(valuesList[k]);
                        hm[i][k] = tmp;

                        if( tmp !== demNoData)
                        {
                            if (responseData.maxHMvalue < tmp)
                            {
                                responseData.maxHMvalue = parseFloat(tmp);
                            }
                            if (responseData.minHMvalue > tmp)
                            {
                                responseData.minHMvalue = parseFloat(tmp);
                            }
                        }
                    }
                }
                if(responseData.minHMvalue!=0 && responseData.maxHMvalue!=0)
                {
                    responseData.averageHMvalue = (responseData.minHMvalue+responseData.maxHMvalue)/2;
                }
                tuples = null;

                responseData.width = hm.length;
                responseData.height = hm[0].length;

                responseData.heightmap = hm;
                }
                catch(err)
                {   alert(err); }

                callback.receiveData(responseData);
            },
            error: function(xhr, ajaxOptions, thrownError)
            {
                EarthServerGenericClient.MainScene.timeLogEnd("WCPS DEM Coverage: " + callback.name );
                console.log('\t' + xhr.status +" " + ajaxOptions + " " + thrownError);
            }
        }
    );
};

/**
 * Requests a WCS coverage and stores is the heightmap field of the responseData.
 * @param callback - Object to do the callback.
 * @param responseData - Instance of the ServerResponseData.
 * @param WCSurl - URl of the WCS service.
 * @param WCScoverID - ID of the coverage.
 * @param WCSBoundingBox - Bounding Box of the area.
 * @param WCSVersion - Version of used WCS service.
 */
EarthServerGenericClient.getCoverageWCS = function(callback,responseData,WCSurl,WCScoverID,WCSBoundingBox,WCSVersion)
{
    var request = 'service=WCS&Request=GetCoverage&version=' + WCSVersion + '&CoverageId=' + WCScoverID;
    request += '&subsetx=x(' + WCSBoundingBox.minLatitude + ',' + WCSBoundingBox.maxLatitude + ')&subsety=y(' + WCSBoundingBox.minLongitude + ',' + WCSBoundingBox.maxLongitude + ')';

    EarthServerGenericClient.MainScene.timeLogStart("WCS Coverage: " + callback.name );

    $.ajax(
        {
            url: WCSurl,
            type: 'GET',
            dataType: 'XML',
            data: request,
            success: function(receivedData)
            {
                try{
                EarthServerGenericClient.MainScene.timeLogEnd("WCS Coverage: " + callback.name );
                var Grid = $(receivedData).find('GridEnvelope');
                var low  = $(Grid).find('low').text().split(" ");
                var high = $(Grid).find('high').text().split(" ");

                var sizeX = high[0] - low[0] + 1;
                var sizeY = high[1] - low[1] + 1;

                if( sizeX <=0 || sizeY <=0 || isNaN(sizeX) || isNaN(sizeY) )
                {   throw "getCoverageWCS: "+WCSurl+"/"+WCScoverID+": Invalid grid size ("+sizeX+","+sizeY+")"; }

                responseData.height = sizeX;
                responseData.width  = sizeY;

                console.log(sizeX,sizeY);

                var hm = new Array(sizeX);
                for(var index=0; index<hm.length; index++)
                {
                    hm[index] = new Array(sizeY);
                }

                var DataBlocks = $(receivedData).find('DataBlock');
                DataBlocks.each(function () {
                    var tuples = $(this).find("tupleList").text().split('},');
                    for (var i = 0; i < tuples.length; i++) {
                        var tmp = tuples[i].substr(1);
                        var valuesList = tmp.split(",");

                        for (var k = 0; k < valuesList.length; k++) {
                            tmp = parseFloat(valuesList[k]);

                            hm[parseInt(k/(sizeX))][parseInt(k%(sizeX))] = tmp;

                            if (responseData.maxHMvalue < tmp)
                            {
                                responseData.maxHMvalue = parseFloat(tmp);
                            }
                            if (responseData.minHMvalue > tmp)
                            {
                                responseData.minHMvalue = parseFloat(tmp);
                            }
                        }
                    }
                    if(responseData.minHMvalue!=0 && responseData.maxHMvalue!=0)
                    {
                        responseData.averageHMvalue = (responseData.minHMvalue+responseData.maxHMvalue)/2;
                    }
                    tuples = null;
                });
                DataBlocks = null;
                responseData.heightmap = hm;
                }
                catch(err)
                {   alert(err); }

                callback.receiveData(responseData);
            },
            error: function(xhr, ajaxOptions, thrownError)
            {
                EarthServerGenericClient.MainScene.timeLogEnd("WCS Coverage: " + callback.name );
                x3dom.debug.logInfo('\t' + xhr.status +" " + ajaxOptions + " " + thrownError);
            }
        }
    );
};

/**
 * Requests one image via WCSPS. It is assumed that the image has a dem encoded in the alpha channel.
 * If not the terrain is flat.
 * @param callback - Module that requests the image.
 * @param WCPSurl - URL of the WCPS service.
 * @param WCPSquery - The WCPS query.
 */
EarthServerGenericClient.requestWCPSImageAlphaDem = function(callback,WCPSurl,WCPSquery)
{
    var responseData = new EarthServerGenericClient.ServerResponseData();
    responseData.removeAlphaChannel = true; // Remove the alpha channel for the final texture
    EarthServerGenericClient.getWCPSImage(callback,responseData,WCPSurl,WCPSquery,true);
};

/**
 * Requests one image via WCSPS.
 * @param callback - Module that requests the image.
 * @param WCPSurl - URL of the WCPS service.
 * @param WCPSquery - The WCPS query.
 */
EarthServerGenericClient.requestWCPSImage = function(callback,WCPSurl,WCPSquery)
{
    var responseData = new EarthServerGenericClient.ServerResponseData();
    responseData.validateHeightMap = false; // No heightmap in this response intended so don't check it in validate()
    EarthServerGenericClient.getWCPSImage(callback,responseData,WCPSurl,WCPSquery,false);
};

/**
 * The progressive WCPS loader initiate multiple queries consecutively. As soon as one response is received the
 * next query is executed. Every response is given to the given callback.
 * Note: The WCPS loader starts with the last query in the array (LIFO).
 * @param callback - Module that requests the WCPS images.
 * @param WCPSurl - URL of the WCPS service.
 * @param WCPSqueries - Array of WCPS queries. (LIFO)
 * @param DemInAlpha - Flag if a dem is encoded in the alpha channel.
 */
EarthServerGenericClient.progressiveWCPSImageLoader = function(callback,WCPSurl,WCPSqueries,DemInAlpha)
{
    var which = WCPSqueries.length -1;
    //We need one responseData for every query in WCPSqueries
    var responseData = [];
    //For time logging.
    this.name = "Progressive WCPS Loader: " + callback.name;

    for(var i=0;i<WCPSqueries.length;i++)
    {
        responseData[i] = new EarthServerGenericClient.ServerResponseData();
        responseData[i].removeAlphaChannel = DemInAlpha; // Should the alpha channel be removed for the final texture?
    }

    /**
     * @ignore
     * @param which - index of the request to make.
     */
    this.makeRequest =  function(which)
    {
        if(which >= 0)
        {
            EarthServerGenericClient.MainScene.timeLogStart("Progressive WCPS: " + WCPSurl + "_Query_" +which);
            EarthServerGenericClient.getWCPSImage(this,responseData[which],WCPSurl,WCPSqueries[which],DemInAlpha);
        }
        else
        {   responseData = null;  }
    };
    /**
     * @ignore
     * @param data - Server response data object
     */
    this.receiveData = function(data)
    {
        EarthServerGenericClient.MainScene.timeLogEnd("Progressive WCPS: " + WCPSurl + "_Query_" +which);
        which--;
        this.makeRequest(which);
        callback.receiveData(data);
    };
    this.makeRequest(which);
};

/**
 * Requests an image via WCPS and a dem via WCS.
 * @param callback - Module requesting this data.
 * @param WCPSurl - URL of the WCPS service.
 * @param WCPSquery - WCPS Query for the image.
 * @param WCSurl - URL of the WCS service.
 * @param WCScoverID - Coverage ID for the WCS height data.
 * @param WCSBoundingBox - Bounding box of the area used in WCS.
 * @param WCSVersion - Version of the used WCS.
 */
EarthServerGenericClient.requestWCPSImageWCSDem = function(callback,WCPSurl,WCPSquery,WCSurl,WCScoverID,WCSBoundingBox,WCSVersion)
{
    var responseData = new EarthServerGenericClient.ServerResponseData();
    var combine = new EarthServerGenericClient.combinedCallBack(callback,2);

    EarthServerGenericClient.getWCPSImage(combine,responseData,WCPSurl,WCPSquery,false);
    EarthServerGenericClient.getCoverageWCS(combine,responseData,WCSurl,WCScoverID,WCSBoundingBox,WCSVersion);
};


EarthServerGenericClient.requestWCPSImageWCPSDem = function(callback,imageURL,imageQuery,demURL,demQuery)
{
    var responseData = new EarthServerGenericClient.ServerResponseData();
    var combine = new EarthServerGenericClient.combinedCallBack(callback,2);

    EarthServerGenericClient.getWCPSImage(combine,responseData,imageURL,imageQuery,false);
    EarthServerGenericClient.getWCPSDemCoverage(combine,responseData,demURL,demQuery);
};

/**
 * Requests an image via WMS and a dem via WCS.
 * @param callback - Module requesting this data.
 * @param BoundingBox - Bounding box of the area, used in both WMS and WCS requests.
 * @param ResX - Width of the response image via WMS.
 * @param ResY - Height of the response image via WMS.
 * @param WMSurl - URL of the WMS service.
 * @param WMScoverID - Layer ID used in WMS.
 * @param WMSversion - Version of the WMS service.
 * @param WMSCRS - The Coordinate Reference System. (Should be like: "crs=1")
 * @param WMSImageFormat - Image format for the WMS response.
 * @param WCSurl - URL of the WCS service.
 * @param WCScoverID - Coverage ID used in WCS.
 * @param WCSVersion - Version of the WCS service.
 */
EarthServerGenericClient.requestWMSImageWCSDem = function(callback,BoundingBox,ResX,ResY,WMSurl,WMScoverID,WMSversion,WMSCRS,WMSImageFormat,WCSurl,WCScoverID,WCSVersion)
{
    var responseData = new EarthServerGenericClient.ServerResponseData();
    var combine = new EarthServerGenericClient.combinedCallBack(callback,2);

    EarthServerGenericClient.getCoverageWMS(combine,responseData,WMSurl,WMScoverID,WMSCRS,WMSImageFormat,BoundingBox,WMSversion,ResX,ResY);
    EarthServerGenericClient.getCoverageWCS(combine,responseData,WCSurl,WCScoverID,BoundingBox,WCSVersion);
};

/**
 * Requests an image via WMS and a dem via WCPS.
 * @param callback - Module requesting this data.
 * @param BoundingBox - Bounding box of the area, used in both WMS and WCS requests.
 * @param ResX - Width of the response image via WMS.
 * @param ResY - Height of the response image via WMS.
 * @param WMSurl - URL of the WMS service.
 * @param WMScoverID - Layer ID used in WMS.
 * @param WMSversion - Version of the WMS service.
 * @param WMSCRS - The Coordinate Reference System. (Should be like: "crs=1")
 * @param WMSImageFormat - Image format for the WMS response.
 * @param WCPSurl - URL for the WCPS Query
 * @param WCPSquery - WCPS DEM Query
 */
EarthServerGenericClient.requestWMSImageWCPSDem = function( callback,BoundingBox,ResX,ResY,WMSurl,WMScoverID,WMSversion,WMSCRS,WMSImageFormat,WCPSurl,WCPSquery)
{
    var responseData = new EarthServerGenericClient.ServerResponseData();
    var combine = new EarthServerGenericClient.combinedCallBack(callback,2);

    EarthServerGenericClient.getCoverageWMS(combine,responseData,WMSurl,WMScoverID,WMSCRS,WMSImageFormat,BoundingBox,WMSversion,ResX,ResY);
    EarthServerGenericClient.getWCPSDemCoverage(combine,responseData,WCPSurl,WCPSquery);
};

EarthServerGenericClient.requestWCPSImages = function(callback, URLWCPS, WCPSQuery)
{
    var combine = new EarthServerGenericClient.combinedCallBack(callback,WCPSQuery.length,true);
    var responseDataArray = [];

    for(var o=0; o< WCPSQuery.length;o++)
    {
        responseDataArray.push( new EarthServerGenericClient.ServerResponseData() );
        responseDataArray[o].validateHeightMap = false; // no height map will be received
    }

    for(var i=0; i< WCPSQuery.length;i++)
    {
        EarthServerGenericClient.getWCPSImage(combine,responseDataArray[i],URLWCPS,WCPSQuery[i],false);
    }
};