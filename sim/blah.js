var container;
var camera, scene, renderer;
var offsetX = 0;
var offsetY = 0;
var viewWidth = window.innerWidth;
var viewHeight = window.innerHeight;
var cameraOffset = viewWidth;
var objects = [];          

window.onload=function()
{
    init();    
}

function init() {

    container = document.getElementById( 'containerDiv' );				
    viewWidth = container.offsetWidth;
    viewHeight = container.offsetHeight;                
    cameraOffset = viewWidth;
 alert(viewHeight);
    
    camera = new THREE.PerspectiveCamera( 70, viewWidth/viewHeight, 1, 10000 );
    camera.position.set( 0, 0, cameraOffset );                

    scene = new THREE.Scene();

    var geometry = new THREE.BoxGeometry( 100, 100, 100 );
    

    var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x0000ff, opacity: 1 } ) );
    object.position.x = 50;
    object.position.y = 0;
    object.position.z = 0;
    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;
    scene.add( object );
    objects.push( object );

    var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x0000ff, opacity: 1 } ) );
    object.position.x = -50;
    object.position.y = 0;
    object.position.z = 0;
    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;
    scene.add( object );
    objects.push( object );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xf0f0f0 );
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( viewWidth, viewHeight );
    container.appendChild( renderer.domElement );

    renderer.domElement.addEventListener( 'mousedown', onCanvasMouseDown, false );				
    
    camera.lookAt(new THREE.Vector3(0,0,0));              
    render();
}			

function onCanvasMouseDown( event ) {

    event.preventDefault();
    
    var mouse3D = new THREE.Vector3( ( event.clientX - offsetX ) / viewWidth * 2 - 1,
                            -( event.clientY - offsetY ) / viewHeight * 2 + 1,
                            0.5 ); // .unproject(camera ); // .normalize();
    
    mouse3D.sub( camera.position );
    mouse3D.normalize();
    var rayCaster = new THREE.Raycaster( camera.position, mouse3D );

    
    var intersects = rayCaster.intersectObjects( objects );
    // Change color if hit block
    if ( intersects.length > 0 ) {
        intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
    }	
    render();
}

function render() {				
    renderer.render( scene, camera );
}
