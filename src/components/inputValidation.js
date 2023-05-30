// FUNCTION FOR FILTERING INPUT OF THE USER!
function inputValidation(res, str, key) {
  // FILTER KEYS STORED IN AN ARRAY
  const filterKeys = [
    "<",
    ">",
    "{",
    "}",
    "[",
    "]",
    "&",
    "!",
    "/",
    "\\",
    '"',
    "'",
    "=",
    "+",
    "*",
    "%",
    ";",
    ",",
  ];

  // IF INPUT HAS INCLUDES THE FILTER KEYS ARRAY STRINGS PUSHED IN TEMP ARRAY AS OBJECT
  const temp = [];

  // MAP INTO THE FILTER KEYS ARRAY TO FIND IF INPUT INCLUDES OR NOT
  filterKeys.map((fkey) => {
    if (str.toLowerCase().includes(fkey)) {
      temp.push({
        key,
        msg: `you are not allowed to input invalid charactars like \"${fkey}\"`,
      });
    }
  });

  // IF TEMP ARRAY IS EMPTY
  if (!temp.length) {
    // RETURN TRUE WHICH MEAN STRING HAS NOT ANY INVALID CHARACTER
    return true;
  } else {
    // IF TEMP ARRAY NOT EMPTY
    res.status(404).json({
      login: false,
      msg: `${key} contains invalid characters`,
    });
    // RETURN FALSE WHICH MEAN STRING HAS ANY INVALID CHARACTER
    return false;
  }
}

export default inputValidation;
