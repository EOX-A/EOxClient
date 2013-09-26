//Namespace
var EarthServerGenericClient = EarthServerGenericClient || {};

/**
 * @class Scene Model: WMS Image with DEM from WCPS Query
 * 2 URLs for the service, 2 Coverage names for the image and dem.
 * @augments EarthServerGenericClient.AbstractSceneModel
 */
EarthServerGenericClient.Model_WMSDemWCPS = function()
{
    this.setDefaults();
    this.name = "WMS Image with DEM from WCPS Query.";

    /**
     * WMS version for the query.
     * @default "1.3"
     * @type {String}
     */
    this.WMSVersion = "1.3";
};
EarthServerGenericClient.Model_WMSDemWCPS.inheritsFrom( EarthServerGenericClient.AbstractSceneModel );
/**
 * Sets the urls for the WMS and WCPS Queries. If only one url is given it is used for both requests.
 * @param imageURL - Service URL for the WCPS Image Request
 * @param demURL - Service URL for the WCPS Dem Request
 */
EarthServerGenericClient.Model_WMSDemWCPS.prototype.setURLs=function(imageURL, demURL){
    /**
     * URL for the WCPS image service.
     * @type {String}
     */
    this.imageURL = String(imageURL);
    /**
     * URL for the WCPS Dem service.
     * @type {String}
     */
    this.demURL;
    if(demURL === undefined) // if demURL is not defined use imageURL
    {   this.demURL = String(imageURL); }
    else
    {   this.demURL  = String(demURL);  }
};
/**
 * Sets both coveragenames
 * @param coverageImage - Coverage name for the image dataset.
 * @param coverageDem   - Coverage name for the dem dataset.
 */
EarthServerGenericClient.Model_WMSDemWCPS.prototype.setCoverages = function (coverageImage, coverageDem) {
    /**
     * Name of the image coverage.
     * @type {String}
     */
    this.coverageImage = String(coverageImage);
    /**
     * Name if the dem coverage.
     * @type {String}
     */
    this.coverageDEM = String(coverageDem);
};

/**
 * Sets the WMS Version for the WMS Query String. Default: "1.3"
 * @param version - String with WMS version number.
 */
EarthServerGenericClient.Model_WMSDemWCPS.prototype.setWMSVersion = function(version)
{
    this.WMSVersion = String(version);
};

/**
 * Sets a custom query for the WCPS Dem request.
 * @param querystring - WCPS as a string.
 */
EarthServerGenericClient.Model_WMSDemWCPS.prototype.setWCPSDemQuery = function(querystring)
{
    /**
     * The custom WCPS Dem query.
     * @type {String}
     */
    this.WCPSDemQuery = String(querystring);
};


/**
 * Sets the Coordinate Reference System for the WCPS Query
 * @param value - eg. "http://www.opengis.net/def/crs/EPSG/0/27700"
 */
EarthServerGenericClient.Model_WMSDemWCPS.prototype.setWCPSCoordinateReferenceSystem = function(value)
{
    this.WCPSCRS = value;
};

/**
* Sets the Coordinate Reference System for the WMS Image.
* @param System - eg. CRS,SRS
* @param value - eg. EPSG:4326
*/
EarthServerGenericClient.Model_WMSDemWCPS.prototype.setWMSCoordinateReferenceSystem = function(System,value)
{
    this.WMSCRS = System + "=" + value;
};

/**
 * Creates the x3d geometry and appends it to the given root node. This is done automatically by the SceneManager.
 * @param root - X3D node to append the model.
 * @param cubeSizeX - Size of the fishtank/cube on the x-axis.
 * @param cubeSizeY - Size of the fishtank/cube on the y-axis.
 * @param cubeSizeZ - Size of the fishtank/cube on the z-axis.
 */
EarthServerGenericClient.Model_WMSDemWCPS.prototype.createModel=function(root, cubeSizeX, cubeSizeY, cubeSizeZ){
    if( root === undefined)
        alert("root is not defined");

    EarthServerGenericClient.MainScene.timeLogStart("Create Model " + this.name);

    this.cubeSizeX = cubeSizeX;
    this.cubeSizeY = cubeSizeY;
    this.cubeSizeZ = cubeSizeZ;

    this.root = root;

    //Create Placeholder
    this.createPlaceHolder();

    //1: Check if mandatory values are set
    if( this.coverageImage === undefined || this.coverageDEM === undefined || this.imageURL === undefined || this.demURL === undefined
        || this.minx === undefined || this.miny === undefined || this.maxx === undefined || this.maxy === undefined || this.WMSCRS === undefined || this.WCPSCRS === undefined )
    {
        alert("Not all mandatory values are set. WCPSDemWCPS: " + this.name );
        console.log(this);
        return;
    }


    if( this.WCPSDemQuery === undefined)
    {
        var currentXRes = this.XResolution;
        var currentZRes = this.ZResolution;
        this.WCPSDemQuery =  "for dtm in (" + this.coverageDEM + ") return encode (";
        this.WCPSDemQuery += 'scale(trim(dtm , {x:"' + this.WCPSCRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.WCPSCRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + currentXRes + '), y:"CRS:1"(0:' + currentZRes + ")}, {})";
        this.WCPSDemQuery += ', "csv" )';
    }
    else //A custom query was defined so use it
    {
        //Replace $ symbols with the actual values
        this.WCPSDemQuery = this.replaceSymbolsInString(this.WCPSDemQuery);
    }

    var bb = {
        minLongitude: this.miny,
        maxLongitude: this.maxy,
        minLatitude:  this.minx,
        maxLatitude:  this.maxx
    };

    // Request
    EarthServerGenericClient.requestWMSImageWCPSDem(this,bb,this.XResolution,this.ZResolution,
        this.imageURL,this.coverageImage,this.WMSVersion,this.WMSCRS,this.imageFormat,this.demURL,this.WCPSDemQuery);
};

/**
 * This is a callback method as soon as the ServerRequest in createModel() has received it's data.
 * This is done automatically.
 * @param data - Received data from the ServerRequest.
 */
EarthServerGenericClient.Model_WMSDemWCPS.prototype.receiveData= function( data)
{
    if( this.checkReceivedData(data))
    {
        //Remove the placeHolder
        this.removePlaceHolder();

        var YResolution = this.YResolution || (parseFloat(data.maxHMvalue) - parseFloat(data.minHMvalue) );
        var YMinimum = this.YMinimum || parseFloat(data.minHMvalue);
        var transform = this.createTransform(data.width,YResolution,data.height,YMinimum);
        this.root.appendChild( transform);

        //Set transparency
        data.transparency = this.transparency;
        //Create Terrain out of the received data
        EarthServerGenericClient.MainScene.timeLogStart("Create Terrain " + this.name);
        this.terrain = new EarthServerGenericClient.LODTerrain(transform, data, this.index, this.noData, this.demNoData);
        this.terrain.createTerrain();
        EarthServerGenericClient.MainScene.timeLogEnd("Create Terrain " + this.name);
        this.elevationUpdateBinding(); // notify all bindings about the terrain elevation update

        if(this.sidePanels)
        {   this.terrain.createSidePanels(transform,1); }

        EarthServerGenericClient.MainScene.timeLogEnd("Create Model " + this.name);

        transform = null;
    }
};


/**
 * Every Scene Model creates it's own specific UI elements. This function is called automatically by the SceneManager.
 * @param element - The element where to append the specific UI elements for this model.
 */
EarthServerGenericClient.Model_WMSDemWCPS.prototype.setSpecificElement= function(element)
{
    EarthServerGenericClient.appendElevationSlider(element,this.index);
};
