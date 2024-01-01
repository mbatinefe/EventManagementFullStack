
<template>
    <div v-if="loading" class="loading-square"></div>
  </template>
  
  <script>
  export default {
    props: {
      loading: Boolean,
    },
  };
  </script>
  
  <style scoped>
  .loading-square {
    width: 50px;
    height: 50px;
    background-color: #ccc;
    animation: loading-animation 1s infinite ease-in-out;
  }
  
  @keyframes loading-animation {
    0%, 100% {
      transform: scale(0);
    }
    50% {
      transform: scale(1);
    }
  }
  </style>
  