class Blob {
  constructor(x,y,color) {
    this.w = 26
    this.h = 28
    this.x = x
    this.y = y
    this.color = color
    this.u = 0
    this.v = -10
    this.a = 0
    this.b = 0
    this.f = 0
    this.g = 0
    this.jump = 10
    this.gravity = 0.25
    this.facing = 1
    this.traction = 0
    this.friction = 0
    this.grounded = 0
    this.jumping = 0
    this.suicide = 0
    this.pose = 'still'
  }

  get keys() {
    return [
      { left:'KeyA', right:'KeyD', jump:'KeyW', down:'KeyS'},
      { left:'KeyJ', right:'KeyL', jump:'KeyI', down:'KeyK'},
      { left:'ArrowLeft', right:'ArrowRight', jump:'ArrowUp', down:'ArrowDown'},
      { left:'Numpad4', right:'Numpad6', jump:'Numpad8', down:'Numpad5'},
    ][this.color]
  }

  get top    () {return this.y-this.h/2}
  get left   () {return this.x-this.w/2}
  get right  () {return this.x+this.w/2}
  get bottom () {return this.y+this.h/2}


  get sprite() {
    return {
      jumping:     [40,.0],
      rising:      [40,40],
      falling:     [.0,.0],
      blocked:     [80,.0],
      decelerating:[.0,40],
      still:       [40,40],
      accelerating:[80,40],
      dec_water:   [.0,80],
      still_water: [40,80],
      acc_water:   [80,80],
    }[this.pose]
  }



  


  draw(ctx=CTX['pcs']) {
    ctx.save()
    ctx.translate(this.x,this.y)
    ctx.scale(this.facing,1)
    ctx.drawImage(
      CVS['bmp'],
      32*22+this.sprite[0]+6, this.color*120+this.sprite[1]+6,
      this.w+4, this.h+4,
      -2-this.w/2, -2-this.h/2,
      this.w+4, this.h+4
    )
    ctx.restore()
  }

  applyPhysics() {
    const next={
      w: 24,
      h: 28,
      get top    () {return this.y-this.h/2},
      get left   () {return this.x-this.w/2},
      get right  () {return this.x+this.w/2},
      get bottom () {return this.y+this.h/2},
      set top    (y) {this.y = y+this.h/2},
      set left   (x) {this.x = x+this.w/2},
      set right  (x) {this.x = x-this.w/2},
      set bottom (y) {this.y = y-this.h/2},
    }

    if (K[this.keys.down]) {
      if (this.suicide++>180) {
        this.suicide = 0
        delete K[this.keys.down]
        return this.die()
      }
    } else {
      this.suicide = 0
    }

    this.jumping = Math.max(this.jumping,K[this.keys.jump]?1:0)

    next.f = (K[this.keys.right]??0)-(K[this.keys.left]??0)
    next.a =-this.u*this.friction+next.f*this.traction
    next.u = this.u+next.a
    next.u = Math.sign(next.u)*Math.floor(Math.abs(next.u)*10)/10
    next.x = this.x+next.u

    next.g = this.grounded&&this.jumping?-this.jump:0
    next.b = this.gravity+next.g
    next.v = this.v+next.b
    next.v = Math.sign(next.v)*Math.floor(Math.abs(next.v)*10)/10
    next.y = this.y+next.v

    // this.collide(next)
    
    next.grounded = 0
    next.jumping = Math.max(0,this.jumping-.1)
    next.bouncing = 0
    next.traction = 0.5
    next.friction = 0.5
    next.blocked = 0
    next.pose = 0

    this.next = next

  }

  bump() {
    for (const that of Game.pcs) {
      if (that==this) continue

      let dx = that.next.x-this.next.x,
          dy = that.next.y-this.next.y,
          D = Math.hypot(dy,dx),
          A = Math.atan2(dy,dx)
        A+=Math.PI*2
        A%=Math.PI*2
      if (D < this.w) {
        if (Math.PI*1/4 < A && A<Math.PI*3/4) {
          this.next.v-=10
          return that.die()
        }

        if (this.x>that.x) {
          this.next.left = (this.next.x+that.next.x)/2
          if (this.next.f<0) this.next.blocked = 1
          else this.next.pose = 'decelerating'
        } else {
          this.next.right = (this.next.x+that.next.x)/2
          if (this.next.f>0) this.next.blocked = 1
          else this.next.pose = 'decelerating'
        }
        // this.next.f = that.f/2
        this.next.a = that.a
        this.next.u = that.u
      }
    }
  }






  collide(next=this.next) {
    for (const tile of Game.tiles) if (tile.type>0) {
  
      let columnOverlap = this.right>tile.left && this.left<tile.right
      if (columnOverlap) {
        let fromAbove = this.bottom<=tile.top && next.bottom>=tile.top
        if (fromAbove) {
          if (tile.type==4 && next.x>tile.left && next.x<tile.right) next.bouncing = 1
          next.bottom = tile.top
          next.v = next.bouncing||next.jumping?-8:0
          next.b = 0
          next.grounded = true
          next.traction = Math.max(tile.traction,next.traction)
          next.friction = Math.max(tile.friction,next.friction)
        }
        let fromBelow = this.top>tile.bottom && next.top<tile.bottom
        if (fromBelow) {
          next.top = tile.bottom
          next.v = 0
          next.b = 0
        }
      }

      let rowOverlap = this.bottom>tile.top && this.top<tile.bottom
      if (rowOverlap) {
        let fromLeft = this.right<=tile.left && next.right>tile.left
        if (fromLeft) {
          next.right = tile.left
          next.u = 0
          next.a = 0
          next.blocked = next.f>0
        }
        let fromRight = this.left>=tile.right && next.left<tile.right
        if (fromRight) {
          next.left = tile.right
          next.u = 0
          next.a = 0
          next.blocked = next.f<0
        }
      }

    }

    if (next.left < settings.screenLeft) {
      next.left = settings.screenLeft
      next.u = 0
      next.a = 0
      next.blocked = next.f<0
    }
    if (next.x+this.w/2 > settings.screenRight) {
      next.right = settings.screenRight
      next.u = 0
      next.a = 0
      next.blocked = next.f>0
    }
    if (next.bottom > settings.screenBottom) {
      next.bottom = settings.screenBottom
      next.v = 0
      next.grounded = true
      next.traction = 1
      next.friction = 1/10
    }
  
    return next
  }

    update() {
    for (const prop of Object.keys(this.next)) {
      const desc = Object.getOwnPropertyDescriptor(this.next,prop)
      if (desc.set||desc.get) continue
      this[prop]=this.next[prop]
    }

    console.log(this.pose,this.next.pose)
    this.pose = this.next.pose||
              (
                (this.suicide&&(this.suicide+2)%4)?'still':this.suicide>110?'blocked':this.suicide>50?'accelerating'
                  :this.next.jumping
                  ?'jumping'
                  :Math.abs(this.v)>0.05
                    ?this.next.v<0
                      ?'rising'
                      :'falling'
                    :this.next.blocked
                      ?'blocked'
                      :Math.abs(this.next.a)>0.05
                        ?Math.sign(this.next.a)==Math.sign(this.next.u)
                          ?this.next.inWater?'acc_water':'accelerating'
                          :this.next.inWater?'dec_water':'decelerating'
                        :this.next.inWater?'still_water':'still'
              )
    console.log(this.pose,this.next.pose)
    this.facing = this.next.u>0
                    ?1 
                    :this.next.u<0
                      ?-1
                      :this.suicide>20&&this.suicide%4==0
                          ?-this.facing
                          :+this.facing
    delete K[this.keys.jump]
    this.draw()
  }





  die() {
    this.next.a=0; this.next.u=0; this.next.x=0;
    this.next.b=0; this.next.v=0; this.next.y=0;
    let airTiles = Game.tiles.filter(tile=>tile.type==0)
    let newTile = airTiles[Math.floor(Math.random()*airTiles.length)]
    this.next.x = newTile.x
    this.next.y = newTile.y
    Game.spatter.push(new Spatter(this.rgb,this.u,this.v,this.x,this.y))
  }

}


class Spatter {
  constructor(color,u,v,x,y) {
    this.chunks = []
    for (let i=0;i<8+Math.floor(Math.random()*4);i++)
    this.chunks.push(new Chunk(color,u,v,x,y))
  }

  draw(ctx=CTX['map']) {
    if (this.chunks.filter(chunk=>!chunk.stopped).length==0) {
      ctx=CTX['bmp']
      Game.spatter.splice(Game.spatter.indexOf(this),1)
    }
    this.chunks.forEach(chunk=>chunk.draw(ctx))
  }
}

class Chunk {
  constructor(color,u,v,x,y) {
    this.color = color
    this.u = u+Math.random()*8-4
    this.v = v+Math.random()*6-3
    this.x = x
    this.y = y
    this.rotation = Math.PI*2*Math.random()
    this.friction = 0.01
    this.gravity = 0.25
  }
  get top    () {return this.y-this.h/2}
  get left   () {return this.x-this.w/2}
  get right  () {return this.x+this.w/2}
  get bottom () {return this.y+this.h/2}

  update() {
    const next={
      w: 8,
      h: 8,
      get top    () {return this.y-this.h/2},
      get left   () {return this.x-this.w/2},
      get right  () {return this.x+this.w/2},
      get bottom () {return this.y+this.h/2},
      set top    (y) {this.y = y+this.h/2},
      set left   (x) {this.x = x+this.w/2},
      set right  (x) {this.x = x-this.w/2},
      set bottom (y) {this.y = y-this.h/2},
    }

    next.a =-this.u*this.friction
    next.u = this.u+next.a
    next.u = Math.sign(next.u)*Math.floor(Math.abs(next.u)*10)/10
    next.x = this.x+next.u

    next.b = this.gravity
    next.v = this.v+next.b
    next.v = Math.sign(next.v)*Math.floor(Math.abs(next.v)*10)/10
    next.y = this.y+next.v

    this.collide(next)
    
    this.next = next
    for (const prop of Object.keys(this.next)) {
      const desc = Object.getOwnPropertyDescriptor(this.next,prop)
      if (desc.set||desc.get) continue
      this[prop]=this.next[prop]
    }
  }

  collide(next) {
    for (const tile of Game.tiles) if (tile.type>0) {
      
      let columnOverlap = next.right>tile.left && next.left<tile.right
      if (columnOverlap) {
        let fromAbove = this.bottom<=tile.top && next.bottom>=tile.top
        if (fromAbove) {
          next.bottom = tile.top
          next.v = 0
          next.b = 0
        }
        let fromBelow = this.top>tile.bottom && next.top<tile.bottom
        if (fromBelow) {
          next.top = tile.bottom
          next.v = 0
          next.b = 0
        }
      }

      let rowOverlap = next.bottom>tile.top && next.top<tile.bottom
      if (rowOverlap) {
        let fromLeft = this.right<=tile.left && next.right>tile.left
        if (fromLeft) {
          next.right = tile.left
          next.u = 0
          next.a = 0
        }
        let fromRight = this.left>=tile.right && next.left<tile.right
        if (fromRight) {
          next.left = tile.right
          next.u = 0
          next.a = 0
        }
      }
    }

    if (next.left < settings.screenLeft) {
      next.left = settings.screenLeft
      next.u = 0
      next.a = 0
    }
    if (next.x+this.w/2 > settings.screenRight) {
      next.right = settings.screenRight
      next.u = 0
      next.a = 0
    }
    if (next.bottom > settings.screenBottom) {
      next.bottom = settings.screenBottom
      next.v = 0
      next.friction = 1
    }
  
    next.stopped = next.u<0.05 && next.v<0.05
    // console.log(next)
    return next
  }

  draw(ctx) {
    this.update()
    ctx.save()
    ctx.translate(this.x,this.y)
    ctx.rotate(this.rotation)
    ctx.beginPath()
    ctx.roundRect(-4,-4,8,8,2)
    ctx.fillStyle=`hsl(000 75 35)`
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-1,0)
    ctx.lineTo(1,+5)
    ctx.lineTo(5,0)
    ctx.lineTo(1,-5)
    ctx.closePath()
    ctx.fillStyle=`rgb(${this.color.join()})`
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle='#fffc'
    ctx.fillRect(0,0,2,2)
    ctx.fillStyle='#000c'
    ctx.fillRect(-3,-4,3,2)
    ctx.restore()
  }
}