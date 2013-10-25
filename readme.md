# DREAM-Client

The DREAM-Client focuses on creating a webclient for map applications, which allows easy customization through a centralized configuration concept.

## Technologies used

The application uses [Yeoman](http://yeoman.io/) which integrates:

* [Yo](https://github.com/yeoman/yo) : scaffolds out the application, writing the Grunt configuration and pulling in relevant Grunt tasks that you might need for your build.
* [Grunt](http://gruntjs.com/) : which allows building, previewing and testing the project
* [Bower](http://bower.io/) : which allows managing of dependencies and automatic download, thus making the application easily extendible.

## Libraries used

* [require](http://requirejs.org/)
* [Underscore](http://underscorejs.org/)
* [jQuery](http://jquery.com/)
* [Backbone](http://backbonejs.org/)
* [Backbone Marionette](http://marionettejs.com/)

## How to setup development environmet (on a Linux machine)

0.  Get the code from GitHub [DREAM Client repository](https://github.com/DREAM-ODA-OS/ODAClient):

    ```
    git clone git@github.com:DREAM-ODA-OS/ODAClient.git
    ```

    or

    ```
    git clone https://github.com/DREAM-ODA-OS/ODAClient.git
    ```

0.  Install development enviroment: 

    Make sure [Node.js](http://nodejs.org) and [NPM](https://npmjs.org) are installed
    on your machine and run:

    ```
    cd ./ODAClient
    sudo npm install -g grunt-cli
    sudo npm install -g bower 
    npm install 
    ```

    These commands install the needed Node.js packages. In case of any trouble try to use 
    reasonable recent version of Node.js. Also note that newer versions of Node.js contain 
    the NPM already bundled in the baseline installation. 

0.  Install client dependencies:  

    The required JavaScript frameworks can be installed by: 

    ```
    bower install
    ```

0.  Start the [Grunt](http://gruntjs.com/) development server:

    ```
    grunt server 
    ```

    and point your browser of port 9000 of your computer. 

If you managed to reach this the last step you can start to hack the code. 
The browser view refreshes itself automatically reflecting the code changes made. 


## How to deploy the server 

0.  Create deployment package: 

    ```
    grunt build
    ```

    This command creates `dist` directory containing the produced deployment 
    version. This directory should be then packed by some archiving tool (`zip`, `tar`, `cpio` ... etc.)
    creating the deployment package.

0.  Put the content of the deployment package to your server and make sure
    the web server can access the `index.html` file. 
