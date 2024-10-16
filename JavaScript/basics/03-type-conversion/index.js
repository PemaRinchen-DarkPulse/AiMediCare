// String TO Number 
{
    {
        //ParseInt
        let amount='100';
        console.log("Using ParseInt")
        console.log(amount,typeof amount)
        amount=parseInt(amount)
        console.log(amount,typeof amount)
    }

    {
        //Unary Opearator
        let amount='100';
        console.log("Using Unary")
        console.log(amount,typeof amount)
        amount=+amount;
        console.log(amount,typeof amount)
    }
    {
        //Constructor Opearator
        let amount='100';
        console.log("Using Constructor")
        console.log(amount,typeof amount)
        amount=Number(amount);
        console.log(amount,typeof amount)
    }

}