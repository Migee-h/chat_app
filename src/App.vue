<script setup>
import { RouterView } from 'vue-router'
import ConversationList from './components/ConversationList.vue'
import ChatRoom from './components/ChatRoom.vue'
</script>

<template>
  <div class="app-container">
    <ConversationList />
    <ChatRoom />
  </div>
</template>

<style>
/* 移除所有默认样式，让聊天界面能够全屏显示 */
body {
  margin: 0;
  padding: 0;
}

.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}
</style>
