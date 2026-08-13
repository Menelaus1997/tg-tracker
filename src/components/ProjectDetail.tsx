const handleUpdateGeneralRow = (id: string, field: 'label' | 'value' | 'enableSecondRow', text: any) => {
    const updated = generalRows.map(r => {
      if (r.id === id) {
        const trimmedText = typeof text === 'string' ? text.trim() : text;
        
        // Перевіряємо, чи вставлено посилання в будь-яке з полів (label або value)
        if (
          (field === 'label' || field === 'value') &&
          typeof trimmedText === 'string' &&
          (trimmedText.startsWith('http://') || trimmedText.startsWith('https://'))
        ) {
          let detectedName = 'Посилання на проєкт';
          
          if (trimmedText.includes('drive.google.com') || trimmedText.includes('docs.google.com')) {
            detectedName = 'Google Drive';
          } else if (trimmedText.includes('t.me') || trimmedText.includes('telegram.org')) {
            detectedName = 'Telegram';
          } else if (trimmedText.includes('facebook.com')) {
            detectedName = 'Facebook';
          } else if (trimmedText.includes('instagram.com')) {
            detectedName = 'Instagram';
          } else if (trimmedText.includes('figma.com')) {
            detectedName = 'Figma';
          } else if (trimmedText.includes('notion.so')) {
            detectedName = 'Notion';
          }

          return {
            ...r,
            label: r.label && r.label.trim() !== '' && !r.label.startsWith('http') ? r.label : detectedName,
            value: trimmedText,
            enableSecondRow: true
          };
        }

        return { ...r, [field]: text };
      }
      return r;
    });
    setGeneralRows(updated);
    triggerAutoSave({ passportRows: updated });
  };
