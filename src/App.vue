<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import ConversationList from './components/ConversationList.vue';
import ChatRoom from './components/ChatRoom.vue';

const showSidebar = ref(false);
const showOverlay = ref(false);

function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
  showOverlay.value = showSidebar.value;
}

function closeSidebar() {
  showSidebar.value = false;
  showOverlay.value = false;
}
</script>

<template>
  <div class="app-container">
    <button class="menu-button" @click="toggleSidebar">
      <span class="menu-icon">☰</span>
    </button>
    <div class="overlay" :class="{ 'show': showOverlay }" @click="closeSidebar"></div>
    <div class="sidebar" :class="{ 'sidebar-open': showSidebar }">
      <ConversationList />
    </div>
    <ChatRoom />
  </div>
</template>

<style>
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

.menu-button {
  display: none;
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1001;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #1677ff;
  color: white;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.menu-button:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.menu-icon {
  line-height: 1;
  transition: transform 0.3s ease;
}

.sidebar-open .menu-icon {
  transform: rotate(90deg);
}

.sidebar {
  width: 300px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 998;
}

@media (max-width: 768px) {
  .menu-button {
    display: flex;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 999;
    transform: translateX(-100%);
  }

  .sidebar-open {
    transform: translateX(0);
  }

  .overlay.show {
    display: block;
    opacity: 1;
  }
}
</style>
