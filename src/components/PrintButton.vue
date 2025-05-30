<template>
  <Button
    icon="fa-solid fa-print"
    variant="outlined"
    severity="info"
    @click="openPrintDialog"
  />
</template>

<script setup>
const openPrintDialog = () => {
  window.print();
};
</script>
