<template>
  <div class="content__container">
    <div class="confirm-authorization__wrapper">
      <div class="title">{{$t('confirm_auth')}}</div>
      <img src="/images/icons/logo_m@2x.png" width="74" height="20" alt>
    </div>
      <div class="tips">{{$t('confirm_auth_desc', {value: fromName})}}</div>
      <div class="footer__btns">
        <div class="footer__btn footer-cancel__btn active-btn" @click="()=>{AuthorOpt('reject')}">{{$t('common_reject')}}</div>
        <div class="footer__btn footer-confirm__btn suc-active-btn" @click="()=>{AuthorOpt('allow')}">{{$t('common_allow')}}</div>
      </div>
    </div>
</template>
<script>
import Storage from "@service/storage";
import Authorization from "@service/authorization";

export default {
  data() {
    return {
      fromName: "",
      licensorId: "",
      eventId: "",
    };
  },
  created() {
    this.fromName = this.$route.query.fromName;
    this.licensorId = this.$route.query.licensorId;
    this.eventId = this.$route.query.id;
    this.authorization = new Authorization();
  },

  methods: {
    async AuthorOpt(opt) {
      let walletAddrs = await Storage.get("walletAddrs");
      let activeWltId = await Storage.get("activeWltId");
      let addrs = walletAddrs[activeWltId];
      let data_;
      if (opt == "allow") {
        const address = addrs[0][0].address;
        this.addAuthor(address);
        data_ = {
          success: true,
          msg: "",
          data: { address }
        };
      } else {
        data_ = {
          success: false,
          msg: "RejectGetAddress"
        };
      }
      chrome.runtime.sendMessage({
        type: "POST_FlowMask_Address",
        id: this.eventId,
        result: data_
      });
    },

    addAuthor(address) {
      const licensor = { address, licensorId: this.licensorId };
      this.authorization.addLicensor(licensor);
    }
  }
};
</script>
<style>
html {
  width: 416px !important;
  height: 212px !important;
}
</style>
<style scoped lang="scss">
.content__container {
  width: 416px;
  height: 212px;
  border-radius: 4px;
  position: absolute;
  left: 50%;
  top: 50%;
  background: #fff;
  padding: 32px;
  transform: translate(-50%, -50%);

  .confirm-authorization__wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 20px;
      color: #282828;
      font-weight: 500;
    }
  }

  .tips {
    font-size: 12px;
    margin-top: 12px;
    height: 20px;
    line-height: 20px;
    color: #282828;
  }

  .footer__btns {
    display: flex;
    justify-content: space-between;
    margin-top: 48px;

    .footer__btn {
      width: 168px;
      height: 48px;
      line-height: 48px;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      border-radius: 4px;

      &:hover {
        cursor: pointer;
      }
    }

    .footer-cancel__btn {
      color: #646464;
      border: 1px solid #d8d8d8;
    }

    .footer-confirm__btn {
      color: #fff;
      background-color: #02ba3d;
    }
  }
}
</style>