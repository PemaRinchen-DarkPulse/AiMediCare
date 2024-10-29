// Declartaion
const myFirstArray=new Array();
const mySecondArray=[];


let numbers=[1,2,4,8];
console.log(`original Array : ${numbers} \n`);
console.log(`Printing Element using Index: ${numbers[0]} \n`);

numbers[1]=6;
console.log(`After Changing the Elemnt Using Index: ${numbers} \n`)
numbers[4]=16;
console.log(`After Adding An Element using Index:${numbers}\n`);

// property 
let myArraylength=numbers.length;
console.log(`\n Array Length : ${myArraylength} \n`);

// Array Methods
numbers.push(32);
console.log(`After Push: ${numbers} \n`);

numbers.unshift(0);
console.log(`After Unshift: ${numbers} \n`);

let lastNumber=numbers.pop();
console.log(`After Pop: ${numbers}`,`last nmber: ${lastNumber}\n`)

let firstNumber=numbers.shift()
console.log(`After Shift: ${numbers}`,  `first Number: ${firstNumber}\n`)

lastNumber=numbers.at(-1);
console.log(`last Number of Array: ${lastNumber}\n`)
// Mixed Array

const myArray=["Apple",[1,2,3],{name:"Pema",age:12,}, function greet(){
    console.log("Hello From Me"),true
}]


// For Loop
for(let i=0;i<myArray.length;i++){
    console.log(`At index ${i}: ${myArray[i]}`);
}

// for Of
for(let i of myArray){
    console.log(i)
}

// for in
for(let i in myArray){
    console.log(myArray[i])
}
