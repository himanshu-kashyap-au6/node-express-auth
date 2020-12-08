const arr = ['a', 'b', 'c', 'd']
const objA = {}
const objB = {a: 1, b: 2}
arr.map((field)=>{
    if(objB.hasOwnProperty(field)){
        objA[field] = objB[field]
    }
})

console.log(Object.keys(objA).length === 0)
console.log(isNaN('1'))