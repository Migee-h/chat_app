<script setup>
import { ref } from 'vue';

const conversations = ref([
  { id: 'default', title: '默认对话', systemPrompt: '' }
]);

const selectedConversationId = ref('default');
const showNewConversationDialog = ref(false);
const newConversationTitle = ref('');
const newSystemPrompt = ref('');
const inheritExampleStyle = ref(true);

const emit = defineEmits(['select-conversation', 'create-conversation']);

function selectConversation(id) {
  selectedConversationId.value = id;
  emit('select-conversation', id);
}

function openNewConversationDialog() {
  showNewConversationDialog.value = true;
  newConversationTitle.value = '';
  newSystemPrompt.value = '';
  inheritExampleStyle.value = true;
}

function createNewConversation() {
  if (!newConversationTitle.value.trim()) return;
  
  const newConversation = {
    id: Date.now().toString(),
    title: newConversationTitle.value.trim(),
    systemPrompt: newSystemPrompt.value.trim(),
    inheritStyle: inheritExampleStyle.value
  };
  
  conversations.value.push(newConversation);
  showNewConversationDialog.value = false;
  selectConversation(newConversation.id);
  emit('create-conversation', newConversation);
}
</script>

<template>
  <div class="conversation-list">
    <div class="header">
      <h2>对话列表</h2>
      <button class="new-chat-btn" @click="openNewConversationDialog">
        新建对话
      </button>
    </div>
    
    <div class="conversations">
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="conversation-item"
        :class="{ active: selectedConversationId === conv.id }"
        @click="selectConversation(conv.id)"
      >
        <span class="title">{{ conv.title }}</span>
      </div>
    </div>

    <!-- 新建对话对话框 -->
    <div v-if="showNewConversationDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>新建对话</h3>
        <div class="form-group">
          <label>对话标题</label>
          <input
            v-model="newConversationTitle"
            placeholder="请输入对话标题"
            @keyup.enter="createNewConversation"
          />
        </div>
        <div class="form-group">
          <label>系统提示词</label>
          <textarea
            v-model="newSystemPrompt"
            placeholder="请输入系统提示词（可选）"
            rows="4"
          ></textarea>
        </div>
        <div class="form-group checkbox">
          <label>
            <input type="checkbox" v-model="inheritExampleStyle" />
            继承示例对话风格
          </label>
        </div>
        <div class="dialog-buttons">
          <button @click="showNewConversationDialog = false">取消</button>
          <button
            class="primary"
            @click="createNewConversation"
            :disabled="!newConversationTitle.trim()"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conversation-list {
  width: 280px;
  height: 100vh;
  flex: 0 0 280px;
  background: #ffffff;
  border-right: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.new-chat-btn {
  padding: 10px 16px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.new-chat-btn:hover {
  background: #0056b3;
}

.conversations {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  padding: 14px 16px;
  margin: 2px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.conversation-item:hover {
  background: #f5f5f5;
}

.conversation-item.active {
  background: #e6f4ff;
  color: #1677ff;
}

.title {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90%;
}

.dialog h3 {
  margin: 0 0 20px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
}

.form-group.checkbox label {
  margin: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.form-group.checkbox input {
  width: auto;
  margin-right: 8px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.dialog-buttons button:not(.primary) {
  background: #f5f5f5;
  color: #333;
}

.dialog-buttons button.primary {
  background: #007AFF;
  color: white;
}

.dialog-buttons button:hover:not(:disabled) {
  opacity: 0.9;
}

.dialog-buttons button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>