/**
 * @class Builds one grid that contains gaps (NODATA zones) into a chunk.
 * @param parentNode - Dom element to append the gap grid to.
 * @param info - Information about the ID,position of the chunk, the height map's size and the modelIndex.
 * @param hf - The height map to be used for the elevation grid.
 * @param appearances - Appearances for the Gap Grid.
 * @param NODATA - The NODATA value. Parts with this values are left as a gap in the grid.
 * @constructor
 */
function GapGrid(parentNode,info, hf,appearances,NODATA)
{
    /**
     * Creates and inserts elevation grid (terrain chunk) into the DOM.
     */
    function setupChunk()
    {

        try
        {
            var grid, shape, coords, coordsNode;

            shape = document.createElement('Shape');
            shape.setAttribute("id",info.modelIndex+"_shape_"+info.ID+"_"+0);

            coords = buildCoordinates(hf, info.chunkWidth, info.chunkHeight,NODATA);
            coordsNode = document.createElement('Coordinate');
            coordsNode.setAttribute("point", coords.coords);

            grid = document.createElement('IndexedFaceSet');
            grid.setAttribute("id", info.modelIndex+"hm"+ info.ID+"_"+0);
            grid.setAttribute("solid", "false");
            grid.setAttribute("colorPerVertex", "false");

            grid.setAttribute("creaseAngle", "0.01");
            grid.setAttribute("ccw", "true");

            grid.setAttribute("coordIndex", coords.index);
            grid.appendChild( coordsNode );
            grid.appendChild(calcTexCoords(info.xpos, info.ypos, info.chunkWidth, info.chunkHeight, info.terrainWidth, info.terrainHeight,Math.pow(2,0)));

            shape.appendChild(appearances[0]);
            shape.appendChild(grid);

            parentNode.appendChild(shape);

            // set vars null
            coords = null;
            coordsNode = null;
            shape = null;
            grid = null;

            hf = null;
            parentNode = null;
            info = null;
            appearances = null;
        }
        catch(error)
        {
            alert('GapGrid::setupChunk(): ' + error);
        }
    }

    /**
     * Shrinks the heightfield with the given factor
     * @param heightfield - The used heihgfield.
     * @param sizex - Width of the heightfield.
     * @param sizey - Height of the heightfield.
     * @param NODATA - The value that a considered as NODATA available and shall be left as a gap
     * @returns {Object}
     */
    function buildCoordinates(heightfield, sizex, sizey, NODATA)
    {
        var coords = {};
        coords.coords = [];
        coords.index  = [];

        // add the coords
        for(var o=0; o< sizey; o++)
        {
            for(var j=0; j<sizex; j++)
            {
                coords.coords.push(""+ j + " " + heightfield[o][j] + " " + o + " ");
            }
        }

        for(var i=0; i+1< sizey; i++)
        {
            for(var k=0; k+1<sizex; k++)
            {
                // check if NONE of the four vertices used for this face as a NODATA value
                if( heightfield[i][k] !== NODATA && heightfield[i+1][k] !== NODATA
                     && heightfield[i+1][k+1] !== NODATA && heightfield[i][k+1] !== NODATA)
                {
                    // add indices
                    coords.index.push( (i*sizex)+k );
                    coords.index.push( ((i*sizex)+1)+k );
                    coords.index.push( (((i+1)*sizex)+1)+k );
                    coords.index.push( ((i+1)*sizex)+k );

                    coords.index.push( -1 );
                }
            }
        }

        return coords;
    }


    /**
     * Calcs the TextureCoordinates for the elevation grid(s).
     * Use the values of the full/most detailed version if using for LOD and adjust only the shrinkfactor parameter.
     * @param xpos - Start position of the elevation grid within the terrain.
     * @param ypos - Start position of the elevation grid within the terrain.
     * @param sizex - Size of the elevation grid on the x-Axis.
     * @param sizey - Size of the elevation grid on the x-Axis.
     * @param terrainWidth - Size of the whole terrain on the x-Axis.
     * @param terrainHeight - Size of the whole terrain on the y-Axis.
     * @param shrinkfactor - The factor the heightmap this TextureCoordinates are was shrunk.
     * @returns {HTMLElement} - X3DOM TextureCoordinate Node.
     */
    function calcTexCoords(xpos,ypos,sizex,sizey,terrainWidth, terrainHeight, shrinkfactor)
    {
        var tmpx, tmpy;

        var smallx = parseInt(sizex/shrinkfactor);
        var smally = parseInt(sizey/shrinkfactor);

        if( shrinkfactor !== 1)
        {
            smallx++;
            smally++;
        }

        var buffer = [];
        //Create Node
        var tcnode = document.createElement("TextureCoordinate");

        //File string
        for (var i = 0; i < smally; i++)
        {
            for (var k = 0; k < smallx; k++)
            {
                tmpx = parseFloat((xpos+(k*shrinkfactor))/(terrainWidth-1));
                tmpy = parseFloat((ypos+(i*shrinkfactor))/(terrainHeight-1));

                buffer.push(tmpx + " ");
                buffer.push(tmpy + " ");
            }
        }
        var tc = buffer.join("");

        tcnode.setAttribute("point", tc);

        return tcnode;
    }

    setupChunk();
}