export default function substractList(list1, list2, { key = 'id', flag } = {}) {
  const map = list2.reduce((map, item) => {
    map[item[key]] = item;
    return map;
  }, {});
  const newList = list1.filter((item) => !map[item[key]]);
  if (flag) {
    newList[flag] = true;
  }
  return newList;
};