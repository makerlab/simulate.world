
/////////////////////////////////////////////////////////////////////////////////////////////
// Visualization - 3d globals
/////////////////////////////////////////////////////////////////////////////////////////////

var container;
var containerWidth, containerHeight;
var camera, controls, scene, raycaster, renderer;

var world;
var worldextent = 100;

var OBJECTS = [];

/////////////////////////////////////////////////////////////////////////////////////////////
// go!
/////////////////////////////////////////////////////////////////////////////////////////////

window.onload=function() {
  visualization_init();
  visualization_animate();
  features_load();
  palette_load();
}

/////////////////////////////////////////////////////////////////////////////////////////////
// general initialization of the 3d scene and resizing
// 
// right handed coordinate system
// y = up down where plus is up
// z = in and out of screen where plus is towards you
// x = left right where plus is right
// camera starts at a large +x offset to help sphere wrap for textures
/////////////////////////////////////////////////////////////////////////////////////////////

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

function visualization_init() {

  container = document.getElementById("threejsview"); //createElement( 'div' );
  //document.body.appendChild( container );

  containerWidth = container.offsetWidth;
  containerHeight = container.offsetHeight;

  scene = new THREE.Scene();

  scene.add( new THREE.AmbientLight( 0xc0c0c0 ) );

  // a light

  // var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
  // light.position.set( 0, 1, 0 );

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
  camera.position.z = 1000;
  camera.lookAt(new THREE.Vector3(0,0,0));
  scene.add(camera);
  camera.add( light );

  // controls
  // xxx may be dependent on the view mode; a sphere and a plane are both being considered for the ''

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

/////////////////////////////////////////////////////////////////////////////////////////////
// support for a concept where manipulators pop up when user is hovering over a geometry
/////////////////////////////////////////////////////////////////////////////////////////////

var manipulator;                // art for manipulator itself
var manipulator_focus = 0;      // which manipulator sub-part is being touched?
var manipulator_timer = 0;      // a timer
var manipulator_parent = 0;     // what manipulator is attached to (the real user created object)
var manipulator_xyz = 0;        // down position for scaling ratios
var manipulator_scale = 0;      // original scale of user object
var manipulator_dist = 0;       // original distance to object when dragging
var manipulator_ypr = 0;        // original rotation of user object

function visualization_manipulator_detach() {
  if(manipulator_parent) manipulator_parent.remove(manipulator);
  manipulator_parent = 0;
  manipulator_timer = 0;
  manipulator_focus = 0;
  if(controls)controls.enabled = true;
  container.style.cursor = 'auto';
}

function visualization_manipulator_attach(target) {
  if(!target) {
    visualization_manipulator_detach();
    return;
  }
  if(target != manipulator_parent) {
    if(manipulator_parent) manipulator_parent.remove(manipulator);
    manipulator_parent = target;
    manipulator_parent.add(manipulator);
  }
  manipulator_timer = 99;
}

function visualization_manipulator_update() {
  if(manipulator_timer < 1) return;
  manipulator_timer--;
  if(manipulator_timer > 0) return;
  visualization_manipulator_detach();
}

function visualization_manipulator_build() {

  // move
  var c = 0xff00ff;
  var geometry = new THREE.SphereGeometry( 10, 64, 64 );
  var material = new THREE.MeshLambertMaterial( { color: c } );
  var m1 = new THREE.Mesh( geometry, material );
  m1.position.set(-20,0,0);
  m1.moveme = 1;

  // scale
  var c = 0x00ffff;
  var geometry = new THREE.SphereGeometry( 10, 64, 64 );
  var material = new THREE.MeshLambertMaterial( { color: c } );
  var m2 = new THREE.Mesh( geometry, material );
  m2.position.set(20,20,0);
  m2.scalerotateme = 1;

  // hub
  var c = 0xff00ff;
  var geometry = new THREE.SphereGeometry( 0.01, 64, 64 );
  var material = new THREE.MeshLambertMaterial( { color: c } );
  manipulator = new THREE.Mesh( geometry, material );
  manipulator.add(m1);
  manipulator.add(m2);

}

function visualization_move_mesh(mesh,xyz) {
  mesh.position.copy(xyz);
  if(world && world.round) {
    mesh.lookAt(world.position);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// connecting user inputs to manipulators that create and move objects
////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

  var intersects = raycaster.intersectObject(world.world);
  var target = intersects.length ? intersects[0].object : 0;
  if(!target) {
    // there is no world for the mouse to move over... do nothing
    console.log("no world");
    return;
  }
  var xyz = intersects[0].point;

  // give us more time
  manipulator_timer = 99;

  // currently moving something?
  if(manipulator_focus.pickable || manipulator_focus.moveme) {
    console.log("xyz " + xyz.x + " " + xyz.y + " " + xyz.z + " " + manipulator_parent.scale.x );
    visualization_move_mesh(manipulator_parent,xyz);
  }

  // currently scaling something? 
  if(manipulator_focus.scalerotateme) {
    if(!manipulator_xyz) manipulator_xyz = xyz;
    // get new distance to target 
    var dist = xyz.distanceTo(manipulator_parent.position);
    // subtracting these gets scale direction
    dist = dist - manipulator_dist;
    // estimate a scaling ratio - could improve based on object size
    dist = dist / 100.0;
    // add the original scale back on 
    dist += manipulator_scale;
    // and this is our new scale to apply
    manipulator_parent.scale.set(dist,dist,dist);
  }

}

function visualization_mousedown( event ) {

  event.preventDefault();

  var mouse = new THREE.Vector2( event.clientX/window.innerWidth*2-1, -event.clientY/window.innerHeight*2+1 );
  raycaster.setFromCamera( mouse, camera );

  // if no helpers active then cancel helpers and get out
  if(!manipulator_parent) {
    visualization_manipulator_detach();
    return;
  }

  // find which part of the manipulator was selected (manipulators have different kinds of sub roles)
  var intersects = raycaster.intersectObject( manipulator, true );
  manipulator_focus = intersects.length ? intersects[0].object : 0;
  if (!manipulator_focus) {
    visualization_manipulator_detach();
    return;
  }

  // user clicked on something and here is where in the world they clicked on it
  var intersects = raycaster.intersectObject(world.world);
  var target = intersects.length ? intersects[0].object : 0;
  if(!target) {
    console.log("no world");
    visualization_manipulator_detach();
    return;
  }
  manipulator_xyz = intersects[0].point;
  manipulator_scale = manipulator_parent.scale.x;
  manipulator_dist = manipulator_xyz.distanceTo(manipulator_parent.position);
  manipulator_timer = 99;

  // the ux has a concept of allowing cloning. if there is a cloneable parent then clone a new child now.
  if(manipulator_parent.cloneable) {
    var dupe = visualization_clone(manipulator_parent.params);
    visualization_manipulator_attach(dupe);
  }

  // most other modes are resolved in mouse move
  container.style.cursor = 'move';
  if(controls)controls.enabled = false;
}

function visualization_mouseup( event ) {
  event.preventDefault();
  if(controls)controls.enabled = true;
  visualization_manipulator_detach();
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// utility
///////////////////////////////////////////////////////////////////////////////////////////////////

function fixuvs( geometry ){

    geometry.computeBoundingBox();

    var max     = geometry.boundingBox.max;
    var min     = geometry.boundingBox.min;

    var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

    geometry.faceVertexUvs[0] = [];
    var faces = geometry.faces;

    for (i = 0; i < geometry.faces.length ; i++) {

      var v1 = geometry.vertices[faces[i].a];
      var v2 = geometry.vertices[faces[i].b];
      var v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
      ]);

    }

    geometry.uvsNeedUpdate = true;

}

function visualization_create_mesh( params ) {

  var geometry = null;
  var mesh = null;
  var material = null;

  var shape = params.get("shape"); // "sphere", "cube", or a named shapefile to load
  var size  = params.get("size") || worldextent/2;
  var c     = params.get("c");

  switch(shape) {
    case "sphere":
      geometry = new THREE.SphereGeometry( size, 64, 64 );
      material = new THREE.MeshPhongMaterial( { color: c } );
      mesh = new THREE.Mesh( geometry, material );
      params.mesh = visualization_mesh_finalize(mesh,params);
      mesh.params = params

      // make a temporary invisible mesh due to async issues;
      break;
    case "cube":
      geometry = new THREE.BoxGeometry( size,size,size );
      material = new THREE.MeshLambertMaterial( { color: c } );
      mesh = new THREE.Mesh( geometry, material );
      params.mesh = visualization_mesh_finalize(mesh,params);
      mesh.params = params;
      break;
    case "california":

      // this acts both as a stand in and as a collision target for intersection tests
      geometry = new THREE.BoxGeometry( size*10,size*10,1 );
      material = new THREE.MeshPhongMaterial( { color: c } );
      params.mesh = params.world = new THREE.Mesh( geometry, material );

      var loader = new THREE.OBJLoader();
      loader.load('obj/california.obj',
        function(mesh) {
          //mesh = mesh.children[0];
          mesh.scale.set(100,100,100);
         // mesh.rotation.set(0,90,0);
          //fixuvs(mesh.children[0].geometry);
          mesh.children[0].material = new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0xeeeeee, specular: 0xffffff, shininess: 50, shading: THREE.SmoothShading } );
	  console.log(mesh);
          // mesh.geometry.dynamic = 1;
	  var mesh = visualization_mesh_finalize(mesh,params);
          params.mesh = mesh;
          mesh.params = params;
          mesh.world = params.world;
        },
        function() {
          console.log("...loading...")
        },
        function() {
          console.log("loading err")
        }
      );
      break;
    default:
      console.log("no shape style " + shape );
      break;
  }
}

function visualization_mesh_finalize(mesh,params) {

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

  // xxx todo set from params later
  // http://learningthreejs.com/blog/2013/09/16/how-to-make-the-earth-in-webgl/
  //material.map = THREE.ImageUtils.loadTexture('images/earth8000.jpg')
  //material.bumpMap = THREE.ImageUtils.loadTexture('images/earthbump1k.jpg')
  //material.bumpScale = 0.05;
  //material.specularMap = THREE.ImageUtils.loadTexture('images/earthspec1k.jpg')
  //material.specular = new THREE.Color('grey')

  if(mesh.material) mesh.material.ambient = mesh.material.color;

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.pickable = pickable;
  mesh.moveable = moveable;
  mesh.cloneable = cloneable;
  mesh.cameraattached = cameraattached;

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
    //if(world && mesh != world) {
    //  world.add(mesh);
    //} else {
      scene.add(mesh);
   // }
  }

  return mesh;
}

// xxx really should make a new hash - overwriting the previous
// for now i'm taking the parent feature and treating it as a hash of parameters to clone the mesh
// realistically it would be better to have a higher level feature constructor that works with the server
// and the mesh can be produced as a call from that
//   return feature_new( { name:"One", c:0xff0000, shape:"cube", size:10, x:0,y:0,z:0  } );
//   features.add(params); <- separate out with a call to an external handler because feature scope is outside of this

function visualization_clone(params) {
  params.set("x",0);
  params.set("y",0);
  params.set("z",0);
  params.pickable = 1;
  params.moveable = 1;
  params.cloneable = 0;
  params.cameraattached = 0;
  visualization_create_mesh(params);
  return params.mesh;
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
    // permissions - might allow objects to be changed by others
    // behavior script
    // relations to other objects in the current simulation scope
  },
});

var features = [
  new Feature({ name:"One", c:0xaaaaaa, shape:"california", size:100, style:"world"  }),
  new Feature({ name:"Two", c:0xffff00, shape:"cube",   size:10, x:120  }),
  new Feature({ name:"Tre", c:0xff00ff, shape:"cube",   size:10, lat:0.01, lon:-10 }),
  new Feature({ name:"Tre", c:0xff00ff, shape:"cube",   size:10, lat:10, lon:-20 }),
  new Feature({ name:"Tre", c:0xff00ff, shape:"cube",   size:10, lat:20, lon:-30 }),
  new Feature({ name:"Tre", c:0xff00ff, shape:"cube",   size:10, lat:30, lon:-40 }),
];

function features_load() {

  // xxx this list of features should actually be fetched from a server

  for(var i = 0; i < features.length; i++) {
    var feature = features[i];
    if(feature.mesh) continue;
    feature.pickable = 1;
    feature.moveable = 1;
    visualization_create_mesh(feature);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Cloning picker test for a ui where you have a toolkit
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

var palette = [
  new Feature({ name:"One", c:0x8080e0, shape:"sphere", size:10, x:-60, y:0, z:-200  }),
  new Feature({ name:"Two", c:0x70f0c0, shape:"cube",   size:10, x:-60, y:-20, z:-200  }),
];

function palette_load() {
  // xxx this list of features should be produced from a server
  for(var i = 0; i < palette.length; i++) {
    var feature = palette[i];
    feature.pickable = 1;
    feature.cloneable = 1;
    feature.cameraattached = 1;
    visualization_create_mesh(feature);
  }
}


