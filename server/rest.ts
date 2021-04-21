const get_products = async () => {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", process.env.API_KEY!);
  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  // fetch(process.env.API_URL!, requestOptions)
  //   .then((response) => response.text())
  //   .then((result) => console.log(result))
  //   .catch((error) => console.log("error", error));
  const response = await fetch(process.env.API_URL!, requestOptions);
  const products = await response.json();
  return products;
};

export { get_products };
