<script lang="ts" setup></script>

<template>
  <a href="https://storipress.com" target="_blank" rel="noopener noreferrer" title="Storipress">
    <img src="./sp-badge.svg" class="sp-badge" />
  </a>
</template>

<style lang="scss" scoped>
.sp-badge {
  width: 6.75rem;
  height: 6.75rem;
  background-color: transparent;
  transition: transform 0.4s ease-out;
}

.sp-badge:hover {
  transition: transform 1.2s ease-in-out;
  transform: rotate(350deg);
}
</style>
