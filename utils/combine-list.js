export default function combineList(list1, list2, { key = 'id', flag } = {}) {
  const map = list1.reduce((map, item) => {
    map[item[key]] = item;
    return map;
  }, {});
  const newItems = [];
  for (const item of list2) {
    if (!map[item[key]]) {
      newItems.push(item);
    }
  }
  const newList = [...list1, ...newItems];
  if (flag) {
    newList[flag] = true;
  }
  return newList;
};