<script setup>
import navbar from './components/NavBar.vue'

</script>

<template>
  <div id="app">
    <header>
      <navbar />
    </header>
  </div>

</template>

<style scoped>
body, html {
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

header {
  flex-shrink: 0;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
  }

  .logo {
    margin: 0;
  }

  nav {
    text-align: left;
    margin-left: 1rem;
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>