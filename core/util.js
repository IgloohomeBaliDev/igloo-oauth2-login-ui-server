class Util {
  constructor() {}

  randomNumber(maxFrame) {
    let return_ = Math.floor(Math.random() * 99999999 + 1).toString();
    let frame = 0;
    if (maxFrame <= 0) {
      maxFrame = 1;
    }
    while (frame < maxFrame) {
      return_ = return_ + "" + Math.floor(Math.random() * 99999999 + 1);
      frame = frame + 1;
    }
    return return_;
  }

  randomStringShuffle(input, length) {
    const a = input.split(""),
      n = a.length;

    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    const result = a.join("").substr(0, length);

    return result;
  }

  randomRangeInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}

export default Util;
