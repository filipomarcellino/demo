function fetchData(callback) {
  var data = "Data from somewhere";
  callback(data, true);
}

fetchData((data, error) => {
  if (error != null) {
    console.log('Error fetching data.');
    return;
  }
  console.log(data);
});

let arr=[1,2,3,4]
arr.forEach(elem=>{
  console.log(elem);
})
