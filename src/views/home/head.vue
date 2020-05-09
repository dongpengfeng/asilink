<template>
  <div class="fw-head-container">
    <div class="logo">
      <img src="/images/icons/logo_m@2x.png" />
    </div>
    <fw-select
      class="network-container"
      :selected="selectedNetwork"
      :visible="netToggle"
      @changeVisible="handlePanel('net')"
    >
      <template slot="prefix">
        <span class="prefix_radius_selected" :style="'background-color:'+selectedNetwork.color"></span>
      </template>
      <template slot="options">
        <div
          class="option_wrap hover-cell"
          v-for="(network,index) in networks"
          :key="index"
          :value="network.value"
          @click.stop="handleSelectNetwork(network,$event,index)"
          :class="{'select-cell':network.value==selectedNetwork.value}"
        >
          <span class="prefix_radius" :style="'background-color:'+network.color"></span>
          <span class="option_name">
            {{network.name}}
            <fw-icon
              v-if="network.value==selectedNetwork.value&&!delMode"
              path="icons/menu_coin_mark@2x.png"
              size="small"
            ></fw-icon>
            <fw-icon
              v-if="network.custom&&delMode"
              path="icons/delete_wallet_r@2x.png"
              size="small"
            ></fw-icon>
          </span>
        </div>
        <div class="extra_wrap">
          <div v-if="!delMode" @click.stop="handleAddNetwork">{{$t("add_network")}}</div>
          <div
            v-if="!delMode"
            :class="{'no-delete':!canDelete}"
            @click.stop="changeDelMode"
          >{{$t("del_network")}}</div>
          <div class="delDone" v-else @click.stop="delMode=false">{{$t('common_done')}}</div>
        </div>
      </template>
    </fw-select>
    <div class="my-wallet">
      <fw-select
        class="network-container"
        :selected="selectedWallet"
        :visible="walletToggle"
        @changeVisible="handlePanel('wallet')"
      >
        <template slot="options">
          <div
            class="option_wrap hover-cell"
            v-for="(wallet,index) in walletArr"
            :key="index"
            :value="wallet.id"
            @click="handleSelectWallet(wallet,$event)"
            :class="{'select-cell':wallet.id==selectedWallet.id}"
          >
            <fw-icon path="icons/wallet_b@2x.png" size="normal"></fw-icon>
            <div class="option_name">
              <span>{{wallet.name}}</span>
              <fw-icon
                v-if="wallet.id==selectedWallet.id"
                path="icons/menu_coin_mark@2x.png"
                size="small"
              ></fw-icon>
            </div>
          </div>
        </template>
      </fw-select>
      <img src="/images/icons/setting_b@2x.png" class="option" @click="toggleSideBar" />
    </div>
    <fw-dialog
      :title="$t('add_network')"
      :visible.sync="networkAddDialogVisible"
      @confirm="handleConfirmAddNetwork"
    >
      <el-input
        class="fw-input large"
        :placeholder="$t('password_input')"
        v-model.trim="networkAddr"
      ></el-input>
    </fw-dialog>

    <fw-dialog
      :title="$t('del_network')"
      :visible.sync="networkDelDialogVisible"
      @confirm="handleDeleteNetwork"
    >
      <p style="color:#282828;fontSize:16px;textAlign:center">{{$t('confirm_del_net')}}</p>
      <p
        style="color:#282828;fontSize:16px;textAlign:center;marginTop:16px"
      >"{{networks[deleteIndex]?networks[deleteIndex].name:""}}"</p>
    </fw-dialog>
  </div>
</template>
<script>
import * as _ from "lodash";
import Wallets from "@service/wallets";
import Cache from "@service/cache";
import { CONSTANT } from "@/constant";
import Storage from "@service/storage";
import Wallet from "@classes/Wallet";
import Cfg from "@/cfg";
import { addNetService } from "@service/request";

export default {
  name: "fw-head",
  props: ["checkChange"],
  data() {
    let network = Cache.getNetwork();
    let customNetwork = Cache.getCustomNetwork();
    return {
      sideBar: this.toggleSide,
      selectedNetwork: network,
      networkAddDialogVisible: false,
      networkDelDialogVisible: false,
      canClick: true,
      networkAddr: "",
      customNetwork: customNetwork,
      walletArr: [],
      selectedWallet: {},
      walletToggle: false,
      netToggle: false,
      delMode: false,
      deleteIndex: 0
    };
  },
  computed: {
    walletInfo() {
      return this.$store.state.wltState.info;
    },
    networks() {
      for (let network of this.customNetwork) {
        network.custom = true;
      }
      return CONSTANT.NETWORKS.concat(this.customNetwork);
    },
    rpcBase() {
      const keys = Object.keys(Cfg) || [];
      for (let i = 0, len = keys.length; i < len; i++) {
        if (!Cfg[keys[i]] || !Cfg[keys[i]].rpc) {
          keys.splice(i, 1);
        }
      }
      return keys;
    },
    canDelete() {
      return this.networks.length > CONSTANT.NETWORKS.length;
    }
  },
  async created() {
    if (this.$route.params.changeWallet) {
      this.handlePanel("wallet");
    }
    const allWallet = await Storage.get("walletInfo");
    const walletsOrder = await Storage.get("walletsOrder");

    for (let walletId of walletsOrder) {
      for (let id in allWallet) {
        if (walletId === id) {
          this.walletArr.push({
            id,
            name: allWallet[id].name
          });
          break;
        }
      }
    }

    const activeId = Wallets.getActiveWltId();
    for (let wallet of this.walletArr) {
      if (activeId === wallet.id) {
        this.selectedWallet = wallet;
        break;
      }
    }

    await this.activeWalletToTop();
  },
  methods: {
    changeDelMode() {
      if (this.canDelete) {
        this.delMode = true;
      }
    },
    handlePanel(name) {
      this[name + "Toggle"] = !this[name + "Toggle"];
      switch (name) {
        case "wallet":
          this.netToggle = false;
          this.$emit("closeSideBar");
          break;
        case "net":
          this.walletToggle = false;
          this.$emit("closeSideBar");
          break;
        default:
          this.netToggle = false;
          this.walletToggle = false;
          break;
      }
    },
    handleConfirmAddNetwork() {
      if (!this.networkAddr) {
        this.$message({
          type: "error",
          message: this.$t("network_name_empty"),
          duration: 2 * 1000
        });
        return;
      }

      let index_value = _.findIndex(this.networks, o => {
        return o.value == this.networkAddr;
      });

      let index_name = _.findIndex(this.networks, o => {
        return o.name == this.networkAddr;
      });

      if (index_name == -1 && index_value == -1) {
        let networkObj = {
          color: "#" + Math.floor(Math.random() * 0xffffff).toString(16),
          value: this.networkAddr,
          name: this.networkAddr
        };

        this.customNetwork.push(networkObj);
        Cache.setCustomNetwork(this.customNetwork);

        this.networkAddDialogVisible = false;
        this.$message({
          type: "success",
          message: this.$t("add_net_success"),
          duration: 2 * 1000
        });
      } else {
        this.$message({
          type: "error",
          message: this.$t("rpc_exist"),
          duration: 2 * 1000
        });
      }
    },
    handleAddNetwork() {
      this.networkAddr = "";
      this.networkAddDialogVisible = true;
    },
    handleSelectNetwork(network, event, i) {
      if (this.delMode) {
        if (i >= CONSTANT.NETWORKS.length) {
          if (
            this.selectedNetwork.name === this.networks[i].name &&
            this.selectedNetwork.value === this.networks[i].value
          ) {
            this.$message({
              type: "warning",
              message: this.$t("cannot_del_current_network"),
              duration: 2000
            });
            return;
          }
          this.deleteIndex = i;
          this.networkDelDialogVisible = true;
        } else {
          this.$message({
            type: "error",
            message: this.$t("cannot_del_default_network"),
            duration: 2000
          });
        }
      } else {
        this.selectedNetwork = network;
        Cache.setNetwork(network);
        let rpcBaseUrl = "";
        if (this.rpcBase.includes(network.value)) {
          rpcBaseUrl = Cfg[network.value].rpc;
        } else {
          rpcBaseUrl = network.value;
        }
        addNetService(rpcBaseUrl);
        this.$store.commit("clearAssets");
        this.$store.dispatch("queryAllBalance");
        this.$message({
          type: "success",
          message: this.$t("change_net"),
          duration: 2000
        });
        this.netToggle = false;
      }
    },
    handleDeleteNetwork() {
      this.networks.splice(this.deleteIndex, 1);
      this.customNetwork.splice(this.deleteIndex - CONSTANT.NETWORKS.length, 1);
      Cache.setCustomNetwork(this.customNetwork);
      this.networkDelDialogVisible = false;
      this.$message({
        type: "success",
        message: this.$t("del_network_suc"),
        duration: 2000
      });
    },
    toggleSideBar() {
      this.$router.push("/setting");
    },
    async handleSelectWallet(wallet) {
      if (Wallets.getActiveWltId() != wallet.id) {
        await Wallets.setActiveWltId(wallet.id);
        let walletInfo = await Storage.get("walletInfo");
        let activeWalletInfo = walletInfo[wallet.id];
        const wlt = new Wallet();
        await wlt.wake(activeWalletInfo);
        this.$store.dispatch("queryAllBalance");
        this.selectedWallet = wallet;
        await this.activeWalletToTop();

        this.$message({
          type: "success",
          message: this.$t("switch_wallet_success"),
          duration: 2000
        });

        this.$emit("changeWallet");
        chrome.runtime.sendMessage({
          type: "HAD_FLOWMASK_LOGIN_OUT",
          result: {
            success: true
          }
        });
      }
    },
    async activeWalletToTop() {
      for (let i = 0; i < this.walletArr.length; i++) {
        if (this.selectedWallet.id === this.walletArr[i].id) {
          this.walletArr.unshift(this.walletArr.splice(i, 1)[0]);
          break;
        }
      }
      const walletsOrder = [];
      for (let walletObj of this.walletArr) {
        walletsOrder.push(walletObj.id);
      }
      await Storage.set("walletsOrder", walletsOrder);
    }
  },
  watch: {
    checkChange() {
      this.delMode = false;
      this.handlePanel();
    }
  }
};
</script>
<style lang="scss">
.fw-head-container,
.my-wallet {
  display: flex;
  align-items: center;
  .title {
    text-align: right;
    display: inline-block;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
  }
  .select-cell {
    background: #f5f7fa;
  }
}

.fw-head-container {
  width: 100%;
  padding: 0 20px;
  z-index: 3;
  height: 64px;
  border-bottom: 1px solid #e3e3e3;
  background: white;
  position: fixed;
  .logo {
    flex-shrink: 0;
    width: 103px;
    img {
      width: 100%;
      vertical-align: middle;
    }
  }

  .option-container {
    overflow-y: auto;
    max-height: 300px;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
    line-height: 1.2;
  }
  .network-container {
    margin-left: 17px;
    .prefix_radius_selected {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background-color: red;
      margin-left: 2px;
      margin-right: 10px;
    }
    .option_wrap {
      display: flex;
      align-items: center;
      width: 280px;
      height: 48px;
      line-height: 48px;
      padding-right: 16px;
      .prefix_radius {
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 8px;
        background-color: red;
        margin-left: 20px;
        margin-right: 20px;
      }
      .option_name {
        position: relative;
        display: inline-block;
        height: 48px;
        line-height: 48px;
        flex-grow: 1;
        padding-right: 16px;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 208px;
        cursor: pointer;
        img {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          margin: auto;
        }
      }
    }

    .option_wrap + .option_wrap .option_name {
      border-top: 1px solid #ededed;
    }
    .extra_wrap {
      display: flex;
      width: 100%;
      height: 48px;
      font-size: 12px;
      color: #0076ff;
      text-align: center;
      font-weight: bold;
      border-top: 1px solid #ededed;
      justify-content: space-between;
      align-items: center;
      line-height: 36px;
      div {
        width: 50%;
        height: 36px;
        cursor: pointer;
      }
      div + div {
        border-left: 1px solid #ededed;
      }
      .delDone {
        width: 100%;
      }
      .no-delete {
        color: #9d9d9d;
        cursor: not-allowed;
      }
    }
  }
}

.my-wallet {
  font-size: 16px;
  margin-left: auto;
  div {
    cursor: pointer;
  }
  .arrow-down {
    width: 12px;
    vertical-align: text-top;
    margin-left: 12px;
  }
  .option {
    margin-left: 26px;
    width: 24px;
    cursor: pointer;
  }
  .option:hover {
    animation: rotateMode 1s linear infinite backwards;
    @keyframes rotateMode {
      0% {
        transform: rotate(0);
      }
      100% {
        transform: rotate(180deg);
      }
    }
  }

  .fw-select-wrap {
    background: none !important;
    .name {
      font-size: 16px !important;
      line-height: 1.2;
    }
    .arrow-down {
      margin-left: 12px !important;
    }
  }
  .option-container {
    right: 0;
    left: auto !important;
    width: 280px;
    .option_wrap {
      width: 100% !important;
      padding-left: 16px;
      & > * {
        flex-shrink: 0;
      }
    }
    .option_name {
      border: none !important;
      margin-left: 16px;
      font-weight: 400 !important;
      width: calc(100% - 40px) !important;
      span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        line-height: 48px;
        width: 150px;
      }
      .icon-small {
        margin: 0 32px 0 16px;
      }
    }
  }
}
</style>
