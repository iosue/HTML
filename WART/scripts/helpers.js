Math.maxAbs=(...N)=>{
  let max = -1, m = 0,
      A = N.map(n=>Math.abs(n))
  for (const n in A) {
    if (A[n]>max) {
      max = A[n]
      m = n
    }
  }
  return N[m]
}

Math.minAbs=(...N)=>{
  let min = Infinity, m = 0,
      A = N.map(n=>Math.abs(n))
  for (const n in A) {
    if (A[n]<min) {
      min = A[n]
      m = n
    }
  }
  return N[m]
}

