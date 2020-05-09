<template>
  <div class="manege-wallet__container">
    <fw-nav url="/setting">
      <template class="left-box" slot="left">
        <span>{{$t('me_manage_wallets')}}</span>
      </template>
      <template slot="right">
        <div class="delete-btn active-btn" @click="visibleDelete=true">{{$t('me_wallet_delete')}}</div>
      </template>
    </fw-nav>
    <div class="content__container">
      <div class="wallet-name-address__container">
        <div class="wallet-name-edit">
          <div class="wallet-name">{{wltInst?wltInst.name:''}}</div>
          <div class="edit-btn active-btn" @click="visibleEdit = true">{{$t('edit_name')}}</div>
        </div>
        <div class="address">
          {{$t('common_address')}}&nbsp;&nbsp;
          <span>{{firstAddr}}</span>
        </div>
      </div>
      <div class="eye">
        <img width="76" height="76" src="@static/images/icons/hide@2x.png" alt />
      </div>

      <div class="btn-group">
        <p
          v-if="wltInst&&wltInst.entropy"
          @click="showMnemonicHandle"
          class="btn active-btn"
        >{{$t('show_mn')}}</p>
        <p v-else class="btn active-btn" @click="showPrivateKeyHandle">{{$t('show_private_key')}}</p>
        <p @click="showPublicKeyHandle" class="btn active-btn">{{$t('show_pk')}}</p>
      </div>
    </div>
    <ModalEditWalletName
      :visible="visibleEdit"
      :walletName="walletInfo.name"
      @close="()=>{ handleClose('Edit') }"
      @save="handleGetWalletName"
    />
    <ModalMnemonicWords
      :visible="visibleMnemonic"
      :words="mnemonics"
      @close="()=>{ handleClose('Mnemonic') }"
    ></ModalMnemonicWords>
    <ModalPublicKey
      :visible="visiblePublicKey"
      :publicKey="publicKey"
      @close="()=>{ handleClose('PublicKey') }"
    ></ModalPublicKey>
    <ModalPrivateKey
      :visible="visiblePrivateKey"
      :privateKey="privateKey"
      @close="()=>{ handleClose('PrivateKey') }"
    ></ModalPrivateKey>
    <ModalDeleteWallet
      :visible="visibleDelete"
      @close="()=>{ handleClose('Delete') }"
      @delete="handleDeleteWallet"
    />
    <ModalAuthPassword
      :visible="visiblePassword"
      :tip="tip"
      @close="()=>{ handleClose('Password') }"
      @confirm="handleConfirmPassword"
    />
    <ModalBackChange :visible="gotoChange" />
  </div>
</template>
<script>
import Cache from "@service/cache";
import ModalEditWalletName from "@components/ModalEditWalletName";
import ModalMnemonicWords from "@components/ModalMnemonicWords";
import ModalPublicKey from "@components/ModalPublicKey";
import ModalPrivateKey from "@components/ModalPrivateKey";
import ModalDeleteWallet from "@components/ModalDeleteWallet";
import ModalAuthPassword from "@components/ModalAuthPassword";
import ModalBackChange from "@components/ModalBackChange";
import Wallets from "@service/wallets";
import Storage from "@service/storage";
import Wallet from "@classes/Wallet";
import Address from "@service/address";
import { getWalletPubKey } from "@utils";

export default {
  name: "ManageWallet",
  components: {
    ModalEditWalletName,
    ModalMnemonicWords,
    ModalDeleteWallet,
    ModalAuthPassword,
    ModalBackChange,
    ModalPublicKey,
    ModalPrivateKey
  },
  data() {
    return {
      visibleEdit: false,
      visibleMnemonic: false,
      visibleDelete: false,
      visiblePassword: false,
      visiblePublicKey: false,
      visiblePrivateKey: false,
      verifyType: "",
      firstAddr: "",
      mnemonics: [],
      publicKey: "",
      tip: "common_confirm_pw",
      privateKey: "",
      walletInfo: {
        name: ""
      },
      wltInst: {},
      gotoChange: false,
      addrAmount: 0,
      allWalletsName: []
    };
  },
  async created() {
    const { wallet, active } = this.$route.params;
    const walletInfo = await Storage.get("walletInfo");
    const allAddrs = await Storage.get("walletAddrs");
    this.walletInfo = walletInfo[wallet.id];
    this.firstAddr = allAddrs[wallet.id][0][0].address;

    if (active) {
      this.walletInfo = walletInfo[wallet.id];
      this.wltInst = Wallets.getWallet(wallet.id);
    } else {
      this.wltInst.name = wallet.name;
      this.gotoChange = true;
    }

    let addrAmount = 0;
    for (let index in allAddrs[wallet.id]) {
      addrAmount += allAddrs[wallet.id][index].length;
    }
    this.addrAmount = addrAmount;

    const allWallet = (await Storage.get("walletInfo")) || {};
    for (let id in allWallet) {
      this.allWalletsName.push(allWallet[id].name);
    }
  },
  methods: {
    handleClose(type) {
      this["visible" + type] = false;
    },
    showMnemonicHandle() {
      this.verifyType = "Mnemonic";
      this.tip = "common_confirm_pw";
      this.visiblePassword = true;
    },
    showPublicKeyHandle() {
      this.verifyType = "Public";
      this.tip = "common_confirm_pw";
      this.visiblePassword = true;
    },
    showPrivateKeyHandle() {
      this.verifyType = "Private";
      this.tip = "common_confirm_pw";
      this.visiblePassword = true;
    },
    handleGetWalletName(newName) {
      newName = newName.trim();
      if (newName === "") {
        this.$message({
          type: "error",
          message: this.$t("name_empty_error"),
          duration: 2 * 1000
        });
        return;
      }

      if (this.allWalletsName.includes(newName)) {
        this.$message({
          type: "error",
          message: this.$t("name_has_exist"),
          duration: 2 * 1000
        });
        return;
      }

      const index = this.allWalletsName.indexOf(this.walletInfo.name);
      this.allWalletsName.splice(index, 1, newName);

      this.wltInst.name = newName;
      this.wltInst.storeWltInfo();
      this.handleClose("Edit");
    },
    handleDeleteWallet() {
      this.handleClose("Delete");
      this.tip = "verify_delete";
      this.visiblePassword = true;
      this.verifyType = "Delete";
    },
    async handleConfirmPassword(password) {
      this.handleClose("Password");
      if (!this.wltInst.validatePayPassword(password)) {
        this.$message({
          showClose: true,
          message: this.$t("toast_incorrect_password"),
          type: "error"
        });
        return;
      }

      switch (this.verifyType) {
        case "Delete":
          let walletId = this.wltInst.walletId;
          for (let key of [
            "walletInfo",
            "lastAddrIndex" + walletId,
            "walletAddrs"
          ]) {
            let data_ = await Storage.get(key);
            delete data_[walletId];
            await Storage.set(key, data_);
          }
          Cache.clearTransCache(walletId);
          Wallets.deleteWallet(walletId);
          if (walletId == Wallets.getActiveWltId()) {
            Wallets.setActiveWltId(null);
            let wallets = await Storage.get("walletInfo");
            if (JSON.stringify(wallets) == "{}") {
              await Storage.set("walletsOrder", []);
              this.$store.commit("initWalletInfo");
              this.$router.replace("/create-wallet");
            } else {
              const walletsOrder = (await Storage.get("walletsOrder")) || [];
              for (let i = 0; i < walletsOrder.length; i++) {
                if (walletsOrder[i] === walletId) {
                  walletsOrder.splice(i, 1);
                  await Storage.set("walletsOrder", walletsOrder);
                  if (walletsOrder.length) {
                    Wallets.setActiveWltId(walletsOrder[0]);
                    let wltInfo = wallets[walletsOrder[0]];
                    let walletInst = new Wallet();
                    await walletInst.wake(wltInfo);
                    this.$router.replace("/");
                  } else {
                    this.$router.replace("/create-wallet");
                  }
                  break;
                }
              }
            }
          }
          break;
        case "Mnemonic":
          if (!this.wltInst.entropy && this.wltInst.isImported) {
            this.$message({
              showClose: true,
              message: this.$t("wallet_no_key"),
              type: "error"
            });
            return;
          }
          this.mnemonics = this.wltInst.getMnemonic(password).split(" ");
          this.visibleMnemonic = true;
          break;
        case "Public":
          this.publicKey = await getWalletPubKey();
          this.visiblePublicKey = true;
          break;
        case "Private":
          this.privateKey = this.wltInst.getPrivateKey(password);
          this.visiblePrivateKey = true;
        default:
          break;
      }
    }
  }
};
</script>
<style scoped lang='scss'>
.manege-wallet__container {
  height: 100%;
  background-color: rgb(246, 246, 246);

  .nav-bar {
    padding-left: 20px;

    span {
      margin-left: 20px;
    }

    .delete-btn {
      border: 1px solid #d3d3d3;
      border-radius: 4px;
      padding: 12px 24px;
      color: #646464;
      font-size: 12px;
      font-weight: 500;
    }
  }

  .content__container {
    width: 640px;
    height: 452px;
    background-color: #fff;
    margin: 32px auto 0;
    padding: 32px;
    border: 1px solid #ededed;
    border-radius: 4px;

    .wallet-name-address__container {
      padding-bottom: 32px;
      border-bottom: 1px solid #ededed;

      .wallet-name-edit {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .wallet-name {
          font-size: 36px;
          color: #282828;
          font-weight: 500;
          max-width: 400px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.2;
        }

        .edit-btn {
          width: 106px;
          height: 36px;
          line-height: 36px;
          text-align: center;
          font-size: 12px;
          color: #646464;
          border: 1px solid #c9c9c9;
          border-radius: 4px;
          font-weight: 500;

          &:hover {
            cursor: pointer;
          }
        }
      }

      .address {
        margin-top: 24px;
        font-size: 12px;
        color: #646464;
        line-height: 1;

        > span {
          color: #0076ff;
          font-weight: 600;
        }
      }
    }

    .eye {
      margin-top: 60px;
      text-align: center;
    }

    .btn-group {
      margin: 80px auto 0;
      text-align: center;
      .btn {
        display: inline-block;
        width: 240px;
        height: 36px;
        line-height: 36px;
        border-radius: 4px;
        border: 1px solid #c9c9c9;
        color: #646464;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .btn + .btn {
        margin-left: 24px;
      }
    }

    .key-icon {
      width: 24px;
      height: 24px;
    }

    .key_container {
      padding: 24px 32px;

      .key_section_title {
        font-size: 12px;
        color: #646464;
        line-height: 12px;
      }

      .key_import_wrap {
        .input-wrap {
          margin-top: 12px;
          display: flex;
          align-items: center;

          .el-input {
            flex-grow: 1;

            .el-input__inner {
              height: 36px;
              line-height: 36px;
              background-color: #fbfbfb;
              font-size: 12px;
            }

            /*            input::-webkit-input-placeholder {
              color: #D3D3D3;
              font-size: 12px;

            }*/
          }

          .el-button {
            width: 72px;
            height: 36px;
            margin-left: 12px;
          }
        }
      }

      .key_list_wrap {
        margin-top: 24px;

        .key_list {
          margin-top: 24px;
          height: 224px;
          overflow-y: scroll;

          &::-webkit-scrollbar {
            width: 5px;
            opacity: 0.3;
          }

          .key_item {
            padding: 0;
            height: 40px;

            .address {
              display: block;
              padding: 0 20px 0 8px;
              font-size: 12px;
              line-height: 12px;
              color: #282828;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
              max-width: 257px;
            }

            .remove {
              font-size: 12px;
              color: #f84263;
              text-align: right;
              line-height: 12px;
              cursor: pointer;
            }
          }

          .key_empty {
            display: inline-block;
            width: 100%;
            font-size: 12px;
            color: #9d9d9d;
            letter-spacing: 0;
            text-align: center;
            line-height: 12px;
          }
        }
      }
    }
  }
}
</style>