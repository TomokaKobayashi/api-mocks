module.exports = {
  default: {
    requiredSetting: [
      {
        level: 1,
        pattern: [
          /^\[[0-9]+\]\.tags$/
        ]
      },
      {
        level: 0,
        pattern: [
          /^\[[0-9]+\]\.tags\[[0-9]+\]\.name$/
        ]
      }
    ]
  }
}
