
//////////////////////////////////////////////////////
// Visualization - 3d globals
//////////////////////////////////////////////////////

var container;
var containerWidth, containerHeight;
var camera, controls, scene, raycaster, renderer;

var world;
var worldextent = 100;

var OBJECTS = [];

//////////////////////////////////////////////////////
// go!
//////////////////////////////////////////////////////

window.onload=function() {
  visualization_init();
  visualization_animate();
  features_load();
  palette_load();
}

//////////////////////////////////////////////////////
// 3d setup
// right handed coordinate system
// y = up down where plus is up
// z = in and out of screen where plus is towards you
// x = left right where plus is right
// camera starts at a large +x offset to help sphere wrap for textures
//////////////////////////////////////////////////////

function visualization_init() {

  container = document.getElementById("threejsview"); //createElement( 'div' );
  //document.body.appendChild( container );

  containerWidth = container.offsetWidth;
  containerHeight = container.offsetHeight;

  scene = new THREE.Scene();

  scene.add( new THREE.AmbientLight( 0xc0c0c0 ) );

  var light = new THREE.SpotLight( 0xcccccc, 0.3 );
  light.position.set( -1500, 1500, 300 );
  light.castShadow = true;
  light.shadowCameraNear = 200;
  light.shadowCameraFar = 2000; //camera.far;
  light.shadowCameraFov = 50;
  light.shadowBias = -0.00022;
  light.shadowDarkness = 0.5;
  light.shadowMapWidth = 2048;
  light.shadowMapHeight = 2048;

  // renderer

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setSize( containerWidth, containerHeight );
  renderer.sortObjects = false;
  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFShadowMap;
  raycaster = new THREE.Raycaster();
  container.appendChild( renderer.domElement );

  // camera

  camera = new THREE.PerspectiveCamera( 30, containerWidth / containerHeight , 1, 10000 );
  camera.position.x = 1000;
  camera.lookAt(new THREE.Vector3(0,0,0));
  scene.add(camera);
  camera.add( light );

  // controls
  // xxx may be dependent on the view mode; sometimes want to rotate around a sphere, other times fly over a plane

  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = true;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  // event handling

  window.addEventListener( 'resize', visualization_resize, false );

  renderer.domElement.addEventListener( 'mousemove', visualization_mousemove, false );
  renderer.domElement.addEventListener( 'mousedown', visualization_mousedown, false );
  renderer.domElement.addEventListener( 'mouseup',   visualization_mouseup,   false );

  // manipulators
  visualization_manipulator_build();
}

function visualization_resize() {
  containerWidth = window.innerWidth;
  containerHeight = window.innerHeight;
  camera.aspect = containerWidth / containerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( containerWidth, containerHeight );
}

function visualization_animate() {
  requestAnimationFrame( visualization_animate );
  visualization_manipulator_update();
  if(controls)controls.update();
  renderer.render( scene, camera );
}

/////////////////////////////////////////////////////////////////////////////////////////////
// manipulator concept
// when you hover over a pickable object extra tools appear that you can use to interact with that object
/////////////////////////////////////////////////////////////////////////////////////////////

var manipulator;
var manipulator_focus = 0;
var manipulator_timer = 0;
var manipulator_parent = 0;
var manipulator_xyz = 0;

function visualization_manipulator_attach(target) {
  if(target != manipulator_parent) {
    if(manipulator_parent) manipulator_parent.remove(manipulator);
    manipulator_parent = target;
    manipulator_parent.add(manipulator);
  }
  manipulator_timer = 99;
}

function visualization_manipulator_detach() {
  if(manipulator_parent) manipulator_parent.remove(manipulator);
  manipulator_parent = 0;
  manipulator_timer = 0;
  manipulator_focus = 0;
  if(controls)controls.enabled = true;
  container.style.cursor = 'auto';
}

function visualization_manipulator_update() {
  if(manipulator_timer < 1) return;
  manipulator_timer--;
  if(manipulator_timer > 0) return;
  visualization_manipulator_detach();
}

function visualization_manipulator_build() {

  // a center handle - to move a thing
  // xxx this should be bigger than the thing; or the thing itself should be used to move itself
  var c = 0xff00ff;
  var geometry = new THREE.SphereGeometry( 15, 64, 64 );
  var material = new THREE.MeshLambertMaterial( { color: c } );
  manipulator = new THREE.Mesh( geometry, material );
  manipulator.position.set(0,0,0);
  manipulator.moveme = 1;

  // one of the scale elements - to scale a thing
  var geometry = new THREE.SphereGeometry( 10, 64, 64 );
  var material = new THREE.MeshLambertMaterial( { color: c } );
  var m2 = new THREE.Mesh( geometry, material );
  m2.position.set(30,0,0);
  manipulator.add(m2);
  manipulator.scalerotateme = 1;

}

function visualization_move_mesh(mesh,xyz) {
 console.log("moving");
  mesh.position.copy(xyz);
  if(world && world.round) {
    mesh.lookAt(world.position);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////

function visualization_mousemove( event ) {

  event.preventDefault();

  var mouse = new THREE.Vector2( event.clientX/window.innerWidth*2-1, -event.clientY/window.innerHeight*2+1 );
  raycaster.setFromCamera( mouse, camera );

  // if not actively manipulating something then show available manipulators as rollover hovers that ghost in/out
  if(!manipulator_focus) {
    var intersects = raycaster.intersectObjects( OBJECTS );
    var target = intersects.length ? intersects[0].object : 0;
    if(target && (target.cloneable || target.pickable)) {
      visualization_manipulator_attach(target);
      container.style.cursor = 'pointer';
    } else {
      container.style.cursor = 'auto';
    }
    return;
  }

  var intersects = raycaster.intersectObject(world);
  var target = intersects.length ? intersects[0].object : 0;
  if(!target) {
    // there is no world for the mouse to move over... do nothing
    return;
  }
  var xyz = intersects[0].point;

  // currently moving something?
  if(manipulator_focus.pickable || manipulator_focus.moveme) {
    visualization_move_mesh(manipulator_parent,xyz);
  }

  // currently scaling something? 
  if(manipulator_focus.scalerotateme) {
    var scale = THREE.Vector3.subVectors(manipulator_xyz,xyz).length();
    // - scale up the parent but not the children
    console.log("scale is " + scale); 
  }

}

function visualization_mousedown( event ) {

  event.preventDefault();

  var mouse = new THREE.Vector2( event.clientX/window.innerWidth*2-1, -event.clientY/window.innerHeight*2+1 );
  raycaster.setFromCamera( mouse, camera );

  // if our previous hover state has not setup any preconditions then do nothing
  if(!manipulator_parent) {
    visualization_manipulator_detach();
    return;
  }

  // if user clicked on nothing then also cancel helpers and get out
  var intersects = raycaster.intersectObject( manipulator_parent,true );
  manipulator_focus = intersects.length ? intersects[0].object : 0;
  if (!manipulator_focus) {
    visualization_manipulator_detach();
    return;
  }

  // if user is clicking on outer space - somehow not overtop of the map or globe or the world then do nothing
  var intersects = raycaster.intersectObject(world);
  var target = intersects.length ? intersects[0].object : 0;
  if(!target) {
    visualization_manipulator_detach();
    return;
  }

  // so there was an active hover, user has clicked on it, it is valid, there is a world beneath users click also.

  manipulatior_xyz = intersects[0].point;
  console.log("user clicked on a manipulator");
  console.log(intersects[0]);

  // cloning events happen immediately - do that now
  if(manipulator_parent.cloneable) {
    console.log("cloning request");
    var dupe = manipulator_parent.params.event_handler();
    visualization_manipulator_attach(dupe);
    manipulator_focus = dupe;
  }

  // the remaining behaviors are finalized in mouse move handler elsewhere - so just get out now
  container.style.cursor = 'move';
  if(controls)controls.enabled = false;
}

function visualization_mouseup( event ) {
  event.preventDefault();
  if(controls)controls.enabled = true;
  visualization_manipulator_detach();
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function visualization_create_mesh( params ) {

  var style = params.get("style"); // "world", "object", "spline"
  var shape = params.get("shape"); // "sphere", "cube", or a named shapefile to load
  var lat   = params.get("lat");
  var lon   = params.get("lon");
  var x     = params.get("x") || 0;
  var y     = params.get("y") || 0;
  var z     = params.get("z") || 0;
  var c     = params.get("c");
  var size  = params.get("size") || worldextent/2;
  var pickable  = params.pickable;
  var moveable  = params.moveable;
  var cloneable = params.cloneable;
  var cameraattached = params.cameraattached;

  if(lat || lon) {
    var phi   = (90-lat)*(Math.PI/180);
    var theta = (lon+180)*(Math.PI/180);
    x = -((worldextent) * Math.sin(phi)*Math.cos(theta));
    z = ((worldextent) * Math.sin(phi)*Math.sin(theta));
    y = ((worldextent) * Math.cos(phi));
  }

  var material = null;
  var geometry = null;
  var mesh = null;

  switch(shape) {
    case "sphere":
      geometry = new THREE.SphereGeometry( size, 64, 64 );
      material = new THREE.MeshPhongMaterial( { color: c } );
      break;
    case "cube":
      geometry = new THREE.BoxGeometry( size,size,size );
      material = new THREE.MeshLambertMaterial( { color: c } );
      break;
  }

  // xxx todo set from params later
  // http://learningthreejs.com/blog/2013/09/16/how-to-make-the-earth-in-webgl/
  //material.map = THREE.ImageUtils.loadTexture('images/earth8000.jpg')
  //material.bumpMap = THREE.ImageUtils.loadTexture('images/earthbump1k.jpg')
  //material.bumpScale = 0.05;
  //material.specularMap    = THREE.ImageUtils.loadTexture('images/earthspec1k.jpg')
  //material.specular  = new THREE.Color('grey')

  mesh = new THREE.Mesh( geometry, material );
  mesh.material.ambient = mesh.material.color;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.pickable = pickable;
  mesh.moveable = moveable;
  mesh.cloneable = cloneable;
  mesh.cameraattached = cameraattached;
  mesh.params = params;

  // support both round worlds and flat worlds by keeping geometry aligned to world plane (may fancy up later)
  visualization_move_mesh(mesh,new THREE.Vector3(x,y,z));

  // keep special track of the world itself
  if(style == "world") {
    mesh.pickable = 0; //hack - let's just keep it out of the way
    mesh.moveable = 0;
    world = mesh;
    worldextent = size;
    world.round = shape == "sphere" ? 1 : 0;
  }

  if(pickable) {
    OBJECTS.push( mesh );
  }

  if(cameraattached) {
    camera.add(mesh);
  } else {
    if(world && mesh != world) {
      world.add(mesh);
    } else {
      scene.add(mesh);
    }
  }

  return mesh;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// stubbed in basic classes for the interactive
// conflates in rendering for now
/////////////////////////////////////////////////////////////////////////////////////////////////////////

Feature = Backbone.Model.extend({
  initialize: function() {
    // this encapsulates a server storable beefy base class description of a visible actor in the sim:
    //
    // geometric:
    // x,y,z = absolute position in 3 space not say longitude,latitude,elevation
    // yaw,pitch,roll
    // c = color
    // boundary width height
    // style = { point, line, polygon, filled polygon, sphere...}
    // polyhedral shape file outline of polyhedra
    //
    // behavior:
    // name - colloqiual non formal hopefully unique
    // kind - { water, continent, city, person, ... }
    // tags - i guess voluntary tagging may be useful
    // category - it might be helpful to have some kind of category system as well? debate
    // uuid - a totally unique uuid for this instance
    // uid - all features of all versions of this entity have a uid
    // active (only one feature with a given uid should be active)
    // revision - it may be that the revision number can be rolled into the uuid
    // geodata id
    // wikipedia id
    // osm id
    // created
    // modified
    // sponsor - presumably these things are created by some other entity such as a person?
    // permissions - we might allow objects to be changed by others
    // behavior script
    // relations to other objects in the current simulation scope
  },
});

var features = [
  new Feature({ name:"One", c:0xaaaaaa, shape:"sphere", size:100, style:"world"  }),
  new Feature({ name:"Two", c:0xffff00, shape:"cube",   size:10, x:120  }),
  new Feature({ name:"Tre", c:0xff00ff, shape:"cube",   size:10, lat:0.01, lon:-10 }),
  new Feature({ name:"Tre", c:0xff00ff, shape:"cube",   size:10, lat:10, lon:-20 }),
  new Feature({ name:"Tre", c:0xff00ff, shape:"cube",   size:10, lat:20, lon:-30 }),
  new Feature({ name:"Tre", c:0xff00ff, shape:"cube",   size:10, lat:30, lon:-40 }),
];

function features_load() {
  // xxx produce from user account for this simulation id
  for(var i = 0; i < features.length; i++) {
    var blob = features[i];
    if(blob.mesh) continue;
    blob.pickable = 1;
    blob.moveable = 1;
    blob.event_handler = feature_event_handler;
    blob.mesh = visualization_create_mesh(blob);
  }
}

function feature_event_handler() {

}

function feature_new(blob) {
  var blob = new Feature(blob);
  blob.pickable = 1;
  blob.moveable = 1;
  blob.event_handler = feature_event_handler;
  blob.mesh = visualization_create_mesh(blob);
  //features.add(blob);
  return blob.mesh;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Cloning picker test for a ui where you have a toolkit
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

var palette = [
  new Feature({ name:"One", c:0x8080e0, shape:"sphere", size:10, x:-60, y:0, z:-200  }),
  new Feature({ name:"Two", c:0x70f0c0, shape:"cube",   size:10, x:-60, y:-20, z:-200  }),
];

function palette_load() {
  // xxx the palette should be produced from the server
  for(var i = 0; i < palette.length; i++) {
    var blob = palette[i];
    blob.pickable = 1;
    blob.cloneable = 1;
    blob.cameraattached = 1;
    blob.event_handler = palette_event_handler;
    blob.mesh = visualization_create_mesh(blob);
  }
}

function palette_event_handler() {
  // xxx would be cleaner to clone this prototypical feature and then just pass it to feature_new... 
  //return feature_new( { name:"One", c:0xff0000, shape:"cube", size:10, x:0,y:0,z:0  } );
  // but this will do for now:
  var blob = this;
  blob.set("x",0);
  blob.set("y",0);
  blob.set("z",0);
  blob.pickable = 1;
  blob.moveable = 1;
  blob.cloneable = 0;
  blob.cameraattached = 0;
  blob.event_handler = feature_event_handler;
  blob.mesh = visualization_create_mesh(blob);
  //features.add(blob);
  return blob.mesh;
}

