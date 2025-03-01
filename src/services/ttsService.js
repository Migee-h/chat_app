// 语音合成服务

const ACCESS_TOKEN = 'GUkIU3AeAAhaKSZrhm2EGcJRkekdI_vX';
const APPID = '8088931063';
const SPEAKER_ID = 'S_Bg2xgk9j1';
const BASE_URL = '/tts-api';

// 过滤括号内的内容
function filterBracketContent(text) {
  return text.replace(/\([^\)]+\)/g, '').trim();
}

// 语音合成API调用
export async function synthesizeSpeech(text) {
  const filteredText = filterBracketContent(text);
  if (!filteredText) return null;

  const requestBody = {
    app: {
      appid: APPID,
      token: ACCESS_TOKEN,
      cluster: 'volcano_icl'
    },
    user: {
      uid: 'any_non_empty_string'
    },
    audio: {
      voice_type: SPEAKER_ID,
      encoding: 'mp3',
      speed_ratio: 1.0
    },
    request: {
      reqid: crypto.randomUUID(),
      text: filteredText,
      operation: 'query'
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/api/v1/tts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer;${ACCESS_TOKEN}`,
        'Resource-Id': 'volc.megatts.voiceclone',
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // 返回Base64编码的音频数据
  } catch (error) {
    console.error('语音合成失败:', error);
    throw error;
  }
}