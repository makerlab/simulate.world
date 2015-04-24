
var Topic = Backbone.Model.extend({ });
var TopicList = Backbone.Collection.extend({ model: Topic });

var TopicThumbView = Backbone.View.extend({
  events: { 'click button#zoom': 'zoom', 'click': 'zoom', }, // 1-3 does not work universally
  initialize: function(opts) {
    _.bindAll(this,'zoom');
    this.kind = opts.kind;
    //this.model = opts.model; // not needed
    this.model.bind('zoom',this.zoom); // 1-3 does not work universally
    //this.listenTo(this.model,'destroy',this.close); // not used
    if(this.kind != "deck") this.renderThumb(); else this.renderDetail();
  },

  renderThumb: function() {
    this.art = this.model.get("art");
    this.label = this.model.get("label");
    var blob = jQuery('<a/>', { class: 'topic', });
    blob.css("background-image", "url('/images/"+this.art+"')");
    blob.append("<h2>"+this.label+"</h2>");
    blob.attr('href',"/#"+this.label); // 2-3 -> only one of these is needed
    blob.on('click', this.zoom); // 3-3 -> only one of these is needed
    this.setElement(blob); // rewrites this.el
  },

  renderDetail: function() {
    this.art = this.model.get("art");
    this.label = this.model.get("label");
    this.notes = this.model.get("notes");
    var wrapper = jQuery('<div/>');
    t = jQuery('<div/>', { class: 'topicdetail' });
    t.css("background-image", "url('/images/"+this.art+"')");
    wrapper.append(t);
    var s = jQuery('<div/>', { clasS: 'topicdetailnotes' } );
    s.append(rho.toHtml(this.notes));
    wrapper.append(s);
    this.setElement(wrapper); 
  },

  zoom: function(ev) {
    app_router.navigate(this.label,{trigger:true}); // trigger must be true on chrome
    return false; // this seems to make no real difference
  },
  //close: function(){
  //  this.remove();
  //  this.unbind();
  //  if (this.onClose){ this.onClose(); }
  //},
});

var TopicListView = Backbone.View.extend({
  views: [],
  initialize: function(options){
    this.label = this.model.get("label").toUpperCase();
    this.art = this.model.get("art");
    this.kind = this.model.get("kind");
    this.collection = this.model.children; 
    this.renderOnce();
  },
  hide: function() {
    this.$el.hide();
  },
  show: function() {
    this.$el.show();
    document.title = this.label;
  },
  renderOnce: function(){
    document.title = this.label;

    // this layout has a left side for all of the images and a right side for all of the notes
    // and if there is insufficient room then i guess they fold together

    if(1) {
      var blob = jQuery('<div/>', { class: 'page' } );
      if(this.kind != "deck") {
        blob.append("<h1>"+this.label+"</h1>");
        blob.css("background-image", "url('/images/"+this.art+"')");
      }
      this.views = [];
      var self = this;
      _(this.collection.models).each(function(item){
        item.view = new TopicThumbView({model:item,kind:this.kind});
        this.views.push(item.view);
        blob.append(item.view.$el);
      },this);
      blob.append("<br style=clear:both;/>"); // this is needed for the background div height to cover the topics
      this.$el.append(blob);
    }

    // manually attach to world ourselves - this whole routine is currently called once only
    $('body').append(this.$el);
  },
  freshen_contents: function(model) {
    // manually remove all views by hand for now xxx improve?
    // xxx doesn't actually detach the view from the html... why? xxx
    for(var i = 0; i < this.views.length; i++) {
       var view = this.views[i];
       view.close();
    };
    this.views = [];
    this.collection.reset();
    $(this.el).empty();
    this.model = model;
    this.render();
  },
  close: function(){
    this.remove();
    this.unbind();
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

