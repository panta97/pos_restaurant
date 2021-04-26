const toSqlTime = (dateTime: Date) => {
  return `${dateTime.getFullYear()}-${String(dateTime.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(dateTime.getDate()).padStart(2, "0")} ${String(
    dateTime.getHours()
  ).padStart(2, "0")}:${String(dateTime.getMinutes()).padStart(
    2,
    "0"
  )}:${String(dateTime.getSeconds()).padStart(2, "0")}`;
};

const getCurrentTime = () => {
  return toSqlTime(new Date());
};

const snakeToCamel = (str: string) => {
  return str.replace(/([-_]\w)/g, (g) => g[1].toUpperCase());
};

// @ts-ignore
const toCamelCase = (array) => {
  // @ts-ignore
  return array.map((obj) => {
    let auxObj = {};
    Object.entries(obj).map(([key, val]) => {
      // @ts-ignore
      auxObj[snakeToCamel(key)] = val;
    });
    return auxObj;
  });
};

export { getCurrentTime, toCamelCase };
