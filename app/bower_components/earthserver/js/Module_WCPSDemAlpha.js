//Namespace
var EarthServerGenericClient = EarthServerGenericClient || {};

/**
 * @class Scene Model: WCPS Image with DEM in Alpha Channel
 * 1 URL for the service, 2 Coverage names for the image and dem.
 * @augments EarthServerGenericClient.AbstractSceneModel
 */
EarthServerGenericClient.Model_WCPSDemAlpha = function()
{
    this.setDefaults();
    this.name = "WCPS Image with DEM in alpha channel.";
    /**
     * Determines if progressive or complete loading of the model is used.
     * @default false
     * @type {Boolean}
     */
    this.progressiveLoading = false;

    /**
     * The custom or default WCPS Queries. The array contains either one element for complete loading
     * or multiple (3) queries for progressive loading of the model.
     * @type {Array}
     */
    this.WCPSQuery  = [];
};
EarthServerGenericClient.Model_WCPSDemAlpha.inheritsFrom( EarthServerGenericClient.AbstractSceneModel );
/**
 * Enables/Disables the progressive loading of the model.
 * @param value - True or False
 */
EarthServerGenericClient.Model_WCPSDemAlpha.prototype.setProgressiveLoading=function(value){
    this.progressiveLoading = value;

    //Progressive Loading creates 3 requests while normal loading 1
    if( this.progressiveLoading){ this.requests = 3; }
    else{   this.requests = 1;  }
};
/**
 * Sets the URL for the service.
 * @param url
 */
EarthServerGenericClient.Model_WCPSDemAlpha.prototype.setURL=function(url){
    /**
     * URL for the WCPS service.
     * @type {String}
     */
    this.URLWCPS = String(url);
};
/**
 * Sets both coverage names.
 * @param coverageImage - Coverage name for the image data set.
 * @param coverageDem   - Coverage name for the dem data set.
 */
EarthServerGenericClient.Model_WCPSDemAlpha.prototype.setCoverages = function (coverageImage, coverageDem) {
    /**
     * Name of the image coverage.
     * @type {String}
     */
    this.coverageImage = String(coverageImage);
    /**
     * name of the dem coverage.
     * @type {String}
     */
    this.coverageDEM = String(coverageDem);
};
/**
 * Sets a specific querystring for the RED channel of the WCPS query.
 * All red,blue,green and alpha has to be set, otherwise the standard query will be used.
 * @param querystring - the querystring. Use $CI (coverageImage), $CD (coverageDEM),
 * $MINX,$MINY,$MAXX,$MAXY(AoI) and $RESX,ResZ (Resolution) for automatic replacement.
 * Examples: $CI.red , x($MINX:$MINY)
 */
EarthServerGenericClient.Model_WCPSDemAlpha.prototype.setWCPSForChannelRED = function(querystring)
{
    this.WCPSQuery[0] = querystring;
};
/**
 * Sets a specific querystring for the GREEN channel of the WCPS query.
 * All red,blue,green and alpha has to be set, otherwise the standard query will be used.
 * @param querystring - the querystring. Use $CI (coverageImage), $CD (coverageDEM),
 * $MINX,$MINY,$MAXX,$MAXY(AoI) and $RESX,ResZ (Resolution) for automatic replacement.
 * Examples: $CI.red , x($MINX:$MINY)
 */
EarthServerGenericClient.Model_WCPSDemAlpha.prototype.setWCPSForChannelGREEN = function(querystring)
{
    this.WCPSQuery[1] = querystring;
};
/**
 * Sets a specific querystring for the BLUE channel of the WCPS query.
 * All red,blue,green and alpha has to be set, otherwise the standard query will be used.
 * @param querystring - the querystring. Use $CI (coverageImage), $CD (coverageDEM),
 * $MINX,$MINY,$MAXX,$MAXY(AoI) and $RESX,ResZ (Resolution) for automatic replacement.
 * Examples: $CI.red , x($MINX:$MINY)
 */
EarthServerGenericClient.Model_WCPSDemAlpha.prototype.setWCPSForChannelBLUE = function(querystring)
{
    this.WCPSQuery[2] = querystring;
};
/**
 * Sets a specific querystring for the ALPHA channel of the WCPS query.
 * All red,blue,green and alpha has to be set, otherwise the standard query will be used.
 * @param querystring - the querystring. Use $CI (coverageImage), $CD (coverageDEM),
 * $MINX,$MINY,$MAXX,$MAXY(AoI) and $RESX,ResZ (Resolution) for automatic replacement.
 * Examples: $CI.red , x($MINX:$MINY)
 */
EarthServerGenericClient.Model_WCPSDemAlpha.prototype.setWCPSForChannelALPHA = function(querystring)
{
    this.WCPSQuery[3] = querystring;
};

/**
 * Sets the Coordinate Reference System.
 * @param value - eg. "http://www.opengis.net/def/crs/EPSG/0/27700"
*/
EarthServerGenericClient.Model_WCPSDemAlpha.prototype.setCoordinateReferenceSystem = function(value)
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
EarthServerGenericClient.Model_WCPSDemAlpha.prototype.createModel=function(root, cubeSizeX, cubeSizeY, cubeSizeZ){
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
    if( this.coverageImage === undefined || this.coverageDEM === undefined || this.URLWCPS === undefined || this.CRS === undefined
        || this.minx === undefined || this.miny === undefined || this.maxx === undefined || this.maxy === undefined )
    {
        alert("Not all mandatory values are set. WCPSDemAlpha: " + this.name );
        console.log(this);
        return;
    }

    //2: create wcps query/queries
    //Either the user query if all query strings are set. Or standard wcps query if wcps channels are not set.
    //Build one query for complete loading and multiple queries for progressive loading

    //IF something is not defined use standard query.
    if( this.WCPSQuery[0] === undefined || this.WCPSQuery[1] === undefined || this.WCPSQuery[2] === undefined || this.WCPSQuery[3] === undefined)
    {
        for(var i=0; i<this.requests; i++)
        {
            var currentXRes = parseInt(this.XResolution / Math.pow(2,i) );
            var currentZRes = parseInt(this.ZResolution / Math.pow(2,i) );
            this.WCPSQuery[i] =  "for i in (" + this.coverageImage + "), dtm in (" + this.coverageDEM + ") return encode ( { ";
            this.WCPSQuery[i] += 'red: scale(trim(i.red, {x:"' + this.CRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.CRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + currentXRes + '), y:"CRS:1"(0:' + currentZRes + ")}, {}); ";
            this.WCPSQuery[i] += 'green: scale(trim(i.green, {x:"' + this.CRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.CRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + currentXRes + '), y:"CRS:1"(0:' + currentZRes + ")}, {}); ";
            this.WCPSQuery[i] += 'blue: scale(trim(i.blue, {x:"' + this.CRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.CRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + currentXRes + '), y:"CRS:1"(0:' + currentZRes + ")}, {});";
            this.WCPSQuery[i] += 'alpha: (char) (((scale(trim(dtm , {x:"' + this.CRS + '"(' + this.minx + ":" +  this.maxx + '), y:"' + this.CRS + '"(' + this.miny + ":" + this.maxy + ') }), {x:"CRS:1"(0:' + currentXRes + '), y:"CRS:1"(0:' + currentZRes + ")}, {})) / 1349) * 255)";
            this.WCPSQuery[i] += '}, "' + this.imageFormat +'" )';
        }
    }
    else //ALL set so use custom query
    {
        //Create multiple queries if progressive loading is set or one if not.
        for(var j=0; j<this.requests; j++)
        {
            //Replace $ symbols with the actual values
            var tmpString = [];
            for(i=0; i<4; i++)
            {
                tmpString[i] = EarthServerGenericClient.replaceAllFindsInString(this.WCPSQuery[i],"$CI","image");
                tmpString[i] = EarthServerGenericClient.replaceAllFindsInString(tmpString[i],"$CD","dtm");
                tmpString[i] = EarthServerGenericClient.replaceAllFindsInString(tmpString[i],"$MINX",this.minx);
                tmpString[i] = EarthServerGenericClient.replaceAllFindsInString(tmpString[i],"$MINY",this.miny);
                tmpString[i] = EarthServerGenericClient.replaceAllFindsInString(tmpString[i],"$MAXX",this.maxx);
                tmpString[i] = EarthServerGenericClient.replaceAllFindsInString(tmpString[i],"$MAXY",this.maxy);
                tmpString[i] = EarthServerGenericClient.replaceAllFindsInString(tmpString[i],"$CRS" ,'"' + this.CRS + '"');
                tmpString[i] = EarthServerGenericClient.replaceAllFindsInString(tmpString[i],"$RESX",parseInt(this.XResolution / Math.pow(2,j) ) );
                tmpString[i] = EarthServerGenericClient.replaceAllFindsInString(tmpString[i],"$RESZ",parseInt(this.ZResolution / Math.pow(2,j) ) );
            }
            this.WCPSQuery[j] =  "for image in (" + this.coverageImage + "), dtm in (" + this.coverageDEM + ") return encode ( { ";
            this.WCPSQuery[j] += "red: " + tmpString[0] + " ";
            this.WCPSQuery[j] += "green: " + tmpString[1]+ " ";
            this.WCPSQuery[j] += "blue: " + tmpString[2] + " ";
            this.WCPSQuery[j] += "alpha: " + tmpString[3];
            this.WCPSQuery[j] += '}, "' + this.imageFormat +'" )';
        }
    }

    //3: Make ServerRequest and receive data.
    if( !this.progressiveLoading)
    {   EarthServerGenericClient.requestWCPSImageAlphaDem(this,this.URLWCPS,this.WCPSQuery[0]);  }
    else
    {   EarthServerGenericClient.progressiveWCPSImageLoader(this,this.URLWCPS,this.WCPSQuery,true);   }
};
/**
 * This is a callback method as soon as the ServerRequest in createModel() has received it's data.
 * This is done automatically.
 * @param data - Received data from the ServerRequest.
 */
EarthServerGenericClient.Model_WCPSDemAlpha.prototype.receiveData = function( data)
{
    if( this.checkReceivedData(data))
    {
        //If progressive loading is enabled this function is called multiple times.
        //The lower resolution version shall be removed and replaced with the new one.
        //So the old transformNode will be removed and a new one created.
        if(this.transformNode !== undefined )
        {   this.root.removeChild(this.transformNode); }

        //In the first receiveData call remove the placeholder.
        this.removePlaceHolder();

        var YResolution = this.YResolution || (parseFloat(data.maxHMvalue) - parseFloat(data.minHMvalue) );
        this.transformNode = this.createTransform(data.width,YResolution,data.height,parseFloat(data.minHMvalue));
        this.root.appendChild(this.transformNode);

        //Set transparency
        data.transparency =  this.transparency;

        //Create Terrain out of the received data
        if( !this.progressiveLoading)
        {
            EarthServerGenericClient.MainScene.timeLogStart("Create Terrain " + this.name);
            this.terrain = new EarthServerGenericClient.LODTerrain(this.transformNode, data, this.index, this.noData, this.demNoData);
            this.terrain.createTerrain();
            EarthServerGenericClient.MainScene.timeLogEnd("Create Terrain " + this.name);
            this.elevationUpdateBinding();
            if(this.sidePanels)
            {   this.terrain.createSidePanels(this.transformNode,1);    }
            EarthServerGenericClient.MainScene.timeLogEnd("Create Model " + this.name);
        }
        else
        {
            //Check if terrain is already created. Create it in the first function call.
            if( this.terrain === undefined )
            {   this.terrain = new EarthServerGenericClient.ProgressiveTerrain(this.index); }

            //Add new data (with higher resolution) to the terrain
            EarthServerGenericClient.MainScene.timeLogStart("Create Terrain " + this.name);
            this.terrain.insertLevel(this.transformNode,data,this.noData, this.demNoData);
            this.elevationUpdateBinding();
            if(this.sidePanels)
            {   this.terrain.createSidePanels(this.transformNode,1);    }
            EarthServerGenericClient.MainScene.timeLogEnd("Create Terrain " + this.name);

            if( this.receivedDataCount === this.requests)
            {   EarthServerGenericClient.MainScene.timeLogEnd("Create Model " + this.name);   }
        }

        //Delete transformNode when the last response call is done.
        //Until that the pointer is needed to delete the old terrain just before the new terrain is build.
        if( this.receivedDataCount === this.requests )
        {   this.transformNode = null;  }
    }
};

/**
 * Every Scene Model creates it's own specific UI elements. This function is called automatically by the SceneManager.
 * @param element - The element where to append the specific UI elements for this model.
 */
EarthServerGenericClient.Model_WCPSDemAlpha.prototype.setSpecificElement= function(element)
{
    EarthServerGenericClient.appendElevationSlider(element,this.index);
};