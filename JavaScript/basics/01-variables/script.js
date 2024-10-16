// Let declaration
{
    let firstName="Pema";
    let secondName="Rinchen";

    console.log(firstName+" "+secondName);

    let age=21;
    console.log(age)


    let score;
    score =1;
    console.log(score);

    if(score){
        age=age+1;
    }

    console.log(age)
}

{
    // const declaration
    const firstName="Pema";
    const lastName="Rinchen";
    console.log(firstName+" "+lastName);

    const pi=3.142;
    // pi=3.142323 not possible you cannot reasign the const variab;e

    const number=[1,2,3,4];
    // number=[1,2,3,4,] this will also result in error

    // Array and object can be maniupualte using methods
    number.push(5);
    console.log(number);

    const person={
        name:"Pema Rinchen",
        age:21,
        isStudent:true,
    }

    person.name="Sonam Rinchen" // this is possible because i am changing the propetry not the variable itself
    person.email="pemarinchen675@gmail.com"
    console.log(person)
}

{
    // multiple values declaration

    let a,b,c;
    const d=10,e=20;
    console.log(a,b,b)
    console.log(d,e)
}