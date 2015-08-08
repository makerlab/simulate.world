
Feature = Backbone.Model.extend({
  initialize: function() {
    // encapsulates a server storable beefy base class description of a visible actor in the sim:
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


I would like to have a list of

  - all towns where people live - to get a total of people
  - all of the water use per place per person

  - all of the farms

  - all of the water sources { ground water, surface water }
  - reservoirs
  - aqueducts

  - what do farms consume? what do they produce?
  - what do towns consume?

groundwater
	1.05km3 or 850,000 acre feet of water stored in 450 known groundwater reservoirs
	About 50% usable due to quality and cost of pumping water from ground
	Overdrafting pulls 2.7km3 from state and about 0.99km3 from central valley
	Unsure how they can pull more than there is

180 gallons per person per day including water in homes, and our share of local industry
         (local restaraunts, schools, offices)

1430 gallons per person is total used given total water in usa / total pop
        this includes agriculture and cooling power plants

hydrologic regions
// http://i1.wp.com/ww2.kqed.org/lowdown/wp-content/uploads/sites/26/2014/01/statewide-water.png

"North Coast",       people:  700000, gpcd:115
"Sacramento River",  people: 2900000, gpcd:174,
"San Francisco",     people: 6300000, gpcd:103,
"San Joaquin River", people: 2000000, gpcd:159,
"Central Coast",     people: 1500000, gpcd:109,
"Tulare",            people: 2000000, gpcd:180,
"South Lahontan",    people:  800000, gpcd:176,
"South Coast",       people:19000000, gpcd:126,
"Colorado River",    people:  700000, gpcd:255,

// http://www.nytimes.com/interactive/2015/04/01/us/water-use-in-california.html?_r=0

"Los Angeles",       people: 3900000,
"San Diego",         people: 1300000,
"San Jose",          people: 1016000,
"San Francisco",     people:  852469,
"Fresno",            people:  515986,
"California",        people:38000000,
... (i have a more detailed file of this)

// systems
"The State Water Project"
"The Central Valley Project"
"Colorado River Systems"
"The Los Angeles Aqueduct"
"Hetch Hetchy Aqueduct"
"Mokelumne Aqueduct"
"North Bay"


city
 - electricity
 - water
 - oil
 - 

farm
 - oil
 - water
 + food
















