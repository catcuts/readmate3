export default function combineList(list1, list2) {
  const map = list1.reduce((map, item) => {
    map[item.name] = item;
    return map;
  }, {});
  const newFiles = [];
  for (const file of list2) {
    if (!map[file.name]) {
      newFiles.push(file);
    }
  }
  return [...list1, ...newFiles];
};