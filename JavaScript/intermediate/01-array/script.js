{
  const fruits = ["Apple", "Mango", "Banana"];
  let list = "";

  for (let i = 0; i < fruits.length; i++) {
    list += `<li>${fruits[i]}</li>`;
  }
  let fruitList = document.getElementById("list");
  fruitList.innerHTML = list;
}

{
  const fruits = [
    {
      name: "Apple",
      price: 12,
      isNeed: true,
    },
    {
      name: "Mango",
      price: 20,
      isNeed: false,
    },
    {
      name: "Banana",
      price: 25,
      isNeed: true,
    },
  ];
  let list = "";
  let total = 0;
  for (let i = 0; i < fruits.length; i++) {
    if (fruits[i].isNeed) {
      list += `<li>${fruits[i].name}</li>`;
      total += fruits[i].price;
    }
  }
  let fruitList = document.getElementById("list-name");
  fruitList.innerHTML = list;
  let price = document.getElementById("price");
  price.innerText = total;
}
