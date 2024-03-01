<template>
    <div class="wrapper">

        <button @click="toggleConnection">
            {{ connectButtonString }}
        </button>

    </div>
</template>
  
<script>
/* eslint-disable */

import { mapGetters, mapActions } from 'vuex'

export default {
    computed: {
        ...mapGetters({
            connected: 'firmata/connected',
        }),
        connectButtonString: function () {
            return this.connected ? 'デバイスを切断する' : 'デバイスを接続する'
        }
    },
    watch: {
        selected: function () {
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
            } else {
                this.connect()
            }
            globalVar["connection"] = () => this.connected;

        },
        ...mapActions({
            connect: 'firmata/connect',
            disConnect: 'firmata/disConnect'
        })
    }
}

</script>
  