////////////////////////////////////
// our measure of time
// ... i will run the simulation at steps of one month
// ... time will start in at 0 being 5000 Before Christ I guess?
// ... time will end at 10000*12 being 5000 Annum Deity
// ... so the year 2000 is represented as 7000*12

function Period() {
  this.begins = 0;
  this.ends = 10000 * 12;
};

Period.prototype.set = function(_begins,_ends) {
  this.begins = _begins;
  this.ends = _ends;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Here I'm exploring an idea of modeling complex systems using an object oriented approach with active agents or actors that run over time
// In this example I'm looking at an entire water system and modeling each part as a javascript object
// I'm also trying an idea where people might make their own libraries of objects; so I name it for myself
// Also, testing the representation objects as naked basic javascript types... so they can embody procedural behavior over time
// Rather than producing these here by hand I could just make them from some kind of lighter-script description as needed
// ... can we use modules?
// ... i am concentrating basic powers such as relationships, total volume and the like at the manager level not here

//
// A watershed object
//

function Watershed(_name) {
  this.name = _name;
  // ...data could be produced by an algorithm or a database query or estimated by a user
  // ...obviously it should be persisted and vary per instance but i am not doing that yet
  // ...units are in board acre feet i suppose? it might make sense to use metric
  // ...we assume it is water
  this.volumepermonth = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 7, 5, 3 ];  
};

Watershed.prototype.pull = function(time,limit) {
  var amount = this.volumepermonth[ time % 12 ];
  if(amount > limit) amount = limit;
  return amount;
};

Watershed.prototype.reset = function(_begins,_ends) {}

Watershed.prototype.step = function(time) {}

//
// A reservoir object
//

function Reservoir(_name) {
  this.name = _name;
  this.volume = 0;              // current amount of water in reservoir
  this.maximumrate = 100;       // maximum amount reservoir can accept per step without breaking
  this.maximumtotal = 1000;     // maximum size of reservoir
  this.actors = new Array();    // associated actors
}

Reservoir.prototype.reset = function(_begins,_ends) {
  this.volume = 0;
}

Reservoir.prototype.attach = function(actor) {
  this.actors[this.actors.length] = actor;
  return actor;
}

Reservoir.prototype.step = function(time) {
  for(var i = 0; i < this.actors.length; i++) {
    var actor = this.actors[i];
    var amount = actor.pull(time,this.maximumrate);
    this.volume += amount;
    if(this.volume > this.maximumtotal) this.volume = this.maximumtotal; // spillage? force downstream?
  }
  //console.debug("Reservoir " + this.name + " volume is " + this.volume );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A simulation manager.... 
// ... this collects other objects (we may want to also extend this power to base classes)
// ... Choosing where powers are concentrated is tricky; some capabilites are of the simulation, some are methods on the objects

function Simulation(_name,_begins,_ends) {
  this.name = _name;
  this.begins = _begins;
  this.ends = _ends;
  this.time = this.begins;
  this.actors = new Array();
};

Simulation.prototype.attach = function(actor) {
  this.actors[ this.actors.length ] = actor;
  return actor;
};

Simulation.prototype.reset = function(_begins,_ends) {
  this.begins = _begins;
  this.ends = _ends;
  this.time = this.begins;
  for(var j = 0; j < this.actors; j++ ) {
    var actor = this.actors[j];
    actor.reset(_begins,_ends);
  }
}

Simulation.prototype.step = function(time) {
  for(var j = 0; j < this.actors.length; j++ ) {
    var actor = this.actors[j];
    actor.step(time);
  }
  this.time = time;
}

Simulation.prototype.advance = function() {
  this.step(this.time+1);
}

Simulation.prototype.run = function(begins,ends) {
  this.reset(begins);
  for(var time = begins; time < ends; time++) {
    console.log("running step " + time);
    this.step(time);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// - this portion down should have a ux that users can build things with
// - load / save etc





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// setup a sim
// ... this would effectively be in "user land" - something a typical user might make

var simulation = new Simulation("California Drought",7000,7100);

var model1 = new Watershed("Guadalupe Watershed");
var model2 = new Reservoir("Guadalupe Reservoir");

simulation.attach(model1);
simulation.attach(model2);

model2.attach( model1 );

/*
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// attach some viz to the data
// ... threejs rendering

var obj1 = makegeom(  0,0,0,   50,  0xff0000 );
var obj2 = makegeom(300,0,0,   50,   0x00ff00 );

// xxx draw connections

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// run in backdrop for a while

var interval = null;

function animation_callback() {
  if( simulation.advance() == false) {
    window.clearInterval(interval);
  }

  // this should move into the object
  var scale = model2.volume / 100;
  if(scale<1)scale = 1;
  obj1.scale.set(scale,scale,scale);

}


function animate_simulation() {
  interval = window.setInterval(animation_callback,10);

}

animate_simulation();

*/

