let tileSize=100, mode='createMap', loop=0

const mapData=[
  '000053555322330333',
  '050015553313303313',
  '051225513555322320',
  '033233553553122200',
  '002203233335322120',
  '012033235313223223',
  '023213215332223323',
  '332223235322153315',
  '012222235322355535',
  '232301555222351555',
  '323203555331233355',
  '322135555555222300',
  '332323512553321000',
  '312355323512202033',
  '533351225533223213',
  '535555235523333322',
]

const mapI=mapData[0].length+0*120, mapJ=mapData.length+0*80,
      mapWidth=(2*mapI+1)*1/2*tileSize,
      mapHeight=(mapJ)*4/4*tileSize/Math.cos(Math.PI/6),
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
      C={x:mapWidth/2,y:mapHeight/2,z:4,v:10/9},
      M={
        b:{},
        get sx() {return (this.x-innerWidth/2)*C.z},
        get sy() {return (this.y-innerHeight/2)*C.z}
      },
      Game={
        locations:[],
        terrain:[],
        PCs:[],
        get pendingPCs() {
          return this.PCs.filter(pc=>!pc.done)
        }
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
    shoot:4,
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
    shoot:4,
  },
  'shotgun':{
    idle:20,
    melee_attack:15,
    move:20,
    reload:20,
    shoot:4,
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


