'use strict';


function Record(value, uses) {
  this.active = true;
  this.uses = uses || Infinity;
  this.value = value;
}

module.exports = Record;
Record.prototype.constructor = Record;


Record.prototype.is = function is(record) {
  return (record === this || record === this.value);
};

Record.prototype.use = function use() {
  if (!this.active || this.uses < 1) {
    throw new Error('Can\'t use an inactive record');
  }

  this.uses--;
  this.active = (this.uses >= 1);

  return this.value;
};
