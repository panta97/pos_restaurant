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

export { getCurrentTime };
