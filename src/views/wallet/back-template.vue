<template>
    <div class="wallet-base">
        <div class="mask"></div>
        <div class="context-box">
            <slot></slot>
        </div>
    </div>
</template>
<script>
export default {
    name: "fw-wallet-base"
};
</script>
<style lang="scss">
@import "../@styles/index.scss";

.wallet-base {
    @include bg('three');
    height: 580px;
    padding: 64px 112px;

    .fw-item.nav-bar {
        height: 56px;
        padding-left: 0;
        padding-right: 0;
    }


    .mask {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        opacity: 0.03;
    }

    .context-box {
        padding: 0px 32px;
        height: 100%;
        width: 100%;
        background: $white;
        text-align: left;
        color: $black;
        position: relative;
        background: #fff;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.10);
        border-radius: 4px;



        .title {
            font-size: 20px;
            margin-top: 16px;
            font-weight: $semibold;
        }

        .sub-title {
            font-weight: $medium;
            font-size: 12px;
            color: $second-text-color;
            margin-top: 24px;
            margin-bottom: 12px;
        }

        .desc {
            font-size: 12px;
            margin-top: 12px;
            font-weight: $regular;
            margin-bottom: 24px;
        }

        input {
            background-color: $white-gray !important;
            color: $black;
            font-size: 12px;
            font-weight: $medium;
        }
    }

    .next-btn {
        position: absolute;
        bottom: 32px;
        right: 32px;
    }

    .done-btn {
        position: absolute;
        bottom: 32px;
        transform: translateX(-50%);
        left: 50%;
    }

    .mrgn-v24 {
        margin: 24px 0px !important;
    }

    .mnemo-textarea {
        width: 416px;
        height: 160px;
        background: $white-grayer;
        border-radius: 4px;
        padding: 24px;
        border: none;
        font-size: 16px;
        font-weight: $semibold;
    }

    .mnemo {
        display: inline-block;
        margin-right: 24px;
        padding-bottom: 6px;
        border-bottom: 1px solid $light-gray;
        margin-bottom: 24px;
    }
}
</style>