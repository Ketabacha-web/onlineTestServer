export const Log = (text) => {
  const textSize = text.length;
  const addMoreSpace = 10;

  //   console.log(textSize);

  // console.clear();

  console.log();

  console.log("+", "-".repeat(textSize + addMoreSpace), "+");
  console.log(
    "|",
    " ".repeat(addMoreSpace / 2 - 1),
    text.toUpperCase(),
    " ".repeat(addMoreSpace / 2 - 1),
    "|"
  );
  console.log("+", "-".repeat(textSize + addMoreSpace), "+");

  // console.log();
  // console.log();
  // console.log();
};
