//Namespace
var EarthServerGenericClient = EarthServerGenericClient || {};

/**
 * @ignore <-- REMOVE ME FOR DOCUMENTATION
 * @class Scene Model: <Add Description>
 * <amount of service urls + coverages>
 * @augments EarthServerGenericClient.AbstractSceneModel
 */
EarthServerGenericClient.Model_Name = function()
{
    this.setDefaults();
    this.name = "Some Name";

    //Initialise variables her
    //this.var = 0;
};
EarthServerGenericClient.Model_Name.inheritsFrom( EarthServerGenericClient.AbstractSceneModel );

//A function for URL(s)
//EarthServerGenericClient.Model_Name.prototype.setURLs=function(URL1,..)

//A function for Coverage(s)
//EarthServerGenericClient.Model_Name.prototype.setCoverages = function (coverage1, ...)

//A function for Version(s)
//EarthServerGenericClient.Model_Name.prototype.setxxxVersion = function (version)

//Any additional functions
//EarthServerGenericClient.Model_Name.prototype.functionName = function(parameters)

/**
 * @ignore <-- REMOVE ME FOR DOCUMENTATION
 * Creates the x3d geometry and appends it to the given root node. This is done automatically by the SceneManager.
 * @param root - X3D node to append the model.
 * @param cubeSizeX - Size of the fishtank/cube on the x-axis.
 * @param cubeSizeY - Size of the fishtank/cube on the y-axis.
 * @param cubeSizeZ - Size of the fishtank/cube on the z-axis.
 */
EarthServerGenericClient.Model_Name.prototype.createModel=function(root,cubeSizeX, cubeSizeY, cubeSizeZ){
    if( root === undefined)
        alert("root is not defined");

    this.cubeSizeX = cubeSizeX;
    this.cubeSizeY = cubeSizeY;
    this.cubeSizeZ = cubeSizeZ;

    this.root = root;

    //Create Placeholder
    this.placeHolder = this.createPlaceHolder();
    this.root.appendChild( this.placeHolder );

    //1: Check if mandatory values are set
    /*if( this.var === undefined || ....)
    {
        alert("Not all mandatory values are set. ModuleDescription: " + this.name );
        console.log(this);
        return;
    }*/

    //2: Make ServerRequest
    /* Exmaple:
    EarthServerGenericClient.requestWMSImageWCSDem(this,bb,this.XResolution,this.ZResolution,
        this.URLWMS,this.coverageImage,this.WMSVersion,this.CRS,this.imageFormat,
        this.URLDEM,this.coverageDEM,this.WCSVersion);
        */
};

/**
 * @ignore <-- REMOVE ME FOR DOCUMENTATION
 * This is a callback method as soon as the ServerRequest in createModel() has received it's data.
 * This is done automatically.
 * @param data - Received data from the ServerRequest.
 */
EarthServerGenericClient.Model_Name.prototype.receiveData= function( data)
{
    if( this.checkReceivedData(data))
    {
        //Remove the placeHolder
        this.removePlaceHolder();

        var YResolution = (parseFloat(data.maxHMvalue) - parseFloat(data.minHMvalue) );
        var transform = this.createTransform(data.width,YResolution,data.height,parseFloat(data.minHMvalue));
        this.root.appendChild( transform);

        //Set transparency
        data.transparency = this.transparency;

        //Create Terrain out of the received data
        //Example LOD Terrain
        //this.terrain = new EarthServerGenericClient.LODTerrain(transform, data, this.index);
        //this.terrain.createTerrain();

    }
};


/**
 * @ignore <-- REMOVE ME FOR DOCUMENTATION
 * Every Scene Model creates it's own specific UI elements. This function is called automatically by the SceneManager.
 * @param element - The element where to append the specific UI elements for this model
 */
EarthServerGenericClient.Model_Name.prototype.setSpecificElement= function(element)
{
    //Example:
    //EarthServerGenericClient.appendElevationSlider(element,this.index);
};