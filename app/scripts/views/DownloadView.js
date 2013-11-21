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


        var coverageSets = _.map(this.model.get('products'), function(product, key) {
          var set = new EOCoverageSet([]);
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

          // TODO: Check for download protocol !
          set.url = WCS.EO.KVP.describeEOCoverageSetURL(product.get('download').url, key, options);
          return set;
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

            var $form = $(CoverageDownloadPostTmpl({
              url: owsUrl, xml: xml}));
            $downloads.append($form);
            _.delay(function() {
            $form.submit();
            }, index * 1000);
          }
        }, this));
      },

      onClose: function() {
        Communicator.mediator.trigger("ui:close", "download");
        this.close();
      }

    });
    return {'DownloadView':DownloadView};
  });
}).call( this );
