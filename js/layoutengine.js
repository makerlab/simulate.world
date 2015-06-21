
/////////////////////////////////////////////////////////////////////////////////
// topic management
/////////////////////////////////////////////////////////////////////////////////

var Topic = Backbone.Model.extend({ });
var TopicList = Backbone.Collection.extend({ model: Topic });

var topics_by_name = {};
var topic_root = 0;

// hack - make backbone objects because backbone prefers them
// hack - we don't actually load/save to a server or have any dynamic stuff right now
function topics_convert_to_backbone(parent) {
  var collection = new TopicList();
  for(var i=0 ; parent.children && i<parent.children.length;i++) {
    var thing = topics_convert_to_backbone(parent.children[i]);
    collection.add(thing);
  }
  parent.children = 0;
  parent = new Topic(parent);
  parent.children = collection;
  topics_by_name[parent.get("label")] = parent;
  return parent;
}

// return a set of topics matching a criteria
function topics_search(tags,maxcount) {
  // xxx tbd
  return topic_root;
}

function topicengine_kickstart(topics) {
  topic_root = topics_convert_to_backbone(topics);
  return topic_root;
}

/////////////////////////////////////////////////////////////////////////////////
// views
/////////////////////////////////////////////////////////////////////////////////

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
    var art = jQuery('<img/>', { class: 'topicdetailimage', src: '/images/'+this.art, alt: this.label + " " + this.provenance, });
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

    var artsmall = jQuery('<img/>', { class:'topicartsmall', style:"display:none;width:256px;height:256px;float:left;margin:10px", src: '/images/'+this.art, alt: this.label + " " + this.provenance, });
    wrapper.append(artsmall);

    // presenters notes
    var markup = jQuery('<span/>', { class: 'topicdetailnotes',html:rho.toHtml(this.markup) });
    wrapper.append(markup);
    wrapper.append("<div style='clear:both'></div>");
    art.on('click', function() {
      $('.topicdetailnotes').toggle();
    });
    markup.on('click', function() {
      $('.topicdetailimage').toggle();
      $('.topicartsmall').toggle();
    });

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
    wrapper.css("background-image", "url('/thumbs/"+this.art+"')");
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
    if(options.elementid) this.renderto = $(options.elementid); else this.renderto = $('body');
    this.style = options.style;
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

    var wrapper = jQuery('<div/>', { class: 'page' } );

    // layout rules express a tension between a current view mode and an implicit view mode of the subject
    // decks like to show their contents as fully detailed presentations
    // thumbnails like to show their contents as collections of thumbs
    // overviews don't care and want to show contents as suits an external demand

    // for a deck view in detail show each card full sized

    if(this.style == "brief") {
      _(this.collection.models).each(function(item){
        item.view = new TopicThumbView({model:item});
        wrapper.append(item.view.$el);
      },this);
    }

    // "decks"

    else if(this.kind == "deck") {
      _(this.collection.models).each(function(item){
        item.view = new TopicDetailView({model:item});
        wrapper.append(item.view.$el);
      },this);
    }

    // "thumbnails"
    // for a thumbnail overview show a packed set of images - also show any backdrop art for the whole frame

    else {
      wrapper.append("<h1>"+this.label.toUpperCase()+"</h1>");
      wrapper.css("background-image", "url('/images/"+this.art+"')");
      _(this.collection.models).each(function(item){
        item.view = new TopicThumbView({model:item});
        wrapper.append(item.view.$el);
      },this);
      wrapper.append("<br style=clear:both;/>"); // this is needed for the background div height to cover the topics
    }

    // manually attach to world ourselves - this whole routine is currently called once only
    this.$el.append(wrapper);
    this.renderto.append(this.$el);
  },
});

function topic_decorate_div(elementid,topics) {
  if(!topics)topics=topic_root;
  new TopicListView({elementid:elementid,model:topics,style:"brief"});
}

/////////////////////////////////////////////////////////////////////////////////
// backbone routing
// all pages are statically built on demand and cached for now
// had trouble figuring out a better way to do page transitions... TODO improve?
/////////////////////////////////////////////////////////////////////////////////

var AppRouter = Backbone.Router.extend({
  routes: {
    "*actions": "OnceUponATime"
  }
});

var app_router = new AppRouter;
var current_view;
var allviews = {};

app_router.on('route:OnceUponATime', function (actions) {
  var path = actions;
  if(current_view) {
    console.log("hiding view: " + current_view.label);
    current_view.hide();
  }
  var topic = topics_by_name[path];
  if(!topic) {
    topic = topic_root;
  }
  var label = topic.label = topic.get("label");
  var foundview = allviews[label];
  if(!foundview) {
    topic.view = new TopicListView({model:topic});
    topic.view.$el.attr("id",label);
    console.log("produced a new view from scratch and attached to body for: " + label);
  } else {
    foundview.show(); // uses a hide show mechanic to avoid trashing memory
  }
  allviews[label] = current_view = topic.view;
  console.log("showing view: " + label);
});

/////////////////////////////////////////////////////////////////////////////////
// start up everything - call this from outside
/////////////////////////////////////////////////////////////////////////////////

function app_router_start() {
  if(!topic_root)assert("call topicengine_kickstart also");
  Backbone.history.start(); // {pushState:true});
}

