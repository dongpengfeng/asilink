export const CONSTANT = {
  VERSION: "VERSION_NUM:BUILDNR",
  DEFAULT_PASSWORD: "8R!GHWzj!Z*G89VGW3dm6mgRheVVPM#kuijwML45L70pxXKwYAYB2pmPvWGxTVfN",
  DEFAULT_SALT: "657c59a622030c54c7e3e3b59fb0f97e",
  HTTPTIMEOUT: 30000,
  CREATEADDRSNUM: 20,
  DEFAULT_COIN: {
    name: "Asim",
    coinSlug: "Asim",
    coinName: "Asim",
    coinType: 10003,
    icon: "Asim",
    addressPrefix: "Asim",
    asset: '000000000000000000000000',
    unit: "Asim",
    balance: 0
  },
  DEFAULT_ASSET: '000000000000000000000000',
  COINS: [{
    name: "Asim",
    coinSlug: "Asim",
    coinName: "Asim",
    coinType: 10003,
    icon: "Asim",
    addressPrefix: "Asim",
    asset: '000000000000000000000000',
    unit: "Asim",
    balance: 0,
    height: 200000
  }],
  DEPLOY_CONTRACT_SENDAMOUNT: 0,
  DEFAULT_CURRENCY: "USD",
  CURRENCY_DETAIL: [
    { symbol: 'CNY', icon: "flag_icon_china.jpg" },
    { symbol: 'USD', icon: "flag_icon_unitedstates.jpg" }
  ],
  LANGUAGES: [
    { language: "简体中文", shorthand: "zh", icon: "china" },
    { language: "English", shorthand: "en", icon: "england" }
  ],
  MNEMONICLANGUAGES: [
    "chinese_simplified",
    "chinese_traditional",
    "english",
    "french",
    "italian",
    "japanese",
    "spanish"
  ],
  WordListNameDict: {
    en: "english",
    zh: "chinese_simplified"
  },
  DEFAULT_NETWORK: {
    color: '#02BA3D',
    value: 'work',
    name: 'Work'
  },
  NETWORKS: [{
    color: '#02BA3D',
    value: 'work',
    name: 'Work Network'
  }, {
    color: '#0076ff',
    value: 'tech',
    name: 'Tech Network'
  }, {
    color: '#FF8200',
    value: 'testnet',
    name: 'Test Network'
  }],
  PASSWORD_REG: /^[A-Za-z0-9`~!@#$%^&*()_\-+={}\[\]\\|:;"'<>,.?/]{8,}$/,
  ADDRESS_REG: /^0x[a-fA-F0-9]{42}$/,
  CONTRACT_ADDRESS_REG: /^0x63[a-fA-F0-9]{40}$/,
  TOSATOSHI: Math.pow(10, 8),
  ASSETINFO_ABI: [{ "constant": true, "inputs": [{ "name": "assetIndex", "type": "uint32" }], "name": "getAssetInfo", "outputs": [{ "name": "", "type": "bool" }, { "name": "", "type": "string" }, { "name": "", "type": "string" }, { "name": "", "type": "string" }, { "name": "", "type": "uint32" }, { "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }],
  ASSETINFO_ABI_NAME: 'getAssetInfo'
};
