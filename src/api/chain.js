import { rpc } from '@service/request';

export const chain = {
    searchrawtransactions(params) {
        return rpc('asimov_searchRawTransactions', params);
    },
    searchrawtransactionsbyaddrs(addrs) {
        return rpc('asimov_searchAllRawTransactions', [addrs, true, true, false]);
    },
    sendrawtransaction(params) {
        return rpc('asimov_sendRawTransaction', params);
    },
    getmempooltransactions(params) {
        return rpc('asimov_getMempoolTransactions', params);
    },
    calculatecontractaddress(params) {
        return rpc('asimov_calculateContractAddress', params);
    },
    getcontractaddressesbyassets(params) {
        return rpc('asimov_getContractAddressesByAssets', params);
    },
    callreadonlyfunction(params) {
        return rpc('asimov_callReadOnlyFunction', params);
    },
    gettransactionsbyaddresses(params) {
        return rpc('asimov_getTransactionsByAddresses', params);
    },
    getfeelist(params) {
        return rpc('asimov_getFeeList', params);
    },
    getblockchaininfo(params) {
        return rpc('asimov_getBlockChainInfo', params);
    },
    getEstimateGas(params) {
        return rpc('asimov_estimateGas', params);
    },
    getAssetsInfo(params) {
        return rpc("asimov_getAssetInfoList", params);
    },
    getbalances(params) {
        return rpc('asimov_getBalances', params);
    },
    getutxoinpage(params) {
        return rpc('asimov_getUtxoInPage', params);
    }
};
