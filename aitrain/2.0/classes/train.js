export class Bogie {
  constructor(car, pos) {
    this.car = car
    this.position = pos
  }
}

export class Traction extends Bogie {
  constructor() {
    super() 
  }
}

export class Car {
  constructor() {}
}

export class Engine extends Car {
  constructor() {
    super()
  }
}