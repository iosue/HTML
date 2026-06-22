export function deg(a) {
  return a*Math.PI/180
}

export function normalizeAngle(a) {
  while (a<0) a+= (Math.PI*2)
  return a % (Math.PI*2)
}

