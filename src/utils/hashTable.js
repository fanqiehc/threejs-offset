function equals(l, r) {
  return l[0] === r[0] && l[1] === r[1] && l[2] === r[2];
}

class Hashtable {
  constructor(cap) {
    const initialBits = 12;
    this.cap = 1 << initialBits;
    while (this.cap < cap) {
      this.cap = this.cap << 1;
    }
    this.mask = this.cap - 1;
    this.data = new Array(this.cap);
    this.size = 0;
    this.conflict = 0;
  }

  hash(key) {
    if (!key) {
      return 0;
    }
    let h = key[0] * 171 + key[1] * 1934969 + key[2] * 83492791;
    h = ~~h;
    h = h > 0 ? h : -h;
    return h & this.mask;
  }

  set(key, value) {
    const hash = this.hash(key);
    if (!this.data[hash]) {
      this.data[hash] = [[key, [value]]];
    } else {
      for (var i = 0; i < this.data[hash].length; i++) {
        if (equals(this.data[hash][i][0], key)) {
          this.data[hash][i][1].push(value);
          return;
        }
      }
      this.data[hash].push([key, [value]]);
      this.conflict += 1;
    }
    this.size++;
  }
}

module.exports = { Hashtable };
