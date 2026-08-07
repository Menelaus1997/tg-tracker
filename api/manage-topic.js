export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, threadId, name, customBotToken, customGroupId } = req.body;

  const BOT_TOKEN = customBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const GROUP_ID = customGroupId || process.env.TELEGRAM_GROUP_ID;

  if (!BOT_TOKEN || !GROUP_ID || !threadId) {
    return res.status(400).json({ success: false, error: 'Відсутні обов\'язкові параметри' });
  }

  try {
    let endpoint = '';
    let bodyData = { chat_id: GROUP_ID, message_thread_id: threadId };

    if (action === 'edit') {
      endpoint = 'editForumTopic';
      bodyData.name = name;
    } else if (action === 'close') {
      endpoint = 'closeForumTopic';
    } else if (action === 'reopen') {
      endpoint = 'reopenForumTopic';
    } else if (action === 'delete') {
      endpoint = 'deleteForumTopic';
    } else {
      return res.status(400).json({ success: false, error: 'Невідома дія' });
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    const data = await response.json();

    return res.status(200).json({ success: data.ok, data });
  } catch (err) {
    console.error('Topic Management Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
