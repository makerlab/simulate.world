
//////////////////////////////////////////////////////
// Visualization - 3d globals
//////////////////////////////////////////////////////

var container;
var camera, controls, scene, raycaster, renderer;
var ground;
var offsetX = 0, offsetY = 0, containerWidth, containerHeight;

var OBJECTS = [];
var INTERSECTED, SELECTED, OFFSET = new THREE.Vector3(0,0,0);

//////////////////////////////////////////////////////
// go!
//////////////////////////////////////////////////////

window.onload=function() {
  visualization_init();
  visualization_animate();

  features_setup_visible();

  ux_palette();
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

  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = true;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  // event handling

  window.addEventListener( 'resize', onWindowResize, false );
  renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  renderer.domElement.addEventListener( 'mouseup',   onDocumentMouseUp,   false );

}

function onWindowResize() {
  containerWidth = window.innerWidth;
  containerHeight = window.innerHeight;
  camera.aspect = containerWidth / containerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( containerWidth, containerHeight );
}

function visualization_animate() {
  requestAnimationFrame( visualization_animate );
  visualization_render();
}

function visualization_render() {
  if(controls)controls.update();
  renderer.render( scene, camera );
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// picker
/////////////////////////////////////////////////////////////////////////////////////////////////////

function onDocumentMouseMove( event ) {

  event.preventDefault();

  var mouse = new THREE.Vector2( event.clientX/window.innerWidth*2-1, -event.clientY/window.innerHeight*2+1 );
  raycaster.setFromCamera( mouse, camera );

  // dragging

  if ( SELECTED && ground ) {
    if(SELECTED == ground) return;
    var intersects = raycaster.intersectObject( ground );
    if(intersects.length) {
      SELECTED.position.copy( intersects[ 0 ].point ); //.sub( OFFSET ) );
      SELECTED.lookAt( new THREE.Vector3(0,0,0) ); // keep things aligned facing center for now
    }
    return;
  }

  // rollover hover

  var intersects = raycaster.intersectObjects( OBJECTS );

  // if left an object then revert color

  if (!intersects.length || (INTERSECTED && intersects[0].object != INTERSECTED)) {
    if(INTERSECTED) {
      INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
      INTERSECTED = null;
      container.style.cursor = 'auto';
    }
    return;
  }

  // set color

  if(!INTERSECTED && intersects[0].object != ground) {
    INTERSECTED = intersects[ 0 ].object;
    INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
    INTERSECTED.material.color.setRGB(1,0,0);
  }

  container.style.cursor = 'pointer';

}

function onDocumentMouseDown( event ) {
  event.preventDefault();
  var mouse = new THREE.Vector2( event.clientX/window.innerWidth*2-1, -event.clientY/window.innerHeight*2+1 );
  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects( OBJECTS );
  if ( intersects.length > 0 && intersects[0].object != ground) {
    intersects[ 0 ].object.handlePick(raycaster);
    controls.enabled = false;
    container.style.cursor = 'move';
  }
}

function onDocumentMouseUp( event ) {
  event.preventDefault();
  controls.enabled = true;
  SELECTED = null;
  container.style.cursor = 'auto';
}

///////////////////////////////////////////////////////////////////
// Cloning picker test for a ui where you have a toolkit
///////////////////////////////////////////////////////////////////

function ux_movepicker(raycaster) {
  SELECTED = this;
/*
  if(ground) {
    var intersects = raycaster.intersectObject( ground );
    if(intersects) {
      OFFSET.copy( intersects[ 0 ].point ).sub( ground.position );
    }
  }
*/
}

function ux_clonepicker(raycaster) {
  var mesh = ux_makegeom( 0,0,0, 20, 0xff00ff );
  scene.add( mesh );
  mesh.handlePick = ux_movepicker;
  mesh.handlePick(raycaster);
  return mesh;
}

function ux_makegeom(x,y,z,size,c) {
  var geometry = new THREE.BoxGeometry( size,size,size );
  var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: c } ) );
  mesh.material.ambient = mesh.material.color;
  mesh.position.x = x;
  mesh.position.y = y;
  mesh.position.z = z;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  OBJECTS.push( mesh );
  return mesh;
}


function ux_palette() {

  var mesh = ux_makegeom(-60,0,-200,10,"blue");
  mesh.handlePick = ux_clonepicker;
  camera.add( mesh );

  var mesh2 = ux_makegeom(-60,-20,-200,10,"green");
  mesh2.handlePick = ux_clonepicker; 
  camera.add( mesh2 );
}

//////////////////////////////////////////////////////
// stubbed in basic classes for the interactive
// conflates in rendering for now
//////////////////////////////////////////////////////

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

//
// this is sloppy - later i should separate model from view better
//
// Debating if I should have geometry as a subclass or if I should subclass all kinds (continents, people)
// I do want to consolidate creating the visual appearance of an object into a method on that object
// I want to keep the simulation part independent of the rendering however.
//

  dress: function() {

    var earthradius = 100;

    var feature = this;

    // observes and avoids adding a graphical object to a feature that already got one
    if(this.mesh != null) return 0;

    var style = feature.get("style");
    var lat = feature.get("lat");
    var lon = feature.get("lon");
    var x = feature.get("x") || 0;
    var y = feature.get("y") || 0;
    var z = feature.get("z") || 0;
    var c = feature.get("c");
    var size = feature.get("size") || earthradius/2;
    var mesh = null;

    if(lat || lon) {
      var phi   = (90-lat)*(Math.PI/180);
      var theta = (lon+180)*(Math.PI/180);
      x = -((earthradius) * Math.sin(phi)*Math.cos(theta));
      z = ((earthradius) * Math.sin(phi)*Math.sin(theta));
      y = ((earthradius) * Math.cos(phi));
    }

    if(style == "sphere") {
      // http://learningthreejs.com/blog/2013/09/16/how-to-make-the-earth-in-webgl/
      var geometry = new THREE.SphereGeometry( size, 64, 64 );
      var material = new THREE.MeshPhongMaterial()
      //material.map = THREE.ImageUtils.loadTexture('images/earth8000.jpg')
      //material.bumpMap = THREE.ImageUtils.loadTexture('images/earthbump1k.jpg')
      //material.bumpScale = 0.05;
      //material.specularMap    = THREE.ImageUtils.loadTexture('images/earthspec1k.jpg')
      //material.specular  = new THREE.Color('grey')
      mesh = new THREE.Mesh(geometry, material);

      // hack for dragging
      ground = mesh;

      /*
      var geometry = new THREE.SphereGeometry(0.51, 32, 32)
      var material = new THREE.MeshPhongMaterial({
        map     : new THREE.Texture(canvasCloud),
        side        : THREE.DoubleSide,
        opacity     : 0.8,
        transparent : true,
        depthWrite  : false,
      });
      var cloudMesh = new THREE.Mesh(geometry, material)
      mesh.add(cloudMesh);
      */
    }
    else if(style == "cube") {
      var geometry = new THREE.BoxGeometry( size,size,size );
      mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: c } ) );
      mesh.material.ambient = mesh.material.color;
    }

    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.lookAt( new THREE.Vector3(0,0,0) ); // keep things aligned facing center for now

    this.mesh = mesh;
    return mesh;

  },


});

var features = [
  new Feature({ name:"One", c:0xff0000, style:"sphere", size:100  }),
  new Feature({ name:"Two", c:0xffff00, style:"cube",   size:10, x:120  }),
  new Feature({ name:"Tre", c:0xff00ff, style:"cube",   size:10, lat:0.01, lon:-10 }),
  new Feature({ name:"Tre", c:0xff00ff, style:"cube",   size:10, lat:10, lon:-20 }),
  new Feature({ name:"Tre", c:0xff00ff, style:"cube",   size:10, lat:20, lon:-30 }),
  new Feature({ name:"Tre", c:0xff00ff, style:"cube",   size:10, lat:30, lon:-40 }),
];

function features_setup_visible() {

  for(var i = 0; i < features.length; i++) {

    var feature = features[i];
    if(!feature) continue;

    var mesh = feature.dress();
    if(!mesh) continue;

    OBJECTS.push( mesh );
    scene.add( mesh );
    mesh.handlePick = ux_movepicker;
  }
}

///////////////////////////////////////////////////////////////////
// notes
///////////////////////////////////////////////////////////////////

// april 1 2015
// - allow dragging and creating
// - allow wiring

