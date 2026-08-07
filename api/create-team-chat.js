export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectName, projectId, members } = req.body;

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const GROUP_ID = process.env.TELEGRAM_GROUP_ID; // ID вашої спільної групи-форуму

  if (!BOT_TOKEN || !GROUP_ID) {
    return res.status(500).json({ 
      success: false, 
      error: 'Не налаштовані змінні TELEGRAM_BOT_TOKEN або TELEGRAM_GROUP_ID у Vercel.' 
    });
  }

  try {
    const topicName = `${projectName} (${projectId})`;

    // 1. Бот створює нову тему (гілку) у спільному чаті
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

    // 2. Бот публікує у створену гілку склад команди з ролями та нікнеймами
    const textList = (members || [])
      .map((m) => `• ${m.fullName} (${m.role}): ${m.telegramUsername ? `@${m.telegramUsername}` : 'без ТГ'}`)
      .join('\n');

    const fullMessage = `📌 *Проект створено:* ${projectName} (${projectId})\n\n` +
      `👥 *Команда проекту:*\n${textList}`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: GROUP_ID,
        message_thread_id: threadId,
        text: fullMessage,
        parse_mode: 'Markdown'
      })
    });

    // 3. Формуємо пряме посилання на створену гілку
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
