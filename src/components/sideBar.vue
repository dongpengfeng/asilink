<template>
  <div class="fw-sidebar-container">
    <transition appear v-if="showMain" name="main">
      <div class="main">
        <ul>
          <li class="wallet-info">
            <div class="name">{{walletName}}</div>
            <div class="address">
              {{address}}
              <img
                src="/images/icons/copy_s_16p@2x.png"
                @click="handleCopy(address,$event)"
              />
            </div>
          </li>
          <li
            v-for="(item,key) in assets"
            :key="key"
            @click="handleSelectAsset(item,key,$event)"
            :class="{selected:item.asset===selectAsset,'hover-cell':true}"
            class="asset-li"
          >
            <div class="detail">
              <img class="icon" :src="'/images/coins/coin_icon_'+item.icon+'.jpg'" />
              <div class="data">
                <span class="name">{{item.coinName}}</span>
                <span class="amount">{{item.balance|sts2btc(isIndivisibleAsset(item.asset))}}</span>
                <span class="unit">{{item.unit}}</span>
              </div>
            </div>
          </li>
        </ul>
        <el-dialog
          :visible.sync="dialogVisible"
          width="52%"
          height="272px"
          :modal="false"
          :before-close="handleClose"
        >
          <div class="hideInfo">{{$t('hide_tips',{value:coinName})}}</div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">{{$t('common_cancel')}}</el-button>
            <el-button type="primary" @click="dialogVisible = false">{{$t('common_confirm')}}</el-button>
          </span>
        </el-dialog>
      </div>
    </transition>
    <div class="close-toggle" @click="toggleSideBar"></div>
  </div>
</template>

<script>
import handleClipboard from "@utils/clipboard";
import Storage from "@service/storage";
import { isIndivisibleAsset } from "@utils";

export default {
  name: "fw-side-bar",
  data() {
    return {
      coinName: null,
      showMain: true,
      dialogVisible: false,
      walletName: "",
      address: ""
    };
  },
  props: ["assets", "autoClose"],
  methods: {
    handleSelectAsset(asset) {
      this.$store.dispatch("setSelectedCoin", asset);
      this.toggleSideBar();
      this.$emit("change", asset);
    },
    toggleSideBar() {
      (this.showMain = false),
        setTimeout(() => {
          this.$emit("toggle-side-func", false);
        }, 500);
    },
    handleClose(done) {
      const msg = this.$t("common_confirm") + " " + this.$t("common_close");
      this.$confirm(msg)
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    handleCopy(data, $event) {
      this.$message({
        message: this.$t("copy_success"),
        type: "success",
        duration: 2 * 1000
      });
      handleClipboard(data, $event);
    },
    isIndivisibleAsset
  },
  computed: {
    selectAsset() {
      return (
        this.$store.state.wltState.selectedCoin.asset ||
        this.$store.state.wltState.assets[0].asset
      );
    }
  },
  async created() {
    const allAddrs = await Storage.get("walletAddrs");
    const { walletId, name } = this.$store.state.wltState.info;
    this.walletName = name;
    this.address = allAddrs[walletId][0][0].address;
  },
  watch: {
    autoClose() {
      this.toggleSideBar();
    }
  }
};
</script>

<style lang="scss" >
@import "./sideBar.scss";
</style>