const sizeMap = {
  '2xs': '10px',
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
  '6xl': '60px',
  '7xl': '72px',
}
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    // 内边距
    padding: Array.from({ length: 1000 }).reduce((map, _, index) => {
      map[index] = `${index * 4}px`
      return map
    }, {}),
    // 外边距
    spacing: Array.from({ length: 1000 }).reduce((map, _, index) => {
      map[index] = `${index * 4}px`
      return map
    }, {}),
    // 圆角
    borderRadius: {
      ...Array.from({ length: 100 }).reduce((map, _, index) => {
        map[index] = `${index}px`
        return map
      }, {}),
      ...Array.from(Object.keys(sizeMap)).reduce((map, key) => {
        map[key] = sizeMap[key]
        return map
      }, {}),
      full: '45%',
    },
    extend: {
      // 宽度
      width: Array.from({ length: 1000 }).reduce((map, _, index) => {
        map[index] = `${index * 4}px`
        return map
      }, {}),
      // 高度
      height: Array.from({ length: 1000 }).reduce((map, _, index) => {
        map[index] = `${index * 4}px`
        return map
      }, {}),
      // 字体大小
      fontSize: Array.from({ length: 100 }).reduce((map, _, index) => {
        map[index] = `${index}px`
        return map
      }, {}),
      // 行高
      lineHeight: Array.from({ length: 1000 }).reduce((map, _, index) => {
        map[index] = `${index * 4}px`
        return map
      }, {}),
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      }
    },
  },
  plugins: [],
}
