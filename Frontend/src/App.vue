<template>
  <div id="app">
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #000000;
  height: 100%;
  background: linear-gradient(
    to right,
    rgb(73, 101, 122),
    rgb(215, 210, 204),
    rgb(73, 101, 122)
  );

  nav {
    padding: 30px;

    a {
      font-weight: bold;
      color: #2c3e50;
      &:hover {
        color: #c60101;
        text-decoration:none;
      }
      &.router-link-exact-active {
        color: #0132c6;
      }
    }
  }
}
.text-muted {
  color: #000000 !important;
}
.text-danger {
  color: #0132c6 !important;
}
@import "~bootstrap/dist/css/bootstrap.css";
</style>
