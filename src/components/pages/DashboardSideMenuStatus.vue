<template>
  <section>
    <img
      src="../../../public/img/blank.png"
      alt="akadako"
      :class="{active: connected, inactive: !connected, 'akadako-icon': true}"
    >
    <div class="group-select-box">
      <button @click="toggleConnection">
        {{ connectButtonString }}
      </button>
    </div>
  </section>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      connected: 'firmata/connected',
    }),
    connectButtonString: function() {
      return this.connected ? 'デバイスを切断する' : 'デバイスを接続する'
    }
  },
  watch: {
    selected: function(){
      if (this.connected) {
        this.mDisConnect()
          .catch((e) => {
            console.error(e)
            this.$buefy.toast.open({
              duration: 7000,
              message: '不明なエラーが発生しました',
              position: 'is-top',
              type: 'is-danger'
            })
            return Promise.resolve()
          })
      }
    }
  },
  methods: {
    toggleConnection() {
      if (this.connected) {
        this.disConnect()
      }else {
        this.connect()
      }
    },
    ...mapActions({
      connect: 'firmata/connect',
      disConnect: 'firmata/disConnect'
    })
  }
}

</script>
<style scoped>
.akadako-icon {
  display: block;
  width: 150px;
  height: 180px;
  margin: 0 auto 15px auto;
  background: url("../../../public/img/status-akadako.svg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.akadako-icon.inactive {
  filter: grayscale(1) brightness(85%);
}
.group-select-box {
  height: 30px;
  margin-bottom: 40px;
  text-align:center;
}
.group-select-box select {
  width: calc(100% - 35px);
  padding: 0 10px;
  height: 100%;
  border-radius: 4px;
  font-size: 0.9375rem;
  cursor: pointer;
  background: #fff;
}
.group-select-box .fa-caret-down {
  position: absolute;
  top: 50%;
  right: 45px;
  transform: translateY(-50%);
  pointer-events: none;
}
.group-select-box button {
  padding:0 10px 0 40px;
  height: 100%;
  cursor: pointer;
  border-radius: 4px;
  background: url("../../../public/img/icon-webusb.png") #F3F3F3 no-repeat center left 5px;
  text-align: center;
}

.group-select-box button:hover{
  opacity:.8;
}

.group-select-box button .fa-plug {
  font-size: 1rem;
}
.group-select-box button.active {
  background: #ffeb3b;
}
</style>
