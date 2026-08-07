export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectName, projectId, members, customBotToken, customGroupId } = req.body;

  // Використовуємо токен/ID з налаштувань Mini App або зі змінних Vercel
  const BOT_TOKEN = customBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const GROUP_ID = customGroupId || process.env.TELEGRAM_GROUP_ID;

  if (!BOT_TOKEN || !GROUP_ID) {
    return res.status(400).json({ 
      success: false, 
      error: 'Не налаштовано Bot Token або Group Chat ID у налаштуваннях додатка.' 
    });
  }

  try {
    const topicName = `${projectName} (${projectId})`;

    // 1. Створення нової гілки (Topic) у спільному чаті
    const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createForumTopic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: GROUP_ID,
        name: topicName
      })
    });

    const tgData = await tgResponse.json();

    if (!tgData.ok) {
      return res.status(400).json({ success: false, error: tgData.description });
    }

    const threadId = tgData.result.message_thread_id;

    // 2. Формування тексту з командою та ролями
    const textList = (members || [])
      .map((m) => {
        const userTag = m.telegramUserId 
          ? `[${m.fullName}](tg://user?id=${m.telegramUserId})` 
          : m.fullName;
        return `• *${m.role}:* ${userTag}`;
      })
      .join('\n');

    const fullMessage = `📌 *Проект створено:* ${projectName} (${projectId})\n\n` +
      `👥 *Команда проекту:*\n${textList || 'Учасників ще не призначено'}`;

    // 3. Відправка стартового повідомлення у створену гілку
    const msgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: GROUP_ID,
        message_thread_id: threadId,
        text: fullMessage,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📱 Відкрити картку проекту',
                url: `https://t.me/c/${String(GROUP_ID).replace('-100', '')}/${threadId}`
              }
            ]
          ]
        }
      })
    });

    const msgData = await msgResponse.json();

    // 4. Закріплення стартового повідомлення
    if (msgData.ok && msgData.result?.message_id) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/pinChatMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: GROUP_ID,
          message_id: msgData.result.message_id
        })
      });
    }

    const cleanGroupId = String(GROUP_ID).replace('-100', '');
    const topicLink = `https://t.me/c/${cleanGroupId}/${threadId}`;

    return res.status(200).json({
      success: true,
      topicLink: topicLink,
      threadId: threadId
    });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
