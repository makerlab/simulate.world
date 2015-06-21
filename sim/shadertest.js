
//
// Returns a mesh that a caller can add to their scene
//

function visualization_shadertest() {

  // make a texture procedurally
  var can=document.getElementById("canvas");
  var context=can.getContext("2d");
  var canImageData = context.createImageData(can.width, can.height);
  context.fillStyle='rgba('+Math.round(Math.random()*255)+','+Math.round(Math.random()*255)+','+Math.round(Math.random()*255)+',1)';
  context.fillRect(0,0,can.width,can.height);
  //twodNoise(canImageData, context);
  stackedNoise(context, canImageData, 12, 0.8);
  canImageData = context.getImageData(0,0,can.width, can.height);

  // play with shader
  var texture = new THREE.Texture(can); // THREE.ImageUtils.loadTexture( "file:///../texture.jpg" )
  texture.needsUpdate = true;

  var vertShader = document.getElementById('vertexShader').innerHTML;
  var fragShader = document.getElementById('fragmentShader').innerHTML;
  var uniforms = {
    texture1: { type: "t", value: texture }
  };
  var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader
  });

  // material = new THREE.MeshLambertMaterial({map : texture});

  material.transparent=true;
  material.opacity = 0.35;
  
  var plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ), material);
  plane.visible = true;
  return plane;
}

///////////////////////////////////////
//helpful functions
//http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
///////////////////////////////////////

//returns a random value between range/2 and -range/2
function randNegPosRange(range){
  return Math.random()*range - range/2;
}

//returns a random value between 0 and range
function randPosRange(range){
  return Math.random()*range;
}

// x should be between 0 and 1. It bumps the result more towards a or b, respectively.
function cosineInterpolate(a, b, x){
  var ft = x*Math.PI;
  var f = 1-(1-Math.cos(ft))*.5;
  return  a*(1-f) + b*f;
}

function twodNoise(imgdata, ctx) {
  var count = 0;
  var shade=randPosRange(255);  
  for(var q=0; q<imgdata.data.length; q++){
    switch(count){
      case 0:
        imgdata.data[q] = shade;
        count += 1;
        break;
      case 1:
        imgdata.data[q] = shade;
        count += 1;
        break;
      case 2:
        imgdata.data[q] = shade;
        count += 1;
        break;
      case 3:
        imgdata.data[q] = 255;
        count=0;
        shade = randPosRange(255);
        break;       
    }
  }
  ctx.putImageData(imgdata, 0, 0);
}

function stackedNoise(ctx, imgdata, octaves, ratio){
  for(var p=0; p <= octaves; p++){
    var localCan = document.createElement('canvas');
    var operative = Math.pow(ratio,p);
    localCan.width = imgdata.width*operative;
    localCan.height = imgdata.height*operative;
    var localctx = localCan.getContext("2d");
    var octimgdata = localctx.createImageData(localCan.width,localCan.height);
    twodNoise(octimgdata, localctx);
    ctx.globalAlpha = operative;
    ctx.drawImage(localCan,0,0,imgdata.width, imgdata.height);
  }
}

//top and bottom must be less than 255
function multiply(top, bottom){
  return (top * bottom)/255;
}

//applies multiply onto the first imgdata
function multiplyFilter(ctx, imgdata, imgdatb){
  var imgarra = imgdata.data;
  var imgarrb = imgdatb.data;
  for(var i=0; i<imgarra.length; i+=4){
    imgarra[i] = multiply(imgarra[i], imgarrb[i]);
    imgarra[i+1] = multiply(imgarra[i+1], imgarrb[i+1]);
    imgarra[i+2] = multiply(imgarra[i+2], imgarrb[i+2]);
  }
  ctx.putImageData(imgdata, 0, 0);    
}


