<template>
  <div class="wrapper">
    <Header />
    <div>
      <Dashboard />
    </div>
  </div>
</template>

<script>
import Header from  './TheHeader'
import Dashboard from './pages/Dashboard'

export default {
  components:{ 
    Header,
    Dashboard 
  }
}
</script>

<style lang="scss">
@import "~bulma/sass/utilities/_all";
$primary:  #2c6ac4;
$primary-invert: findColorInvert($primary);
$gray: #999;
$gray-invert: findColorInvert($gray);
$twitter: #4099FF;
$twitter-invert: findColorInvert($twitter);
$colors: (
    "white": ($white, $black),
    "black": ($black, $white),
    "light": ($light, $light-invert),
    "dark": ($dark, $dark-invert),
    "gray": ($gray, $gray-invert),
    "primary": ($primary, $primary-invert),
    "info": ($info, $info-invert),
    "success": ($success, $success-invert),
    "warning": ($warning, $warning-invert),
    "danger": ($danger, $danger-invert),
    "twitter": ($twitter, $twitter-invert)
);
$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

@import "bulma";
@import "~buefy/src/scss/buefy";
</style>

<style>
* {
  box-sizing: border-box;
}

html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset,
form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer,
header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}

article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section {
  display: block;
}

body {
  line-height: 1;
  font-family: "ヒラギノ角ゴPro W3","Hiragino Kaku Gothic Pro",Osaka,"メイリオ",Meiryo,"ＭＳ ゴシック",sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 0.9375rem;
  color: #333;
}

ol, ul {
  list-style: none;
}

blockquote, q {
  quotes: none;
}

style blockquote:before, blockquote:after, q:before, q:after {
  content: '';
  content: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

button {
  background: none;
  border: none;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

a {
  color: #2c6ac4;
}

a:hover {
  opacity: .7;
}
</style>
<style scoped>
#main {
  margin-top: 20px;
}
.wrapper {
  min-height: 100vh;
  position: relative;
  /* padding-bottom: 312px; */
}
.footer {
  width: 100vw;
  position: absolute;
  bottom: 0;
}
</style>
