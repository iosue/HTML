let tileSize=100, mode='createMap', loop=0

const mapI=120, mapJ=80, PCs=[],
      mapWidth=(2*mapI+1)*1/2*tileSize,
      mapHeight=(mapJ)*3/4*tileSize/Math.cos(Math.PI/6),
      canvasWidth=tileSize+mapWidth+tileSize,
      canvasHeight=tileSize+mapHeight+tileSize,
      settings={
        layers:[
          {name:"bmp",},
          {name:"map",live:true,scale:true},
          {name:"pth",live:true,scale:true},
          {name:"pcs",live:true,scale:true},
          {name:"gui",live:true,},
          {name:"test",live:true,scale:true}
        ],
      },
      CVS={},CTX={},K={},
      C={x:mapWidth/2,y:mapHeight/2,z:20,v:10/9},
      M={
        b:{},
        get sx() {return (this.x-innerWidth/2)*C.z},
        get sy() {return (this.y-innerHeight/2)*C.z}
      },
      Game={
        locations:[],
        terrain:[],
      }
let pause=false

const Sprites={}
const SpriteList={
  'feet':{
    idle:1,
    run:20,
    strafe_left:20,
    strafe_right:20,
    walk:20,
  },
  'flashlight':{
    idle:20,
    melee_attack:15,
    move:20,
  },
  'handgun':{
    idle:20,
    melee_attack:15,
    move:20,
    reload:15,
    shoot:3,
  },
  'knife':{
    idle:20,
    melee_attack:15,
    move:20,
  },
  'rifle':{
    idle:20,
    melee_attack:15,
    move:20,
    reload:20,
    shoot:3,
  },
  'shotgun':{
    idle:20,
    melee_attack:15,
    move:20,
    reload:20,
    shoot:3,
  }
}


const Kits={
  "Rifleman":{}
}
const Ranks={
  e:[
    {name:"Conscript"},
    {name:"Recruit"},
    {name:"Private"},
    {name:"Specialist"},
    {name:"Private"},
    {name:"Lance Corporal"},
    {name:"Corporal"},
    {name:"Master Corporal"},
    {name:"Lance Sergeant"},
    {name:"Sergeant"},
    {name:"Master Sergeant"},
  ]
}


const Weapons={
  'rifle':{
    spread: 0.1
  }
}

