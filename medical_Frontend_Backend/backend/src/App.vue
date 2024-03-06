<template>
  <div id="app">
    <!-- 滚动到顶部 -->
    <el-backtop :right="20"></el-backtop>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
