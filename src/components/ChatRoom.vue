<script setup>
import { ref, onMounted } from 'vue';
import { chatWithAI, readExampleConversation } from '../services/chatService';
import { speak } from '../services/ttsService';

const messages = ref([]);
const inputMessage = ref('');
const isLoading = ref(false);
const error = ref(null);
const currentResponse = ref('');
const playingMessageId = ref(null);
const exampleMessages = ref([]);
const currentConversation = ref({
  id: 'default',
  title: '默认对话',
  systemPrompt: '',
  inheritStyle: true
});

onMounted(async () => {
  exampleMessages.value = await readExampleConversation();
  if (exampleMessages.value.length > 0 && currentConversation.value.inheritStyle) {
    messages.value = [...exampleMessages.value];
  }
});

async function sendMessage() {
  if (!inputMessage.value.trim() || isLoading.value) return;

  const userMessage = {
    role: 'user',
    content: inputMessage.value.trim()
  };

  messages.value.push(userMessage);
  inputMessage.value = '';
  error.value = null;
  isLoading.value = true;
  currentResponse.value = '';

  try {
    const messagesToSend = [];

    if (currentConversation.value.systemPrompt) {
      messagesToSend.push({
        role: 'system',
        content: currentConversation.value.systemPrompt
      });
    } else if (currentConversation.value.inheritStyle && exampleMessages.value.length > 0) {
      messagesToSend.push(...exampleMessages.value);
    }

    messagesToSend.push(...messages.value);

    await chatWithAI(
      messagesToSend,
      (content) => {
        currentResponse.value += content;
      },
      (err) => {
        error.value = err.message;
      }
    );

    if (currentResponse.value) {
      messages.value.push({
        role: 'assistant',
        content: currentResponse.value
      });
      currentResponse.value = '';
    }
  } catch (err) {
    error.value = '发生错误：' + err.message;
  } finally {
    isLoading.value = false;
  }
}

async function playMessage(content, index) {
  if (playingMessageId.value === index) {
    speak.cancel();
    playingMessageId.value = null;
  } else {
    playingMessageId.value = index;
    try {
      await speak(content);
      playingMessageId.value = null;
    } catch (err) {
      error.value = '语音播放失败：' + err.message;
      playingMessageId.value = null;
    }
  }
}

function handleConversationSelect(conversation) {
  currentConversation.value = conversation;
  messages.value = [];
  error.value = null;
  currentResponse.value = '';
  playingMessageId.value = null;

  if (conversation.inheritStyle && exampleMessages.value.length > 0) {
    messages.value = [...exampleMessages.value];
  }
}

defineExpose({
  handleConversationSelect
});
</script>

<template>
  <div class="chat-container">
    <div class="messages" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
        <div class="message-content">
          {{ msg.content }}
          <button
            v-if="msg.role === 'assistant'"
            class="play-button"
            :class="{ 'playing': playingMessageId === index }"
            @click="playMessage(msg.content, index)"
          >
            <span class="play-icon">{{ playingMessageId === index ? '⏸' : '▶' }}</span>
          </button>
        </div>
      </div>
      <div v-if="currentResponse" class="message assistant">
        <div class="message-content">
          {{ currentResponse }}
        </div>
      </div>
      <div v-if="isLoading" class="loading">
        <div class="dot-flashing"></div>
      </div>
      <div v-if="error" class="error">
        {{ error }}
      </div>
    </div>

    <div class="input-area">
      <input
        v-model="inputMessage"
        @keyup.enter="sendMessage"
        placeholder="输入消息..."
        :disabled="isLoading"
      />
      <button @click="sendMessage" :disabled="isLoading || !inputMessage.trim()">
        发送
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  flex: 1 1 auto;
  min-width: 0;
  padding: 20px;
  box-sizing: border-box;
  background: #f7f7f7;
  position: relative;
}

@media (max-width: 768px) {
  .chat-container {
    padding: 60px 10px 10px;
    width: 100%;
    height: calc(100% - env(safe-area-inset-bottom));
  }

  .input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    background: white;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .messages {
    margin-bottom: 60px;
    padding-bottom: 20px;
  }
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #ffffff;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .messages {
    padding: 10px;
  }
}

.message {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.message.user {
  align-items: flex-end;
}

.message.assistant {
  align-items: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  position: relative;
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
    padding: 10px 12px;
    font-size: 16px;
  }
}

.play-button {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #007AFF;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .play-button {
    width: 36px;
    height: 36px;
    right: -44px;
  }
}

.play-button:hover {
  background: #0056b3;
}

.play-button.playing {
  background: #dc3545;
}

.play-icon {
  font-size: 16px;
  line-height: 1;
}

.user .message-content {
  background: #1677ff;
  color: white;
  border-radius: 12px 12px 0 12px;
}

.assistant .message-content {
  background: #f5f5f5;
  color: #333;
  border-radius: 12px 12px 12px 0;
  box-shadow: none;
}

.input-area {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .input-area {
    padding: 8px;
    gap: 8px;
  }
}

input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

@media (max-width: 768px) {
  input {
    padding: 10px;
    font-size: 16px;
  }
}

input:focus {
  border-color: #007AFF;
}

button {
  padding: 12px 24px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

@media (max-width: 768px) {
  button {
    padding: 10px 20px;
    font-size: 16px;
  }
}

button:hover:not(:disabled) {
  background: #0056b3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.dot-flashing {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #007AFF;
  animation: dot-flashing 1s infinite linear alternate;
  animation-delay: 0.5s;
}

.dot-flashing::before,
.dot-flashing::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #007AFF;
  animation: dot-flashing 1s infinite alternate;
}

.dot-flashing::before {
  left: -15px;
  animation-delay: 0s;
}

.dot-flashing::after {
  left: 15px;
  animation-delay: 1s;
}

@keyframes dot-flashing {
  0% {
    background-color: #007AFF;
  }
  50%, 100% {
    background-color: #ccc;
  }
}

.error {
  color: #dc3545;
  text-align: center;
  margin: 10px 0;
  padding: 10px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #dc3545;
}
</style>
