// 聊天服务封装

// 读取示例对话文件
export async function readExampleConversation() {
  try {
    console.log('开始读取示例对话文件...');
    const response = await fetch(new URL('../assets/example_conversation.txt', import.meta.url).href);
    const text = await response.text();
    console.log('文件内容长度:', text.length);

    const exampleMessages = [];
    const lines = text.split('\n');
    console.log('总行数:', lines.length);

    let role = null;
    let content = [];
    let messageCount = 0;

    for (const line of lines) {
      if (line.startsWith('user: ')) {
        if (role) {
          const message = { role, content: content.join('\n').trim() };
          exampleMessages.push(message);
          messageCount++;
          content = [];
        }
        role = 'user';
        content.push(line.substring(6));
      } else if (line.startsWith('assistant: ')) {
        if (role) {
          const message = { role, content: content.join('\n').trim() };
          exampleMessages.push(message);
          messageCount++;
          content = [];
        }
        role = 'assistant';
        content.push(line.substring(11));
      } else if (line.trim()) {
        content.push(line);
      }
    }

    if (role && content.length > 0) {
      const message = { role, content: content.join('\n').trim() };
      exampleMessages.push(message);
      messageCount++;
    }

    console.log('成功解析消息数量:', messageCount);
    console.log('示例对话数组长度:', exampleMessages.length);

    return exampleMessages;
  } catch (error) {
    console.error('读取示例对话文件失败:', error);
    return [];
  }
}

export async function chatWithAI(messages, onProgress, onError) {
  try {
    const requestBody = {
      model: 'deepseek-chat',
      messages,
      stream: true,
      response_format: {
        type: 'text'
      }
    };

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API密钥未配置，请在.env文件中设置VITE_OPENAI_API_KEY');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.startsWith('data: ')) {
          const content = line.slice(6).trim();
          if (content === '[DONE]') {
            return;
          }
          try {
            const jsonData = JSON.parse(content);

            if (jsonData.choices?.[0]?.delta?.content) {
              const content = jsonData.choices[0].delta.content;
              onProgress?.(content);
            }
          } catch (e) {
            if (line.trim()) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    }

    // 处理最后可能剩余的数据
    if (buffer.trim()) {
      const line = buffer.trim();
      if (line.startsWith('data: ')) {
        try {
          const jsonData = JSON.parse(line.slice(6).trim());
          if (jsonData.choices?.[0]?.delta?.content) {
            onProgress?.(jsonData.choices[0].delta.content);
          }
        } catch (e) {
          if (line.trim()) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
    onError?.(error);
  }
}
