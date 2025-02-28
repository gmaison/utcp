
function calculateValue(data) {
  if (data.length > 10) {
    return data.length * 2;
  } else {
    return data.length;
  }
}

function calculateValue(items) {
  if (items.length > 10) {
    return items.length * 2;
  } else {
    return items.length;
  }
}

const processData = (data) => {
  if (data.length > 10) {
    console.log("Data is longer than expected");
    return data.length * 2;
  } else {
    console.log("Data length is acceptable");
    return data.length;
  }
};
