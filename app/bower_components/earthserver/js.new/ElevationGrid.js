/**
 * @class Builds one elevation grid chunk. It can consists of several elevation grids to be used in a LOD.
 * For every appearance in the appearances parameter one level is built with 25% size of the last level.
 * @param parentNode - Dom element to append the elevation grids to.
 * @param info - Information about the ID,position of the chunk, the height map's size and the modelIndex.
 * @param hf - The height map to be used for the elevation grid.
 * @param appearances - Array of appearances. For every appearance one level for LOD is built. 1 Level = no LOD.
 * @constructor
 */
function ElevationGrid(parentNode,info, hf,appearances)
{
    /**
     * Creates and inserts elevation grid (terrain chunk) into the DOM.
     */
    function setupChunk()
    {

        try
        {
            var elevationGrid, shape, shf;

            // We build one level of a LOD for every appearance. Example: With 3 children means: [Full Resolution, 1/2 Resolution, 1/4 Resolution]
            for(var i=0; i<appearances.length; i++)
            {
                // All none full resolutions needs to be one element bigger to keep the desired length
                var add = 0;
                if(i !== 0)
                { add = 1;  }

                // Set up: Shape-> Appearance -> ImageTexture +  Texturetransform
                shape = document.createElement('Shape');
                shape.setAttribute("id",info.modelIndex+"_shape_"+info.ID+"_"+i);

                // Build the Elevation Grids
                // shrink the heightfield to the correct size for this detail level
                shf = shrinkHeightMap(hf, info.chunkWidth, info.chunkHeight,Math.pow(2,i));
                elevationGrid = document.createElement('ElevationGrid');
                elevationGrid.setAttribute("id", info.modelIndex+"hm"+ info.ID+"_"+i);
                elevationGrid.setAttribute("solid", "false");
                elevationGrid.setAttribute("xSpacing", String(parseInt(Math.pow(2,i))));// To keep the same size with fewer elements increase the space of one element
                elevationGrid.setAttribute("zSpacing", String(parseInt(Math.pow(2,i))));
                elevationGrid.setAttribute("xDimension", String(info.chunkWidth/Math.pow(2,i)+add));// fewer elements in every step
                elevationGrid.setAttribute("zDimension", String(info.chunkHeight/Math.pow(2,i)+add));
                elevationGrid.setAttribute("height", shf );
                elevationGrid.appendChild(calcTexCoords(info.xpos, info.ypos, info.chunkWidth, info.chunkHeight, info.terrainWidth, info.terrainHeight,Math.pow(2,i)));

                shape.appendChild(appearances[i]);
                shape.appendChild(elevationGrid);

                parentNode.appendChild(shape);

                // set vars null
                shf = null;
                shape = null;
                elevationGrid = null;
            }
            hf = null;
            parentNode = null;
            info = null;
            appearances = null;
        }
        catch(error)
        {
            alert('ElevationGrid::setupChunk(): ' + error);
        }
    }

    /**
     * Shrinks the heightfield with the given factor
     * @param heightfield - The used heihgfield.
     * @param sizex - Width of the heightfield.
     * @param sizey - Height of the heightfield.
     * @param shrinkfactor - Factor to shrink the heightmap. 1:Full heightmap 2: 25% (scaled 50% on each side)
     * @returns {string}
     */
    function shrinkHeightMap(heightfield, sizex, sizey, shrinkfactor)
    {
        var smallGrid, smallx, smally, val,i,k,l,o,div;

        smallGrid = [];
        smallx = parseInt(sizex/shrinkfactor);
        smally = parseInt(sizey/shrinkfactor);
        //IF shrunk, the heightfield needs one more element than the desired length (63 elements for a length of 62)
        if( shrinkfactor !== 1)
        {
            smallx++;
            smally++;
            div=shrinkfactor*shrinkfactor;

            for(i=0; i<smally; i++)
            {
                var i_sf = (i*shrinkfactor);

                for(k=0; k<smallx; k++)
                {
                    var k_sf = (k*shrinkfactor);
                    val = 0;
                    for(l=0; l<shrinkfactor; l++)
                    {
                        for(o=0; o<shrinkfactor; o++)
                        {
                            var x = k_sf + l;
                            var y = i_sf + o;
                            if(x >= sizex) x = sizex -1;
                            if(y >= sizey) y = sizey -1;
                            var tmp = heightfield[y][x];
                            val = val + parseFloat(tmp);
                        }
                    }
                    val = val/div;
                    smallGrid.push(val+ " ");
                }
            }
        }
        else
        {
            for(i=0; i<smally; i++)
            {
                for(k=0; k<smallx; k++)
                {
                    val = parseFloat( heightfield[i][k]);
                    smallGrid.push(val+" ");
                }
            }
        }
        return smallGrid.join(" ");
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