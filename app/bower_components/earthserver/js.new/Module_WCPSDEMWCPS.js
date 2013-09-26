//Namespace
var EarthServerGenericClient = EarthServerGenericClient || {};

/**
 * @class Scene Model: WCPS Image with DEM from second WCPS Query
 * 2 URLs for the service, 2 Coverage names for the image and dem.
 * @augments EarthServerGenericClient.AbstractSceneModel
 */
EarthServerGenericClient.Model_WCPSDemWCPS = function()
{
    this.setDefaults();
    this.name = "WCPS Image with DEM from second WCPS Query.";
};
EarthServerGenericClient.Model_WCPSDemWCPS.inheritsFrom( EarthServerGenericClient.AbstractSceneModel );
/**
 * Sets the urls for both WCPS Queries. If only one url is given it is used for both requests.
 * @param imageURL - Service URL for the WCPS Image Request
 * @param demURL - Service URL for the WCPS Dem Request
 */
EarthServerGenericClient.Model_WCPSDemWCPS.prototype.setURLs=function(imageURL, demURL){
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
EarthServerGenericClient.Model_WCPSDemWCPS.prototype.setCoverages = function (coverageImage, coverageDem) {
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
EarthServerGenericClient.Model_WCPSDemWCPS.prototype.setWCPSImageQuery = function(querystring)
{
    /**
     * The custom WCPS image query.
     * @type {String}
     */
    this.WCPSImageQuery = String(querystring);
};

/**
 * Sets a custom query for the WCPS Dem request.
 * @param querystring - WCPS as a string.
 */
EarthServerGenericClient.Model_WCPSDemWCPS.prototype.setWCPSDemQuery = function(querystring)
{
    /**
     * The custom WCPS Dem query.
     * @type {String}
     */
    this.WCPSDemQuery = String(querystring);
};


/**
 * Sets the Coordinate Reference System.
 * @param value - eg. "http://www.opengis.net/def/crs/EPSG/0/27700"
 */
EarthServerGenericClient.Model_WCPSDemWCPS.prototype.setCoordinateReferenceSystem = function(value)
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
EarthServerGenericClient.Model_WCPSDemWCPS.prototype.createModel=function(root, cubeSizeX, cubeSizeY, cubeSizeZ){
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
        || this.minx === undefined || this.miny === undefined || this.maxx === undefined || this.maxy === undefined || this.CRS === undefined )
    {
        alert("Not all mandatory values are set. WCPSDemWCPS: " + this.name );
        console.log(this);
        return;
    }

    //2: create wcps queries
    //If no query was defined use standard query.
    if( this.WCPSImageQuery === undefined)
    {
        this.WCPSImageQuery =  "for i in (" + this.coverageImage + ") return encode ( { ";
        this.WCPSImageQuery += 'red: scale(trim(i.red, {x:"' + this.CRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.CRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + this.XResolution + '), y:"CRS:1"(0:' + this.ZResolution + ")}, {}); ";
        this.WCPSImageQuery += 'green: scale(trim(i.green, {x:"' + this.CRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.CRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + this.XResolution + '), y:"CRS:1"(0:' + this.ZResolution + ")}, {}); ";
        this.WCPSImageQuery += 'blue: scale(trim(i.blue, {x:"' + this.CRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.CRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + this.XResolution + '), y:"CRS:1"(0:' + this.ZResolution + ")}, {})";
        this.WCPSImageQuery += '}, "' + this.imageFormat +'" )';
    }
    else //A custom query was defined so use it
    {
        //Replace $ symbols with the actual values
        this.WCPSImageQuery = this.replaceSymbolsInString(this.WCPSImageQuery);
    }

    if( this.WCPSDemQuery === undefined)
    {
        var currentXRes = this.XResolution;
        var currentZRes = this.ZResolution;
        this.WCPSDemQuery =  "for dtm in (" + this.coverageDEM + ") return encode (";
        this.WCPSDemQuery += 'scale(trim(dtm , {x:"' + this.CRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.CRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + currentXRes + '), y:"CRS:1"(0:' + currentZRes + ")}, {})";
        this.WCPSDemQuery += ', "csv" )';
    }
    else //A custom query was defined so use it
    {
        //Replace $ symbols with the actual values
        this.WCPSDemQuery = this.replaceSymbolsInString(this.WCPSDemQuery);
    }

    EarthServerGenericClient.requestWCPSImageWCPSDem(this,this.imageURL,this.WCPSImageQuery,this.demURL,this.WCPSDemQuery);
};

/**
 * This is a callback method as soon as the ServerRequest in createModel() has received it's data.
 * This is done automatically.
 * @param data - Received data from the ServerRequest.
 */
EarthServerGenericClient.Model_WCPSDemWCPS.prototype.receiveData= function( data)
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
EarthServerGenericClient.Model_WCPSDemWCPS.prototype.setSpecificElement= function(element)
{
    EarthServerGenericClient.appendElevationSlider(element,this.index);
};
