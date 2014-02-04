(function() {
  'use strict';

  // Helper collection to keep maintain data of coverage set
  var EOCoverageSet = Backbone.Collection.extend({
    fetch: function(options) {
      options || (options = {});
      options.dataType = "xml";
      return Backbone.Collection.prototype.fetch.call(this, options);
    },
    parse: function(response) {
      return WCS.Core.Parse.parse(response).coverageDescriptions;
    },
  });

  var root = this;
  root.define([
    'backbone',
    'communicator',
    'globals',
    'models/DownloadModel',
    'hbs!tmpl/Download',
    'hbs!tmpl/SelectCoverageListItem',
    'hbs!tmpl/CoverageInfo',
    'hbs!tmpl/CoverageDownloadPost',
    'underscore'
  ],
  function( Backbone, Communicator, globals, m, DownloadTmpl,
   SelectCoverageListItemTmpl, CoverageInfoTmpl,CoverageDownloadPostTmpl) {

    var DownloadView = Backbone.Marionette.ItemView.extend({
      tagName: "div",
      id: "modal-start-download",
      className: "panel panel-default download",
      template: {
          type: 'handlebars',
          template: DownloadTmpl
      },

      modelEvents: {
        "reset": "onCoveragesReset"
      },

      events: {
        "click #btn-select-all-coverages": "onSelectAllCoveragesClicked",
        "click #btn-invert-coverage-selection": "onInvertCoverageSelectionClicked",
        'change input[type="checkbox"]': "onCoverageSelected",
        "click #btn-start-download": "onStartDownloadClicked"
      },

      initialize: function(options) {

        this.coverages = new Backbone.Collection([]);

      },
      onShow: function(view){

        this.listenTo(this.coverages, "reset", this.onCoveragesReset);
        this.$('.close').on("click", _.bind(this.onClose, this));
        this.$el.draggable({ 
          containment: "#content",
          scroll: false,
          handle: '.panel-heading'
        });

        var $downloadList = this.$("#download-list");
        $downloadList.children().remove();

        var coverageSets = [];
        var WCScoverages = [];


        _.each(this.model.get('products'), function(product, key) {

          var options = {};

          if(product.get('timeSlider')){
            options = {
                subsetTime: [
                  getISODateTimeString(this.model.get("ToI").start),
                  getISODateTimeString(this.model.get("ToI").end)
                ]
            };
          } //TODO: Check what to set if timeslider not activated

          options.subsetCRS = "http://www.opengis.net/def/crs/EPSG/0/4326";
          var bbox = this.model.get("AoI").getBounds();
          options.subsetX = [bbox.left, bbox.right];
          options.subsetY = [bbox.bottom, bbox.top];


          switch (product.get('download').protocol) {
            case 'EOWCS':
              var set = new EOCoverageSet([]);
              

              set.url = WCS.EO.KVP.describeEOCoverageSetURL(product.get('download').url, key, options);
              coverageSets.push(set);

              break;

            case 'WCS':

              var wcsurl = WCS.Core.KVP.getCoverageURL(product.get('download').url, key, options);
              console.log(key);
              WCScoverages.push(
                new Backbone.Model({
                  coverageId: key,
                  url: wcsurl
                })
              );

              break;
          }


        }, this);


        // dispatch WCS DescribeEOCoverageSet requests
        var deferreds = _.invoke(coverageSets, "fetch");

        $.when.apply($, deferreds).done(_.bind(function() {


          _.each(coverageSets, function(set) {
            set.each(function(model) {
              model.set("url", set.url)
            });
          });

          var coverage = _.flatten(_.pluck(coverageSets, "models"));
          coverage = coverage.concat(WCScoverages);
          //_.flatten(coverage, true);
          console.log(WCScoverages);
          console.log(coverage);
          this.coverages.reset(coverage);
        }, this));
      },

      onSelectAllCoveragesClicked: function() {
        // select all coverages
        this.$('input[type="checkbox"]').prop("checked", true).trigger("change");
      },

      onInvertCoverageSelectionClicked: function() {
        this.$('input[type="checkbox"]').each(function() {
          var $this = $(this);
          $this.prop("checked", !$this.is(":checked")).trigger("change");
        });
      },

      onCoveragesReset: function() {
        var $downloadList = this.$("#download-list");

        this.coverages.each(function(coverage) {
          var coverageJSON = coverage.toJSON();
          var $html = $(SelectCoverageListItemTmpl(coverageJSON));
          $downloadList.append($html);
          $html.find("i").popover({
            trigger: "hover",
            html: true,
            content: CoverageInfoTmpl(coverageJSON),
            title: "Coverage Description",
            placement: "bottom"
          });
        }, this);
      },

      onCoverageSelected: function() {
        // check that at least one coverage was selected
        if (this.$("input:checked").length) {
          this.$("#btn-start-download").removeAttr("disabled");
        }
        else {
          this.$("#btn-start-download").attr("disabled", "disabled");
        }
      },

      onStartDownloadClicked: function() {
        // for each selected coverage start a download
        var $downloads = $("#div-downloads"),
            options = {};

        var bbox = this.model.get("AoI").getBounds();
        options.subsetX = [bbox.left, bbox.right];
        options.subsetY = [bbox.bottom, bbox.top];

        // format + outputcrs
        options.format = this.$("#select-output-format").val();
        options.outputCRS = this.$("#select-output-crs").val();

        // apply mask parameter if polygon is not a square
        // (described by 5 points, first and last the same)
        var components = this.model.get("AoI").components[0].components;
        if(components.length>5){
          var coords = [];
          _.each(components, function(point) {
            coords.push(point.x);
            coords.push(point.y);
          });
          options.mask = coords.join(" ");
        }


        this.$('input[type="checkbox"]').each(_.bind(function(index) {
          if ($('input[type="checkbox"]')[index].checked){
            var model = this.coverages.models[index];
            var xml = getCoverageXML(model.get('coverageId'), options);
            var owsUrl = model.get('url').split('?')[0] + '?';
            var xmlData = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>' + xml;


            var xhr = new XMLHttpRequest();
            xhr.open('POST', owsUrl, true);
            xhr.responseType = "blob";
            xhr.onprogress=this.updateProgress;
            xhr.onreadystatechange = function () {

              if (xhr.readyState == 2) {
                $("<div id='downloadDialog'>The requested file is being downloaded, please wait until the save dialog appears."+
                  "<div id='myProgressBar'></div> </div>").dialog({
                  dialogClass: "no-close",
                  title: "Download Status",
                  height: 150,
                  width: 500,
                  autoOpen:true
                });
                if(xhr.getResponseHeader('Content-Length'))
                  $("#myProgressBar").progressbar({value:0});
                else
                  $("#myProgressBar").append(
                    '<div style="margin-left:auto;margin-right:auto;text-align:center">'+
                    '<i class="fa fa-cog fa-spin fa-2x" ></i></div>');
              }

              if (xhr.readyState == 4) {

                if(xhr.response.size < 700) {
                  $("#error-messages").append(
                      '<div class="alert alert-warning alert-danger">'+
                      '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+
                      '<strong>Warning!</strong> The selected Area of Interest exceeds the defined size limit configured on the server' +
                    '</div>'
                  );
                }
                else {
                  var filename = xhr.getResponseHeader('Content-Disposition');
                  if(filename)
                    filename = filename.split("=")[1];
                  else
                    filename = "coverage.tif";
                  var contentType = 'image/tif';
                  var file = new Blob([xhr.response], {type: contentType});
                  var a = document.createElement('a'),
                  ev = document.createEvent("MouseEvents");
                  a.download = filename;
                  a.href = window.URL.createObjectURL(file);
                  ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0,
                          false, false, false, false, 0, null);
                  a.dispatchEvent(ev);
                }
                 $("#downloadDialog").remove();
              }
            };  

            xhr.send(xmlData);
          }
        }, this));
      },

      onClose: function() {
        Communicator.mediator.trigger("ui:close", "download");
        this.close();
      },

      updateProgress: function(evt) 
            {
               if (evt.lengthComputable) 
               {  //evt.loaded the bytes browser receive
                  //evt.total the total bytes seted by the header
                  //
                 var percentComplete = (evt.loaded / evt.total)*100;  
                 $("#myProgressBar .ui-progressbar-value").animate({width: percentComplete+"%"}, 500);
               } 
            }  

    });
    return {'DownloadView':DownloadView};
  });
}).call( this );
