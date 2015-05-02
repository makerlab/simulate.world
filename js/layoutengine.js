
var Topic = Backbone.Model.extend({ });
var TopicList = Backbone.Collection.extend({ model: Topic });

var TopicDetailView = Backbone.View.extend({
  initialize: function(opts) {
    this.art = this.model.get("art");
    this.provenance = this.model.get("provenance");
    this.label = this.model.get("label");
    this.kind = this.model.get("kind");
    this.markup = this.model.get("notes");
    this.collection = this.model.children; 
    this.renderOnce();
  },
  renderOnce: function() {
    var wrapper = jQuery('<div/>');

    // art
    var artwrapper = jQuery('<div/>', { class: 'topicdetail' } );
    var art = jQuery('<img/>', { class: 'topicdetailimage', src: 'images/'+this.art, alt: this.label + " " + this.provenance, });
    artwrapper.append(art);
    wrapper.append(artwrapper);

    // overlays
    _(this.collection.models).each(function(child){
      var markup = child.get("notes");
      var style = child.get("style"); if(!style) style = "top:10px;left:10px;";
      var text = jQuery('<div/>', {
        class: 'topicdetailoverlay',
        html:markup,
        style: style,
      });
      artwrapper.append(text);
    });

    // presenters notes
    var markup = jQuery('<span/>', { class: 'topicdetailnotes',html:rho.toHtml(this.markup) });
    wrapper.append(markup);
    art.on('click', function() { $('.topicdetailnotes').toggle(); });
    markup.on('click', function() { $('.topicdetailnotes').toggle(); });

    // set wrapper
    this.setElement(wrapper); 
  },
});

var TopicThumbView = Backbone.View.extend({
  events: { 'click button#zoom': 'zoom', 'click': 'zoom', }, // 1-3 does not work universally
  initialize: function(opts) {
    _.bindAll(this,'zoom');
    this.art = this.model.get("art");
    this.provenance = this.model.get("provenance");
    this.label = this.model.get("label");
    this.kind = this.model.get("kind");
    this.markup = this.model.get("notes");
    this.url = this.model.get("url"); if(!this.url) this.url = "/#" + this.label;
    this.collection = this.model.children;
    this.model.bind('zoom',this.zoom); // 1-3 does not work universally
    this.renderOnce();
  },
  renderOnce: function() {
    var wrapper = jQuery('<a/>', { class: 'topicthumb', });
    wrapper.css("background-image", "url('thumbs/"+this.art+"')");
    wrapper.append("<h2>"+this.label+"</h2>");
    wrapper.attr('href',this.url); // 2-3 -> only one of these is needed
    wrapper.on('click', this.zoom); // 3-3 -> only one of these is needed
    this.setElement(wrapper); // rewrites this.el
  },
  zoom: function(ev) {
    if(this.model.get("url")) { location.href = this.url; return; } // hack
    app_router.navigate(this.label,{trigger:true}); // trigger must be true on chrome
    return false; // this seems to make no real difference
  },
});

var TopicListView = Backbone.View.extend({
  initialize: function(options){
    this.art = this.model.get("art");
    this.provenance = this.model.get("provenance");
    this.label = this.model.get("label");
    this.kind = this.model.get("kind");
    this.markup = this.model.get("notes");
    this.collection = this.model.children; 
    this.renderOnce();
  },
  hide: function() {
    this.$el.hide();
  },
  show: function() {
    this.$el.show();
    document.title = this.label.toUpperCase(); // refix label when jumping back here
  },
  renderOnce: function(){
    document.title = this.label.toUpperCase();

    // for a deck view in detail show each card full sized
    var wrapper = jQuery('<div/>', { class: 'page' } );
    if(this.kind == "deck") {
      _(this.collection.models).each(function(item){
        item.view = new TopicDetailView({model:item});
        wrapper.append(item.view.$el);
      },this);
    }

    // for a thumbnail overview show a packed set of images - also show any backdrop art for the whole frame
    else {
      wrapper.append("<h1>"+this.label.toUpperCase()+"</h1>");
      wrapper.css("background-image", "url('images/"+this.art+"')");
      _(this.collection.models).each(function(item){
        item.view = new TopicThumbView({model:item});
        wrapper.append(item.view.$el);
      },this);
      wrapper.append("<br style=clear:both;/>"); // this is needed for the background div height to cover the topics
    }

    // manually attach to world ourselves - this whole routine is currently called once only
    this.$el.append(wrapper);
    $('body').append(this.$el);
  },
});

/////////////////////////////////////////////////////////////////////////////////
// hack - make backbone objects because backbone prefers them
// we don't actually load/save to a server or have any dynamic stuff right now
/////////////////////////////////////////////////////////////////////////////////

var topics_by_name = {};

function convert_to_backbone(parent) {
  var collection = new TopicList();
  for(var i=0 ; parent.children && i<parent.children.length;i++) {
    var thing = convert_to_backbone(parent.children[i]);
    collection.add(thing);
  }
  parent.children = 0;
  parent = new Topic(parent);
  parent.children = collection;
  topics_by_name[parent.get("label")] = parent;
  return parent;
}

topic_main = convert_to_backbone(topic_main);

/////////////////////////////////////////////////////////////////////////////////
// routing support
// keep alll pages in memory for now...
/////////////////////////////////////////////////////////////////////////////////

var current_view;
var allviews = {};

function go_somewhere(path) {
  if(current_view) {
    console.log("hiding view: " + current_view.label);
    current_view.hide();
  }
  var topic = topics_by_name[path];
  if(!topic) {
    topic = topic_main;
  }
  var label = topic.label = topic.get("label");
  var foundview = allviews[label];
  if(!foundview) {
    topic.view = new TopicListView({model:topic});
    topic.view.$el.attr("id",label);
    console.log("produced a new view from scratch and attached to body for: " + label);
  } else {
    foundview.show();
  }
  allviews[label] = current_view = topic.view;
  console.log("showing view: " + label);
};

/////////////////////////////////////////////////////////////////////////////////
// backbone routing
/////////////////////////////////////////////////////////////////////////////////

var AppRouter = Backbone.Router.extend({
  routes: {
    "*actions": "OnceUponATime"
  }
});

var app_router = new AppRouter;

app_router.on('route:OnceUponATime', function (actions) {
  go_somewhere(actions);
});

/////////////////////////////////////////////////////////////////////////////////
// start up everything
/////////////////////////////////////////////////////////////////////////////////

(function($) {
  Backbone.history.start(); // {pushState:true});
})(jQuery);

