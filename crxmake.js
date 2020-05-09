const crx3 = require('crx3');

crx3(['build/manifest.json'], {
    keyPath: './build.pem',
    crxPath: './build.crx'
  })
  .then(() => console.log('done'))
  .catch(console.error)
