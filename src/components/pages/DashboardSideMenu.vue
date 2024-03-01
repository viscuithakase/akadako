<template>
  <div id="wrapper">
    <nav class="menu-area">
      <ConnnectStatus />
      <ul class="menu-area-btn-list">
        <!-- <li
          class="help-icon"
        >
          <a
            href="https://tfabworks.com/news/7477/"
            target="_blank"
          >
            使い方
          </a>
        </li> -->
        <li class="privacy-icon">
          <a href="https://tfabworks.com/service_privacy/" target="_blank">
            プライバシーポリシーXX
          </a>
        </li>
        <li class="brand-icon">
          <a href="https://akadako.com/" target="_blank">
            AkaDako.com
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import ConnnectStatus from './DashboardSideMenuStatus'

export default {
  components: {
    ConnnectStatus,
  },
  methods: {
    modalReset() {
      this.newGroup = {
        tabState: 1,
        isPublic: 'Private',
        modalActive: false,
        name: '',
        joinNumber: null,
      }
    },
  },
}
</script>
<style scoped>
#wrapper {
  background: #27ae60;
}

.menu-area {
  width: 220px;
  padding: 20px 15px;
  min-height: calc(100vh - 50px);
}

.menu-area-title {
  color: #fff;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 15px 0;
}

.menu-area-title:nth-of-type(2) {
  margin: 40px 0 15px 0;
}

.menu-area-title .icon-btn {
  position: relative;
  display: inline-block;
  width: 25px;
  height: 25px;
  line-height: 25px;
  vertical-align: middle;
  text-align: center;
  border-radius: 4px;
  font-size: 0.875rem;
  background: #f3f3f3;
  color: #333;
}

.menu-area-title .icon-btn:first-of-type {
  margin: 0 8px 0 20px;
}

.menu-area-btn-list>li {
  margin: 15px 0;
  padding-left: 25px;
  position: relative;
}

.menu-area-btn-list>li:before {
  display: block;
  left: 0;
  width: 25px;
  height: 15px;
  content: "";
  position: absolute;
  background-image: url("../../../public/img/icon-sprite.png");
  background-repeat: no-repeat;
}

.menu-area-btn-list>li.help-icon:before {
  background-position: 0 -15px;
}

.menu-area-btn-list>li.opinion-icon:before {
  background-position: 0 -30px;
}

.menu-area-btn-list>li.brand-icon:before {
  background-position: 0 -45px;
}

.menu-area-btn-list>li.tfabconnect-icon:before {
  background-position: 0 -60px;
}

.menu-area-btn-list>li.privacy-icon:before {
  background-position: 0 -75px;
}

.menu-area-btn-list>li a {
  display: block;
  color: #fff;
  text-decoration: none;
}

.menu-area-btn-list>li>ul {
  margin: 5px 0 0 10px;
}

.menu-area-btn-list>li>ul>li {
  margin-bottom: 6px;
}</style>
