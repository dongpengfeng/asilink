let env = process.env.NODE_ENV
var cfg = {
  env: (env == 'development' ? 0 : 1),
  RateDomain: 'http://webforex.hermes.hexun.com',
  chainRPC: 'http://127.0.0.1:8545',
  activeURL: '*',
  work: {
    rpc: 'https://dev-rpc.asimov.work/rpc8545/'
  },
  tech: {
    rpc: 'https://dev-rpc.asimov.tech/rpc8545/'
  },
  testnet: {
    rpc: 'https://test-rpc.asimov.network'
  }
}
if (env == 'production') {
  cfg.activeURL = 'app.flow.cm';
}

export default cfg
