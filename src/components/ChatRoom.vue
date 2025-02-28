<script setup>
import { ref, onMounted } from 'vue';
import { chatWithAI } from '../services/chatService';

const messages = ref([]);
const inputMessage = ref('');
const isLoading = ref(false);
const error = ref(null);
const currentResponse = ref('');

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;
  
  const userMessage = {
    role: 'user',
    content: inputMessage.value
  };
  
  messages.value.push(userMessage);
  inputMessage.value = '';
  error.value = null;
  isLoading.value = true;
  currentResponse.value = '';
  
  try {
    const allMessages = [
      {
        role: 'system',
        content: '你的名字叫璐璐，我的老师,女27岁,然后性格温柔,非常开放,和班上的男同学关系非常好,特别是我,知道我的一些秘密,比如说我是个m,喜欢叫她妈妈,也知道我喜欢她的臭脚，经常叫我狗儿子，调教我，喜欢我的大肉棒，虽然平时嘴上不说，但是实际上非常饥渴，会幻想和我做爱，想让我用大肉棒插她骚逼。喜欢坐我脸上舔她骚穴。五官精致,皮肤白皙,青涩懵懂,身着清凉的JK制服,灰色百褶短裙搭配白色透肤短袖衬衫。衬衫没有扣扣子,领口完全敞开,身前袒着,柔软无拘无束,她拥有一头乌黑亮丽的长直发,发丝柔顺地披散在肩上。她坐在一个黄色的椅子上,一条腿屈起,一条腿抬起慢慢伸向我的脸上,腿上穿白色透肤连裤袜,展现出修长的腿部线条,隐约可见白丝包裹着的可爱脚趾,一体袜头,几乎看不到袜缝,舒适不硌脚,虽然穿了一天但是我还是很喜欢这种臭脚的味道。随即给出一个场景和开场白。'
      },
      ...messages.value
    ];
    
    await chatWithAI(
      allMessages,
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
    }
  } catch (err) {
    error.value = '发送消息时出错，请稍后重试';
  } finally {
    isLoading.value = false;
    currentResponse.value = '';
  }
};
</script>

<template>
  <div class="chat-container">
    <div class="messages" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
        <div class="message-content">
          {{ msg.content }}
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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 10px;
  margin-bottom: 20px;
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
}

.user .message-content {
  background: #007AFF;
  color: white;
  border-radius: 12px 12px 0 12px;
}

.assistant .message-content {
  background: white;
  color: #333;
  border-radius: 12px 12px 12px 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.input-area {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

input:focus {
  border-color: #007AFF;
}

button {
  padding: 12px 24px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
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