<template>
  <header>
    <h1>
      <img alt="Groupomania" src="../assets/icon-above-font.svg" />
    </h1>
    <nav>
      <router-link to="/">Se connecter</router-link> |
      <router-link to="/Signup">S'inscrire</router-link>
    </nav>
  </header>
</template>

<script>
export default {
  name: "NavLogin",
};
</script>

<style scoped lang="scss">
header {
  margin-top: 10em;
}
</style>