<template>
  <div class="wallets-container">
    <div class="wlt-wrapper">
      <fw-item
        v-for="(item,key) in walletArr"
        :key="key"
        :line="true"
        class="hover-cell"
        @click="handleClickWallet(item)"
        :class="{'select-cell':selectedWallet.id == item.id}"
      >
        <template slot="left">
          <div class="left">
            <div class="choose-line" v-if="selectedWallet.id == item.id"></div>
            <fw-icon path="icons/wallet_b@2x.png"></fw-icon>
            <div class="wallet-name">{{item.name}}</div>
          </div>
        </template>
        <template slot="right">
          {{selectedWallet.id == item.id ? $t('common_using'):''}}
          <fw-icon path="icons/cell_arrow@2x.png" size="x-small" class="arrow-img"></fw-icon>
        </template>
      </fw-item>
    </div>
    <el-button-group>
      <el-button type="default" @click="$router.push('/import-wallet')">
        <img src="/images/icons/wallet_g@2x.png" />
        <span>{{$t('start_import_wallet')}}</span>
      </el-button>
      <el-button type="default" @click="$router.push('/set-password')">
        <img src="/images/icons/inputwallet_s_16p@2x.png" />
        <span>{{$t('start_new_wallet')}}</span>
      </el-button>
    </el-button-group>
  </div>
</template>
<script>
import Storage from "@service/storage";
import Wallets from "@service/wallets";

export default {
  name: "wallets",
  data() {
    return {
      walletArr: [],
      selectedWallet: {}
    };
  },
  async created() {
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

    for (let i = 0; i < this.walletArr.length; i++) {
      if (activeId === this.walletArr[i].id) {
        this.walletArr.unshift(this.walletArr.splice(i, 1)[0]);
        this.selectedWallet = this.walletArr[0];
        break;
      }
    }
  },
  methods: {
    handleClickWallet(wallet) {
      let active = false;
      if (wallet.id === this.selectedWallet.id) {
        active = true;
      }
      this.$router.push({
        name: "manage-wallet",
        params: { wallet, active }
      });
    },
    showUnfinished() {
      this.$message({
        message: this.$t("common_incomplete"),
        type: "error",
        duration: 3 * 1000
      });
    }
  }
};
</script>
<style lang="scss">
.wallets-container {
  width: 528px;
  height: 452px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ededed;
  padding: 24px 0 0;
  position: relative;

  .wlt-wrapper {
    height: 350px;
    overflow-y: auto;
  }

  .select-cell {
    background: #f5f7fa;
  }

  .fw-item {
    padding: 0 32px;
    height: 56px;
    .line {
      left: 72px;
    }

    .left {
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #282828;
      position: relative;
      padding-left: 16px;
      .choose-line {
        position: absolute;
        width: 2px;
        height: 24px;
        background: #0076ff;
        top: 16px;
        left: 0;
      }

      .wallet-name {
        max-width: 250px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: 1.2;
      }
      img {
        margin: 16px;
      }
    }

    .right {
      font-size: 12px;
      color: #0076ff;
      font-weight: 700;
      height: 12px;
      line-height: 1;
      .arrow-img {
        margin: 0 0 0 8px;
        vertical-align: middle;
      }
    }
  }

  .el-button-group {
    position: absolute;
    bottom: 32px;
    left: 112px;

    button {
      padding: 12px 10px;
      width: 192px;

      & > span {
        width: 100%;
        display: block;
        height: 12px;
        position: relative;

        img {
          position: absolute;
          width: 16px;
          top: -2px;
          left: 0;
        }

        span {
          font-size: 12px;
          display: block;
          height: 12px;
        }
      }
    }
  }
}
</style>