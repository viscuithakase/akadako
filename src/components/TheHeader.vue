<template>
  <header class="main-header">
    <h1 class="header-logo">
      <a><img
        src="../../public/img/header-tfc-logo.png"
        alt="TFabGraph[AkaDako版]"
      ></a>
    </h1>
  </header>
</template>

<style scoped>
.main-header {
  position: relative;
  width: 100%;
  height: 50px;
  background: #333;
}

.header-logo {
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  width: 380px;
}

@media (max-width: 485px) {
  .header-logo {
      max-width: calc(100% - 210px);
  }
}

.header-logo img {
  display: block;
}

.header-info-area {
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  height: 50px;
}
@media (max-width: 485px) {
  .header-info-area {
    max-width: 210px;
    font-size: .8rem;
    padding-left: 20px;
    padding-right: 10px;
  }
}

.header-info-area .select-language {
  padding: 0 20px;
}
@media (max-width: 485px) {
  .header-info-area .select-language {
    padding: 0;
  }
}
.header-info-area .select-language .language-list {
  display: flex;
}
.header-info-area .select-language .language-list li {
  width: 100px;
}
@media (max-width: 485px) {
  .header-info-area .select-language .language-list li {
    width: 90px;
  }
}
.header-info-area .select-language .language-list li a {
  display: block;
  padding: 0 15px;
  height: 30px;
  line-height: 30px;
  white-space: nowrap;
  background: #e9e9e9;
  text-decoration: none;
  color: #999;
  font-weight: bold;
  text-align: center;
}
@media (max-width: 485px) {
  .header-info-area .select-language .language-list li a {
    padding: 0 5px;
  }
}
.header-info-area .select-language .language-list li:nth-of-type(1) a {
  border-radius: 4px 0 0 4px;
}
.header-info-area .select-language .language-list li:nth-of-type(2) a {
  border-radius: 0 4px 4px 0;
}
.header-info-area .select-language .language-list li.active a {
  background: #27ae60;
  color: #fff;
}
.header-info-area .select-language select {
  font-size: 0.875rem;
  border: 1px solid #ddd;
}
</style>
