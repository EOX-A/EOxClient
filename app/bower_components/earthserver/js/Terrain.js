//Namespace
var EarthServerGenericClient = EarthServerGenericClient || {};

/**
 * @class Abstract base class for terrains.
 * @constructor
 */
EarthServerGenericClient.AbstractTerrain = function()
{
    /**
     * Stores the created appearances' names.
     * @type {Array}
     */
    var AppearanceDefined = [];

    /**
     * Stores the IDs of the materials to change the transparency.
     * @type {Array}
     */
    this.materialNodes = [];//Stores the IDs of the materials to change the transparency.

    /**
     * Creates a html canvas element out of the texture and removes the alpha values.
     * @param texture
     *      Texture to draw. Can be everything which can be rendered into a canvas.
     * @param index
     *      Index of the model using this canvas. Used to give the canvas a unique ID.
     * @returns {HTMLElement} The canvas element.
     */
    this.createCanvas = function(texture,index)
    {
        var canvasTexture = null;

        if( texture !== undefined)
        {
            canvasTexture = document.createElement('canvas');
            canvasTexture.style.display = "none";
            canvasTexture.setAttribute("id", "EarthServerGenericClient_Canvas"+index);
            canvasTexture.width = Math.pow(2, Math.round(Math.log(texture.width)/Math.log(2)));
            canvasTexture.height = Math.pow(2, Math.round(Math.log(texture.height)/Math.log(2)));

            var context = canvasTexture.getContext('2d');
            context.drawImage(texture, 0,0, canvasTexture.width, canvasTexture.height);

            var imageData = context.getImageData(0, 0, canvasTexture.width, canvasTexture.height);
            for (var i=0;i<imageData.data.length;i+=4)
            {
                imageData.data[i+3]=255;
            }
            context.putImageData(imageData,0,0);
        }
        else
        {   console.log("Could not create Canvas, response Texture is empty."); }

        return canvasTexture;
    };

    /**
     * Calcs the needed numbers of chunks for the terrain for a specific chunk size.
     * @param width
     *      Width of the entire terrain.
     * @param height
     *      Height of the entire terrain.
     * @param chunkSize
     *      The size of one chunk.
     * @returns {Object literal} numChunksX: number, numChunksY: number, numChunks: number
     */
    this.calcNumberOfChunks = function(width,height,chunkSize)
    {
        var chunksInfo = {
            numChunksX: parseInt(width/chunkSize),
            numChunksY: parseInt(height/chunkSize),
            numChunks: 0
        };

        if(width%chunkSize!==0)
        {   chunksInfo.numChunksX++;  }


        if(height%chunkSize!==0)
        {   chunksInfo.numChunksY++;  }

        chunksInfo.numChunks = parseInt(chunksInfo.numChunksY*chunksInfo.numChunksX);
        return chunksInfo;
    };

    /**
     * This function calcs the needed information to build and place a chunk of a terrain.
     * @param index
     *      Index of the model using the terrain. Used for creating IDs.
     * @param chunkSize
     *      The desired size (count of values) of one chunk per axis.
     * @param chunkInfo
     *      This parameter uses an object that will be returned by calcNumberOfChunks().
     *      It contains the information about a terrain and its chunks (e.g. number of chunks on each axis).
     * @param currentChunk
     *      The index of the current chunk to be build.
     * @param terrainWidth
     *      Width of the whole terrain. Used to calc texture coordinates.
     * @param terrainHeight
     *      Height of the whole terrain. Used to calc texture coordinates.
     * @returns {Object literal}
     *      xpos: number, ypos: number, chunkWidth: number,
     *      chunkHeight: number, terrainWidth: number,
     *      terrainHeight: number, ID: number, modelIndex: number
     */
    this.createChunkInfo = function(index,chunkSize,chunkInfo,currentChunk,terrainWidth,terrainHeight)
    {
        var info = {
            xpos:parseInt(currentChunk%chunkInfo.numChunksX)*(chunkSize-1),
            ypos:parseInt(currentChunk/chunkInfo.numChunksX)*(chunkSize-1),
            chunkWidth:0,
            chunkHeight:0,
            terrainWidth: terrainWidth,
            terrainHeight: terrainHeight,
            ID: currentChunk,
            modelIndex: index
        };

        if( currentChunk%chunkInfo.numChunksX === (chunkInfo.numChunksX-1) )
        {   info.chunkWidth = terrainWidth - parseInt((chunkInfo.numChunksX-1)*chunkSize);   }
        else
        {   info.chunkWidth = chunkSize;   }

        if( currentChunk >= chunkInfo.numChunks - chunkInfo.numChunksX)
        {   info.chunkHeight = terrainHeight - parseInt((chunkInfo.numChunksY-1)*chunkSize); }
        else
        {   info.chunkHeight = chunkSize  }

        return info;
    };

    /**
     * Returns a height map part from the given height map specified in the info parameter.
     * @param info
     *      Which part of the heightmap should be returned. In this case the parameter is an object literal
     *      and uses the following attributes: xpos: number, ypos: number, chunkWidth: number, chunkHeight: number
     * @param  hm
     *      The heightmap from which the parts is extracted.
     * @returns {Array}
     *      Returns a 2D Array, use it as follows Array[chunk height][chunk width].
     * @throws If any error occurs, the function will return null.
     */
    this.getHeightMap = function(info,hm)
    {
        try
        {
            var heightmapPart = new Array(info.chunkHeight);
            for(var i=0; i<info.chunkHeight; i++)
            {
                heightmapPart[i] = new Array(info.chunkWidth);
                for(var j=0; j<info.chunkWidth; j++)
                {
                    heightmapPart[i][j] = hm[info.xpos+j][info.ypos+i];
                }
            }
            return heightmapPart;
        }
        catch(error)
        {
            console.log('AbstractTerrain::getHeightMap(): ' + error);
            return null;
        }
    };

    /**
     * Collects all material nodes of the terrain and changes each transparency attribute.
     * @param value
     *      Transparency value between 0 (full visible) and 1 (invisible).
     */
    this.setTransparency = function(value)
    {
        for(var k=0;k<this.materialNodes.length;k++)
        {
            var mat =  document.getElementById(this.materialNodes[k]);
            if( mat !== null)
            {   mat.setAttribute("transparency",value); }
            else
            {   console.log("Material with ID " +this.materialNodes[k] + " not found.");    }
        }
    };

    /**
     * Deletes all saved material IDs. Use this function if you remove old material from the dom.
     * E.g. for ProgressiveTerrain.
     */
    this.clearMaterials = function()
    {
       this.materialNodes = [];
    };


    /**
     * This function handles the creation and usage of the appearances. It can be called for every shape or LOD that should use a canvasTexture.
     * It returns the amount of appearances specified. For every name only one appearance exits, every other uses it.
     * @param AppearanceName
     *      Name of the appearance. If this name is not set in the array, it will be registered.
     *      In the case the name is already set, the existing one will be used.
     * @param AppearanceCount
     *      Number of appearance to be created. E.g. the LODs use a bunch of three appearance nodes.
     * @param modelIndex
     *      Index of the model using this appearance.
     * @param canvasTexture
     *      Canvas element to be used in the appearance as texture.
     * @param transparency
     *      Transparency of the appearance.
     * @returns {Array}
     *      Array of appearance nodes.
     *      @throws If any error occurs, the function will return null.
     */
    this.getAppearances = function (AppearanceName, AppearanceCount, modelIndex, canvasTexture, transparency) {
        try {
            var appearances = [AppearanceCount];
            for (var i = 0; i < AppearanceCount; i++) {
                var appearance = document.createElement('Appearance');
                appearance.setAttribute('sortType', 'transparent');

                if (AppearanceDefined[AppearanceName] != undefined)//use the already defined appearance
                {
                    appearance.setAttribute("use", AppearanceDefined[AppearanceName]);
                }
                else    //create a new appearance with the given parameter
                {
                    AppearanceDefined[AppearanceName] = AppearanceName;
                    appearance.setAttribute("id", AppearanceDefined[AppearanceName]);
                    appearance.setAttribute("def", AppearanceDefined[AppearanceName]);

                    var texture = document.createElement('Texture');
                    texture.setAttribute('hideChildren', 'true');
                    texture.setAttribute("repeatS", 'true');
                    texture.setAttribute("repeatT", 'true');

                    texture.appendChild(canvasTexture);

                    var imageTransform = document.createElement('TextureTransform');
                    imageTransform.setAttribute("scale", "1,-1");

                    var material = document.createElement('material');
                    material.setAttribute("specularColor", "0.25,0.25,0.25");
                    material.setAttribute("diffuseColor", "1 1 1");
                    material.setAttribute('transparency', transparency);
                    material.setAttribute('ID',AppearanceName+"_mat");
                    //Save this material ID to change transparency during runtime
                   this.materialNodes.push( AppearanceName+"_mat");

                    appearance.appendChild(material);
                    appearance.appendChild(imageTransform);
                    appearance.appendChild(texture);

                    texture = null;
                    imageTransform = null;
                    material = null;
                }
                appearances[i] = appearance;
            }
            return appearances;
        }
        catch (error) {
            console.log('AbstractTerrain::getAppearances(): ' + error);
            return null;
        }
    };
};





/**
 * @class This terrain should receive multiple insertLevel calls. It removes the old version
 * and replace it with the new data. It can be used for progressive loading.
 * Example: WCPSDemAlpha with progressive loading using the progressiveWCPSImageLoader.
 *
 * @augments EarthServerGenericClient.AbstractTerrain
 * @param index
 *      Index of the model using this terrain.
 * @constructor
 */
EarthServerGenericClient.ProgressiveTerrain = function(index)
{
    /**
     * General information about the amount of chunks needed to build the terrain.
     * @type {Object}
     */
    var chunkInfo;
    /**
     * Size of one chunk. Chunks at the borders can be smaller.
     * 256*256 (2^16) is the max size because of only 16 bit indices.
     * @type {number}
     */
    var chunkSize = 256;
    /**
     * The canvas that holds the received image.
     * @type {HTMLElement}
     */
    var canvasTexture;
    /**
     * Counter of the inserted levels.
     * @type {number}
     */
    var currentData = 0;

    /**
     * Insert one data level into the scene. The old elevation grid will be removed and one new build.
     * @param root
     *      Dom Element to append the terrain to.
     * @param data
     *      Received Data of the Server request.
     */
    this.insertLevel = function(root,data)
    {
        canvasTexture = this.createCanvas(data.texture,index);
        chunkInfo     = this.calcNumberOfChunks(data.width,data.height,chunkSize);

        //Remove old Materials of the deleted children
        this.clearMaterials();

        for(var currentChunk=0; currentChunk< chunkInfo.numChunks; currentChunk++)
        {
            try
            {
                //Build all necessary information and values to create a chunk
                var info = this.createChunkInfo(index,chunkSize,chunkInfo,currentChunk,data.width,data.height);
                var hm = this.getHeightMap(info,data.heightmap);
                var appearance = this.getAppearances("TerrainApp_"+index+"_"+currentData,1,index,canvasTexture,data.transparency);

                var transform = document.createElement('Transform');
                transform.setAttribute("translation", info.xpos + " 0 " + info.ypos);
                transform.setAttribute("scale", "1.0 1.0 1.0");

                new ElevationGrid(transform,info, hm, appearance);

                root.appendChild(transform);

                //Delete vars avoid circular references
                info = null;
                hm = null;
                appearance = null;
                transform = null;
            }
            catch(error)
            {
                alert('Terrain::CreateNewChunk(): ' + error);
            }
        }
        currentData++;
        canvasTexture = null;
        chunkInfo = null;

        EarthServerGenericClient_MainScene.reportProgress(index);
    };
};
EarthServerGenericClient.ProgressiveTerrain.inheritsFrom( EarthServerGenericClient.AbstractTerrain);


/**
 * @class This terrain build up a LOD with 3 levels of the received data.
 * @param root
 *      Dom Element to append the terrain to.
 * @param data
 *      Received Data of the Server request.
 * @param index
 *      Index of the model that uses this terrain.
 * @augments EarthServerGenericClient.AbstractTerrain
 * @constructor
 */
EarthServerGenericClient.LODTerrain = function(root, data,index)
{
    /**
     * Distance to change between full and 1/2 resolution.
     * @type {number}
     */
    var lodRange1       = 2000;
    /**
     * Distance to change between 1/2 and 1/4 resolution.
     * @type {number}
     */
    var lodRange2       = 10000;

    /**
     * The canvas that holds the received image.
     * @type {HTMLElement}
     */
    var canvasTexture   = this.createCanvas( data.texture,index);
    /**
     * Size of one chunk. Chunks at the borders can be smaller.
     * We want to build 3 chunks for the LOD with different resolution but the same size on the screen.
     * With 253 values the length of the most detailed chunk is 252.
     * The second chunk has 127 values and the length of 126. With a scale of 2 it's back to the size of 252.
     * The third chunk has 64 values and the length if 63. With a scale of 4 it's also back to the size 252.
     * @type {number}
     */
    var chunkSize = 253;
    /**
     * General information about the number of chunks needed to build the terrain.
     * @type {number}
     */
    var chunkInfo       = this.calcNumberOfChunks(data.width,data.height,chunkSize);

    /**
     * Builds the terrain and appends into the scene.
     */
    this.createTerrain= function()
    {
        for(var currentChunk=0; currentChunk< chunkInfo.numChunks;currentChunk++)
        {
            try
            {
                //Build all necessary information and values to create a chunk
                var info = this.createChunkInfo(index,chunkSize,chunkInfo,currentChunk,data.width,data.height);
                var hm = this.getHeightMap(info,data.heightmap);
                var appearance = this.getAppearances("TerrainApp_"+index,3,index,canvasTexture,data.transparency);

                var transform = document.createElement('Transform');
                transform.setAttribute("translation", info.xpos + " 0 " + info.ypos);
                transform.setAttribute("scale", "1.0 1.0 1.0");

                var lodNode = document.createElement('LOD');
                lodNode.setAttribute("Range", lodRange1 + ',' + lodRange2);
                lodNode.setAttribute("id", 'lod' + info.ID);

                new ElevationGrid(lodNode,info, hm, appearance);
                transform.appendChild(lodNode);
                root.appendChild(transform);

                //Delete vars avoid circular references
                info = null;
                hm = null;
                appearance = null;
                transform = null;
                lodNode = null;
            }
            catch(error)
            {
                alert('Terrain::CreateNewChunk(): ' + error);
            }
        }
        canvasTexture = null;
        chunkInfo = null;

        EarthServerGenericClient_MainScene.reportProgress(index);
    };
};
EarthServerGenericClient.LODTerrain.inheritsFrom( EarthServerGenericClient.AbstractTerrain);