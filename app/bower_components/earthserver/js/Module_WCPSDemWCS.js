//Namespace
var EarthServerGenericClient = EarthServerGenericClient || {};

/**
 * @class Scene Model: WCPS Image with DEM from WCS Query
 * 2 URLs for the service, 2 Coverage names for the image and dem.
 * @augments EarthServerGenericClient.AbstractSceneModel
 */
EarthServerGenericClient.Model_WCPSDemWCS = function()
{
    this.setDefaults();
    this.name = "WCPS Image with DEM from WCS Query.";
    /**
     * WCS version for the query.
     * @default "2.0.0"
     * @type {String}
     */
    this.WCSVersion = "2.0.0";
};
EarthServerGenericClient.Model_WCPSDemWCS.inheritsFrom( EarthServerGenericClient.AbstractSceneModel );
/**
 * Sets the url for both the WCPS and WCS Queries.
 * @param wcpsurl - Service URL for the WCPS Request
 * @param demurl  - Service URL for the WCS Request
 */
EarthServerGenericClient.Model_WCPSDemWCS.prototype.setURLs=function(wcpsurl, demurl){
    /**
     * URL for the WCPS service.
     * @type {String}
     */
    this.URLWCPS = String(wcpsurl);
    /**
     * URL for the WCS service.
     * @type {String}
     */
    this.URLDEM  = String(demurl);
};
/**
 * Sets both coveragenames
 * @param coverageImage - Coverage name for the image dataset.
 * @param coverageDem   - Coverage name for the dem dataset.
 */
EarthServerGenericClient.Model_WCPSDemWCS.prototype.setCoverages = function (coverageImage, coverageDem) {
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
 * Sets a complete custom querystring.
 * @param querystring - the querystring. Use $CI (coverageImage), $CD (coverageDEM),
 * $MINX,$MINY,$MAXX,$MAXY(AoI) and $RESX,ResZ (Resolution) for automatic replacement.
 * Examples: $CI.red , x($MINX:$MINY)
 */
EarthServerGenericClient.Model_WCPSDemWCS.prototype.setWCPSQuery = function(querystring)
{
    /**
     * The custom query.
     * @type {String}
     */
    this.WCPSQuery = String(querystring);
};

/**
 * Sets the WCS Version for the WCS Query String. Default: "2.0.0"
 * @param version - String with WCS version number.
 */
EarthServerGenericClient.Model_WCPSDemWCS.prototype.setWCSVersion = function(version)
{
    this.WCSVersion = String(version);
};

/**
 * Sets the Coordinate Reference System.
 * @param value - eg. "http://www.opengis.net/def/crs/EPSG/0/27700"
 */
EarthServerGenericClient.Model_WCPSDemWCS.prototype.setCoordinateReferenceSystem = function(value)
{
    this.CRS = value;
};

/**
 * Creates the x3d geometry and appends it to the given root node. This is done automatically by the SceneManager.
 * @param root - X3D node to append the model.
 * @param cubeSizeX - Size of the fishtank/cube on the x-axis.
 * @param cubeSizeY - Size of the fishtank/cube on the y-axis.
 * @param cubeSizeZ - Size of the fishtank/cube on the z-axis.
 */
EarthServerGenericClient.Model_WCPSDemWCS.prototype.createModel=function(root, cubeSizeX, cubeSizeY, cubeSizeZ){
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
    if( this.coverageImage === undefined || this.coverageDEM === undefined || this.URLWCPS === undefined || this.URLDEM === undefined
        || this.minx === undefined || this.miny === undefined || this.maxx === undefined || this.maxy === undefined || this.CRS === undefined )
    {
        alert("Not all mandatory values are set. WCPSDemWCS: " + this.name );
        console.log(this);
        return;
    }

    //2: create wcps query
    //If no query was defined use standard query.
    if( this.WCPSQuery === undefined)
    {
        this.WCPSQuery =  "for i in (" + this.coverageImage + ") return encode ( { ";
        this.WCPSQuery += 'red: scale(trim(i.red, {x:"' + this.CRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.CRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + this.XResolution + '), y:"CRS:1"(0:' + this.ZResolution + ")}, {}); ";
        this.WCPSQuery += 'green: scale(trim(i.green, {x:"' + this.CRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.CRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + this.XResolution + '), y:"CRS:1"(0:' + this.ZResolution + ")}, {}); ";
        this.WCPSQuery += 'blue: scale(trim(i.blue, {x:"' + this.CRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.CRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + this.XResolution + '), y:"CRS:1"(0:' + this.ZResolution + ")}, {})";
        this.WCPSQuery += '}, "' + this.imageFormat +'" )';
    }
    else //A custom query was defined so use it
    {
        //Replace $ symbols with the actual values
        this.WCPSQuery = this.replaceSymbolsInString(this.WCPSQuery);
        console.log(this.WCPSQuery);
    }
    //3: Make ServerRequest and receive data.
    var bb = {
        minLongitude: this.miny,
        maxLongitude: this.maxy,
        minLatitude:  this.minx,
        maxLatitude:  this.maxx
    };
    EarthServerGenericClient.requestWCPSImageWCSDem(this,this.URLWCPS,this.WCPSQuery,this.URLDEM,this.coverageDEM,bb,this.WCSVersion);
};

/**
 * This is a callback method as soon as the ServerRequest in createModel() has received it's data.
 * This is done automatically.
 * @param data - Received data from the ServerRequest.
 */
EarthServerGenericClient.Model_WCPSDemWCS.prototype.receiveData= function( data)
{
    if( this.checkReceivedData(data))
    {
        //Remove the placeHolder
        this.removePlaceHolder();

        var YResolution = this.YResolution || (parseFloat(data.maxHMvalue) - parseFloat(data.minHMvalue) );
        var transform = this.createTransform(data.width,YResolution,data.height,parseFloat(data.minHMvalue));
        this.root.appendChild( transform);

        //Set transparency
        data.transparency = this.transparency;
        //Create Terrain out of the received data
        EarthServerGenericClient.MainScene.timeLogStart("Create Terrain " + this.name);
        this.terrain = new EarthServerGenericClient.LODTerrain(transform, data, this.index, this.noData, this.demNoData);
        this.terrain.createTerrain();
        EarthServerGenericClient.MainScene.timeLogEnd("Create Terrain " + this.name);
        this.elevationUpdateBinding();

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
EarthServerGenericClient.Model_WCPSDemWCS.prototype.setSpecificElement= function(element)
{
    EarthServerGenericClient.appendElevationSlider(element,this.index);
};