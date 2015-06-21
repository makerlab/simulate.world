//
// I could support concepts like links, people, organizations and the like in a variety of ways.
// For now I am using the JS namespace to define them as first class objects with links to each other as needed by name
// Another way would be to make them first class objects and actually link them together
//

var topic_resources = {

label:"resource",
art:"",
children:[

{
label:"Digital Democracy",
url:"http://www.digital-democracy.com",
tags:"link,org,climate,social",
},

{
label:"MIT Climate CoLab",
art:"model_oil.jpg",
url:"http://climatecolab.org",
tags:"link, org, climate, social",
notes:"The Climate CoLab is a project of the MIT Center for Collective Intelligence. It allows you to work with people from all over the world to create proposals for what to do about climate change. There are a series of contests that phrase specific problems and then users submit proposals which are voted on. Some of the models are quite detailed and may have real utility: <a href='http://climatecolab.org/web/guest/plans/-/plans/contestId/1301419/planId/1316105'>Carbon Value through Utilization</a>. Also they had a reddit AMA here <a href='http://www.reddit.com/r/science/comments/32ww7t/science_ama_series_im_prof_thomas_malone_from_the/'>MIT CoLab Reddit AMA</a>"
},

{
label:"The Cultural Cognition Project",
url:"http://www.culturalcognition.net/",
tags:"link, org, climate, social",
notes:"The Cultural Cognition Project is a group of scholars interested in studying how cultural values shape public risk perceptions and related policy beliefs. Cultural cognition refers to the tendency of individuals to conform their beliefs about disputed matters of fact (e.g., whether global warming is a serious threat; whether the death penalty deters murder; whether gun control makes society more safe or less) to values that define their cultural identities. Project members are using the methods of various disciplines -- including social psychology, anthropology, communications, and political science -- to chart the impact of this phenomenon and to identify the mechanisms through which it operates. The Project also has an explicit normative objective: to identify processes of democratic decisionmaking by which society can resolve culturally grounded differences in belief in a manner that is both congenial to persons of diverse cultural outlooks and consistent with sound public policymaking.",
},

{
label:"NASA Study Concludes When Civilization Will End",
url:"http://mic.com/articles/85541/nasa-study-concludes-when-civilization-will-end-and-it-s-not-looking-good-for-us",
tags:"link, article, existential, threats, media, nasa, emotion",
notes:"Update: NASA is now clarifying its role in this study. NASA officials released this statement on the study on March 20, which seeks to distance the agency from the paper: 'A soon-to-be published research paper, 'Human and Nature Dynamics (HANDY): Modeling Inequality and Use of Resources in the Collapse or Sustainability of Societies' by University of Maryland researchers Safa Motesharrei and Eugenia Kalnay, and University of Minnesota's Jorge Rivas, was not solicited, directed or reviewed by NASA. It is an independent study by the university researchers utilizing research tools developed for a separate NASA activity. As is the case with all independent research, the views and conclusions in the paper are those of the authors alone. NASA does not endorse the paper or its conclusions.' Read the original story below.",
},

{
label:"Human and Nature Dynamics (HANDY): Modeling Inequality and Use of Resources in the Collapse of Sustainability in Societies",
tags:"link, paper, existential, threats, media, ecology, model",
url:"http://www.sciencedirect.com/science/article/pii/S0921800914000615",
notes:"In this paper, we build a human population dynamics model by adding accumulated wealth and economic inequality to a predator–prey model of humans and nature. The model structure, and simulated scenarios that offer significant implications, are explained. Four equations describe the evolution of Elites, Commoners, Nature, and Wealth. The model shows Economic Stratification or Ecological Strain can independently lead to collapse, in agreement with the historical record.",
parent:"Safa Motesharrei, Eugenia Kalnay, Jorge Rivas",
},

{
label:"The National Socio-Environmental Synthesis Center",
tags:"link, org, climate, social",
url:"http://www.sesync.org/",
notes:"The National Socio-Environmental Synthesis Center (SESYNC) is dedicated to accelerating scientific discovery at the interface of human and ecological systems. We support new interdisciplinary collaborations that pursue data-driven solutions to pressing socio-environmental problems. SESYNC features a range of services from project inception through results dissemination, including supporting the team science process, meeting planning and facilitation, travel and logistical support, and cyberinfrastructure resources. SESYNC is funded by an award to the University of Maryland from the National Science Foundation.",
},


{
label:"Safa Motesharrei",
tags:"person",
parent:"University of Maryland, The National Socio-Environmental Synthesis Center",
},

{
label:"Eugenia Kalnay",
tags:"person",
parent:"University of Maryland, The National Socio-Environmental Synthesis Center",
},

{
label:"Jorge Rivas",
tags:"person",
parent:"University of Minnesota, The National Socio-Environmental Synthesis Center",
},

{
label:"Californa is so over",
tags:"link, article, california, drought",
url:"http://www.thedailybeast.com/articles/2015/04/19/big-idea-california-is-so-over.html",
notes:"California’s drought and how it’s handled show just what kind of place the Golden State is becoming: feudal, super-affluent and with an impoverished interior.",
},

{
label:"How Growers Games California's Drought",
tags:"link, article, california, drought, growers, crops, water",
notes:"Consuming 80 percent of California’s developed water but accounting for only 2 percent of the state’s GDP, agriculture thrives while everyone else is parched.",
url:"http://www.thedailybeast.com/articles/2015/03/30/how-growers-gamed-california-s-drought.html",
},

{
label:"Everything I thought I knew about water in California is wrong",
tags:"link, article, california, drought, water",
url:"http://grist.org/food/everything-i-thought-i-knew-about-water-in-california-is-wrong/",
notes:"This piece started out as a confident prescription for California’s drought ills. But when I began writing, I kept coming across things that seemed confusing or contradictory. And each time I went to the experts to clarify, they’d explode all my basic assumptions.",
},

{
label:"The Dying Sea",
tags:"link, article, california, drought, water, salton sea",
url:"http://www.newyorker.com/magazine/2015/05/04/the-dying-sea",
notes:"The San Diego Water Authority has taken pains to present the problems at the Salton Sea as far outside the scope of the water transfer.",
},



{
label:"Smarter Cleanup",
tags:"link, org, model, simulation, community, water",
url:"http://smartercleanup.org",
art:"http://smartercleanup.org/smc/wp-content/uploads/2015/06/duwamish_homepage_background-800x440.jpg",
notes:"We are a coalition of community organizers whose mission is to optimize collective knowledge and resources to address environmental health issues over the next century. We do this by pairing the latest open source technology with good old fashioned community building. We call it collective cartography.",
},

{
label:"Rethinking Extinction",
tags:"link, article, existential, emotion, positive",
url:"http://aeon.co/magazine/science/why-extinction-is-not-the-problem/",
art:"http://cdn-imgs-mag.aeon.co/images/2015/04/Phanerozoic_Biodiversity.jpg",
notes:"Viewing every conservation issue through the lens of extinction threat is simplistic and usually irrelevant. Worse, it introduces an emotional charge that makes the problem seem cosmic and overwhelming rather than local and solvable. It’s as if the entire field of human medicine were treated solely as a matter of death prevention. Every session with a doctor would begin: ‘Well, you’re dying. Let’s see if we can do anything to slow that down a little.’",
parent:"Stewart Brand",
},

{
label:"Stewart Brand",
tags:"person",
parent:"The Long Now Foundation",
},

{
label:"The Great Grief: How to cope with losing our world",
tags:"link, article, existential, emotion, grief",
url:"http://www.commondreams.org/views/2015/05/14/great-grief-how-cope-losing-our-world",
notes:"To cope with losing our world requires us to descend through the anger into mourning and sadness, not speedily bypass them to jump onto the optimism bandwagon or escape into indifference. And with this deepening, an extended caring and gratitude may open us to what is still here, and finally, to acting accordingly.",
},

{
label:"What animals are likely to go extinct first due to climate change",
tags:"link, article, existential, emotion, grief",
url:"http://news.nationalgeographic.com/2015/04/150430-extinction-climate-warming-animals-species-conservation-wildlife/?sf8919812=1",
notes:"One in six species could disappear as the climate warms over the next century, with animals and plants in South America particularly hard hit while those in North America  would face the lowest risk, according to a major new analysis published Thursday.",
parent:"National Geographic",
},

{
label:"Weaponized Sacredness",
tags:"link, article, hyperobject, philosophy, cognition, reasoning",
url:"http://www.ribbonfarm.com/2015/05/07/weaponized-sacredness/",
notes:"Why does a phenomenon so seemingly inevitable in hindsight go unforeseen? ",
},

{
label:"Building an alternative to Hierarchy: Rhizome Theory",
tags:"link, article, cognition, reasoning, social",
url:"http://www.jeffvail.net/2008/02/building-alternative-to-hierarchy.html",
notes:"This third essay in a five-part series, The Problem of Growth, looks at the theoretical requirements for a sustainable alternative to hierarchy.",
},

{
label:"Collapse Comes of Age",
tags:"link, article, existential",
url:"http://therationalpessimist.com/tag/existential-risks/",
notes:"However, Bostrom extends this concept to take in scope: whether a particular risk is limited to a locality or whether it is all encompassing. This produces a risk matrix ",
},

{
label:"Future of Humanity Institute",
tags:"link, org, existential",
url:"http://www.fhi.ox.ac.uk/",
notes:"The Future of Humanity Institute is a multidisciplinary research institute at the University of Oxford.  It enables a select set of leading intellects to bring the tools of mathematics, philosophy, and science to bear on big-picture questions about humanity and its prospects.  The Institute belongs to the Faculty of Philosophy and is affiliated with the Oxford Martin School.",
},

{
label:"Centre for the Study of Existential Risk",
tags:"link, org, existential",
url:"http://cser.org/",
notes:"The Centre for Study of Existential Risk is an interdisciplinary research centre focused on the study of human extinction-level risks that may emerge from technological advances. We aim to combine key insights from the best minds across disciplines to tackle the greatest challenge of the coming century: safely harnessing our rapidly-developing technological power.",
},

{
label:"Global Catastrophic Risk",
tags:"link, reference, wikipedia",
url:"http://en.wikipedia.org/wiki/Global_catastrophic_risk",
art:"http://upload.wikimedia.org/wikipedia/commons/thumb/6/64/X-risk-chart-en-01a.svg/1000px-X-risk-chart-en-01a.svg.png",
notes:"A global catastrophic risk is a hypothetical future event with the potential to seriously damage human well-being on a global scale.[2] Some events could destroy or cripple modern civilization. Other, even more severe, events could cause human extinction.[3] These are referred to as existential risks.",
},


{
label:"The Collapse of Complex Societies",
tags:"link, article, existential, social, organization",
url:"http://www.historytoday.com/christopher-chippindale/collapse-complex-societies",
notes:"When and why do states, empires and civilisations collapse? When and why do they survive and prosper despite all perils? Is there a pattern in their history, even a pattern that indicates a best path for the world today? These questions, above all the great collapse of the western Roman Empire, have concerned historians since Gibbon. The value of Tainter's new comparative study is to look at the larger pattern of other collapses beyond the usual handful of examples.",
},

{
label:"Human Extinction",
tags:"link, article, futurism, existential",
url:"http://aeon.co/magazine/philosophy/ross-andersen-human-extinction/",
notes:"Last December I came face to face with a Megalosaurus at the Oxford University Museum of Natural History. I was there to meet Nick Bostrom, a philosopher who has made a career out of contemplating distant futures, hypothetical worlds that lie thousands of years ahead in the stream of time. Bostrom is the director of Oxford’s Future of Humanity Institute, a research collective tasked with pondering the long-term fate of human civilisation. He founded the institute in 2005, at the age of 32, two years after coming to Oxford from Yale. Bostrom has a cushy gig, so far as academics go. He has no teaching requirements, and wide latitude to pursue his own research interests, a cluster of questions he considers crucial to the future of humanity.",
},

{
label:"Nick Bostrom",
tags:"person",
parent:"Future of Humanity Institute",
},

{ label:"Dianne Ackerman", tags:"person", },
{ label:"Charles Darwin", tags:"person", },
{ label:"Jared Diamond", tags:"person", },
{ label:"Paul Hawken", tags:"person", },
{ label:"Derrek Jensen", tags:"person", },
{ label:"Elizabeth Kolbert", tags:"person", },
{ label:"Gaia Vince", tags:"person", },
{ label:"Cadillac Desert", tags:"person", },
{ label:"Antifragile", tags:"person", },
{ label:"Intertwingled", tags:"person", },
{ label:"Stephen Lansing", tags:"person", },
{ label:"EO Wilson", "tags":"person", },

/*


eo wilson
paul hawken
derrek jensen
elizabeth kolbert - the sixth extinction
gaia vince - adventures in the anthropocene
under a green sky
jared diamond
the human age - dianne ackerman
charles darwin
cadillac desert
antifragile?
intertwingled?
author of that wolf yellowstone thing
stephen lansing bali thing
.
interesting companies and organizations
http://globaia.org/portfolio/cartography-of-the-anthropocene/
climate.com
esri

who else?

Cadillac Desert
Emergent Properties of Balinese Water Temples - JS Lansing
New California Water Atlas
At home on this Moveable Earth - William Kloefkorn
At Home On Earth - David Landis Barnhill
The Human Age - Diane Ackerman
Distributed Hydrological Modeling - K J Beven
The Alexandria Digital Earth Modeling System
The Playful World - Mark Pesce
Earth System Modeling Framework (ESMF)

http://www.reddit.com/r/science/comments/32ww7t/science_ama_series_im_prof_thomas_malone_from_the/

deep - free diving 

*/


]};



