(function() {
  'use strict';

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
      className: "well download",
      template: {
          type: 'handlebars',
          template: DownloadTmpl
      },

      modelEvents: {
        //"change": "onModelChange",
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
        this.$el.draggable({ containment: "#content" , scroll: false});
        
        var $downloadList = this.$("#download-list");
        $downloadList.children().remove();

        var options = {
            subsetTime: [
              getISODateTimeString(this.model.get("ToI").start), 
              getISODateTimeString(this.model.get("ToI").end)
            ]
        };
        
        options.subsetCRS = "http://www.opengis.net/def/crs/EPSG/0/4326";
        var bbox = this.model.get("AoI");
        options.subsetX = [bbox.left, bbox.right];
        options.subsetY = [bbox.bottom, bbox.top];
        
        var coverageSets = _.map(this.model.get('products'), function(product, key) {
          var set = new EOCoverageSet([]);
          set.url = WCS.EO.KVP.describeEOCoverageSetURL(product.get('urls')[0], key, options);
          return set;
        }, this);
        
        // dispatch WCS DescribeEOCoverageSet requests
        var deferreds = _.invoke(coverageSets, "fetch");
        
        $.when.apply($, deferreds).done(_.bind(function() {
          this.coverages.reset(_.flatten(_.pluck(coverageSets, "models")));
        }, this));
      },

      onSelectAllCoveragesClicked: function() {
        // select all coverages
        //this.$('input[type="checkbox"]').attr("checked", true).trigger("change");
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

        var bbox = this.model.get("AoI");
        options.subsetX = [bbox.left, bbox.right];
        options.subsetY = [bbox.bottom, bbox.top];

        // format + outputcrs
        options.format = this.$("#select-output-format").val();
        options.outputCRS = this.$("#select-output-crs").val();
        
        // apply mask parameter
        /*var polygon = this.mapModel.get("polygon");
        if (polygon) {
          var coords = []; 
          _.each(polygon.get("shape").rings[0], function(point) {
            coords.push(point.x);
            coords.push(point.y);
          });
          options.mask = coords.join(" ");
        }*/

        
        // ==============================================================
        //var owsUrl = this.owsUrl;
        // TODO: Each item on the list has to have a reference from 
        // which server it has been been described, right now only testing
        var owsUrl = "http://neso.cryoland.enveo.at/cryoland/ows?";
        this.$('input[type="checkbox"]:checked').each(function(index) {
          var xml = getCoverageXML($(this).val(), options);
          
          var $form = $(CoverageDownloadPostTmpl({
            //url: this.model.get('products')[$(this).val()].get('urls')[0],
            url: owsUrl, xml: xml}));
          $downloads.append($form);
          _.delay(function() { 
          $form.submit(); 
          }, index * 1000);
        });
        // ===============================================================
      },

      /*onModelChange: function(model) {
        
      },*/

      onClose: function() {
        console.log("Dialog close triggered");
        Communicator.mediator.trigger("ui:close", "download");
        this.close();
      }

    });
    return {'DownloadView':DownloadView};
  });
}).call( this );

/*var StartDownloadView = Backbone.View.extend({
  el: "#modal-start-download",
  events: {
    "show": "onModalShow",
    "click #btn-select-all-coverages": "onSelectAllCoveragesClicked",
    "click #btn-invert-coverage-selection": "onInvertCoverageSelectionClicked",
    'change input[type="checkbox"]': "onCoverageSelected",
    "click #btn-start-download": "onStartDownloadClicked"
  },
  
  initialize: function(options) {
    this.mapModel = options.mapModel;
    this.timeModel = options.timeModel;
    this.bboxModel = options.bboxModel;
    this.productCollection = options.productCollection;
    this.owsUrl = options.owsUrl;
    
    this.coverages = new Backbone.Collection([]);
    this.listenTo(this.coverages, "reset", this.onCoveragesReset);
  },
  
  onModalShow: function() {
    
  

});*/