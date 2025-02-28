// 聊天服务封装
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
          try {
            const jsonData = JSON.parse(line.slice(6).trim());
            
            if (jsonData.completed) {
              return;
            }
            
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