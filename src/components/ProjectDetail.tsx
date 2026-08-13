import React, { useState } from 'react';
import { Project, Stage, SubStage, TeamMember } from '../App';

interface ProjectDetailProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onSaveAsTemplate: (project: Project, templateName: string) => void;
  onBack: () => void;
  teamDatabase: TeamMember[];
  availableRoles: string[];
  currentUserRole?: string;
  rolesConfig?: any[];
}

interface GeneralDataRow {
  id: string;
  type: 'single' | 'double';
  label?: string;
  value: string;
  enableSecondRow?: boolean;
}

interface ProjectStatus {
  id: string;
  label: string;
  color: string;
}

const DEFAULT_STATUSES: ProjectStatus[] = [
  { id: '1', label: 'В процесі', color: '#007aff' },
  { id: '2', label: 'На паузі', color: '#ffcc00' },
  { id: '3', label: 'На перевірці', color: '#ff9500' },
  { id: '4', label: 'Завершено', color: '#34c759' }
];

const DEFAULT_COLORS = [
  '#34c759', '#00c7be', '#5856d6', '#007aff',
  '#ff3b30', '#5c3d2e', '#ff9500', '#af52de', '#8e8e93', '#ffcc00'
];

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onUpdateProject,
  onSaveAsTemplate,
  onBack,
  teamDatabase = [],
  availableRoles = [],
  currentUserRole = 'Керівник',
  rolesConfig = []
}) => {
  const currentRoleConfig = rolesConfig.find(r => r.name === currentUserRole);
  const permissions = currentRoleConfig?.permissions || {
    showDates: true,
    canManageSubtasks: true,
    showOnlyAssignedStages: false,
    canEditProjects: true
  };

  const isSuperAdmin = currentUserRole === 'Керівник' || permissions.canEditProjects;
  const canManageSubtasks = permissions.canManageSubtasks ?? true;
  const showOnlyAssignedStages = permissions.showOnlyAssignedStages ?? false;

  const [isHeaderOpen, setIsHeaderOpen] = useState(true);
  const [name, setName] = useState(project.name);
  const [projectId, setProjectId] = useState(project.id);
  
  const [tagsTitle, setTagsTitle] = useState((project as any).tagsTitle || 'Теги');
  const [dataTitle, setDataTitle] = useState((project as any).dataTitle || 'Дані');
  const [structureTitle, setStructureTitle] = useState((project as any).structureTitle || 'Структура');
  const [settingsTitle, setSettingsTitle] = useState((project as any).settingsTitle || 'Налаштування');

  const [enableRoles, setEnableRoles] = useState<boolean>(
    (project as any).enableRoles ?? (project as any).enableTeamRoles ?? true
  );
  const [enableTags, setEnableTags] = useState<boolean>((project as any).enableTags ?? true);
  const [showStageTags, setShowStageTags] = useState<boolean>((project as any).showStageTags ?? true);
  const [enableData, setEnableData] = useState<boolean>((project as any).enableData ?? true);
  const [enableTimeTracking, setEnableTimeTracking] = useState<boolean>((project as any).enableTimeTracking ?? true);
  const [showDates, setShowDates] = useState<boolean>((project as any).showDates ?? (permissions.showDates ?? true));
  
  const [enableSubtaskMoving, setEnableSubtaskMoving] = useState<boolean>((project as any).enableSubtaskMoving ?? true);
  const [enableNestedItems, setEnableNestedItems] = useState<boolean>((project as any).enableNestedItems ?? true);

  const [statuses, setStatuses] = useState<ProjectStatus[]>(
    (project.customStatuses || DEFAULT_STATUSES).map((s: any) => ({
      ...s,
      color: s.color || '#007aff'
    }))
  );

  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [selectedTagId, setSelectedTagId] = useState<string>(statuses[0]?.id || '');
  const [globalPickerColor, setGlobalPickerColor] = useState<string>(statuses[0]?.color || '#007aff');

  const [colors, setColors] = useState<string[]>(() => {
    const initial = [...DEFAULT_COLORS];
    if (project.color && !initial.includes(project.color)) {
      initial[0] = project.color;
    }
    return initial;
  });
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(() => {
    const idx = DEFAULT_COLORS.indexOf(project.color);
    return idx !== -1 ? idx : 0;
  });

  const [isGeneralDataOpen, setIsGeneralDataOpen] = useState(true);
  const [generalRows, setGeneralRows] = useState<GeneralDataRow[]>(() => project.passportRows || [
    { id: '1', type: 'single', label: '', value: '', enableSecondRow: true }
  ]);

  const [isStructureOpen, setIsStructureOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const [stages, setStages] = useState<Stage[]>(() => (project.stages || []).map(s => ({
    ...s,
    contractors: (s as any).contractors || (s.contractor ? [s.contractor] : [])
  })));
  const [collapsedStages, setCollapsedStages] = useState<{ [key: string]: boolean }>({});
  const [collapsedSubStages, setCollapsedSubStages] = useState<{ [key: string]: boolean }>({});

  const [newStageTitle, setNewStageTitle] = useState('');
  const [newSubStageTitle, setNewSubStageTitle] = useState<{ [key: string]: string }>({});

  const [editingTimeStageId, setEditingTimeStageId] = useState<string | null>(null);
  const [manualHours, setManualHours] = useState('0');
  const [manualMinutes, setManualMinutes] = useState('0');

  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState(project.name);

  const [draggedDataIndex, setDraggedDataIndex] = useState<number | null>(null);

  const triggerAutoSave = (overrides: Partial<Project> = {}) => {
    const updatedProject: Project = {
      ...project,
      id: projectId.trim(),
      name: name.trim(),
      color: colors[selectedColorIndex],
      passportRows: generalRows,
      stages,
      enableRoles,
      enableTeamRoles: enableRoles,
      enableTags,
      showStageTags,
      enableData,
      enableTimeTracking,
      showDates,
      enableSubtaskMoving,
      enableNestedItems,
      enableStructure: true,
      customStatuses: statuses,
      tagsTitle,
      dataTitle,
      structureTitle,
      settingsTitle,
      ...overrides
    } as any;

    onUpdateProject(updatedProject);
  };

  const handleAddStatus = () => {
    if (!isSuperAdmin) return;
    const newStatus: ProjectStatus = { id: Date.now().toString(), label: 'Новий тег', color: globalPickerColor };
    const updatedStatuses = [newStatus, ...statuses];
    setStatuses(updatedStatuses);
    setSelectedTagId(newStatus.id);
    triggerAutoSave({ customStatuses: updatedStatuses });
  };

  const handleDeleteStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSuperAdmin || statuses.length <= 1) return;
    const updatedStatuses = statuses.filter(s => s.id !== id);
    setStatuses(updatedStatuses);
    if (selectedTagId === id) {
      const nextActive = updatedStatuses[0];
      setSelectedTagId(nextActive.id);
      setGlobalPickerColor(nextActive.color);
    }
    triggerAutoSave({ customStatuses: updatedStatuses });
  };

  const handleUpdateStatusLabel = (statusId: string, newLabel: string) => {
    const updatedStatuses = statuses.map(s => s.id === statusId ? { ...s, label: newLabel } : s);
    setStatuses(updatedStatuses);
    triggerAutoSave({ customStatuses: updatedStatuses });
  };

  const handleGlobalPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setGlobalPickerColor(color);
    if (selectedTagId) {
      const updatedStatuses = statuses.map(s => s.id === selectedTagId ? { ...s, color } : s);
      setStatuses(updatedStatuses);
      triggerAutoSave({ customStatuses: updatedStatuses });
    }
  };

  const handleUpdateStageStatus = (stageId: string, statusLabel: string) => {
    const updatedStages = stages.map(s => s.id === stageId ? { ...s, currentStatus: statusLabel } : s);
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleCustomColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    const updated = [...colors];
    updated[selectedColorIndex] = newColor;
    setColors(updated);
    triggerAutoSave({ color: newColor });
  };

  const handleAddRowAfter = (index: number) => {
    const newRow: GeneralDataRow = { id: Date.now().toString(), type: 'single', label: '', value: '', enableSecondRow: true };
    const updated = [...generalRows];
    updated.splice(index + 1, 0, newRow);
    setGeneralRows(updated);
    triggerAutoSave({ passportRows: updated });
  };

  const handleUpdateGeneralRow = (id: string, field: 'label' | 'value' | 'enableSecondRow', text: any) => {
    const updated = generalRows.map(r => {
      if (r.id === id) {
        if (field === 'label') {
          const trimmedText = typeof text === 'string' ? text.trim() : text;
          
          if (trimmedText.startsWith('http://') || trimmedText.startsWith('https://')) {
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
              label: detectedName,
              value: trimmedText,
              enableSecondRow: true
            };
          }
        }
        return { ...r, [field]: text };
      }
      return r;
    });
    setGeneralRows(updated);
    triggerAutoSave({ passportRows: updated });
  };

  const handleDeleteGeneralRow = (id: string) => {
    const updated = generalRows.filter(r => r.id !== id);
    setGeneralRows(updated);
    triggerAutoSave({ passportRows: updated });
  };

  const handleDataDragStart = (index: number) => {
    setDraggedDataIndex(index);
  };

  const handleDataDrop = (targetIndex: number) => {
    if (draggedDataIndex === null || draggedDataIndex === targetIndex) return;
    const updated = [...generalRows];
    const [movedItem] = updated.splice(draggedDataIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    setGeneralRows(updated);
    setDraggedDataIndex(null);
    triggerAutoSave({ passportRows: updated });
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageTitle.trim() || !isSuperAdmin) return;

    const newStage: Stage = {
      id: Date.now().toString(),
      title: newStageTitle.trim(),
      subStages: [],
      trackTime: true,
      loggedSeconds: 0,
      isTimerRunning: false,
      startDate: '',
      endDate: '',
      reviewDate: '',
      correctionDate: '',
      contractors: [],
      currentStatus: statuses[0]?.label || 'В процесі'
    } as any;

    const updatedStages = [...stages, newStage];
    setStages(updatedStages);
    setNewStageTitle('');
    triggerAutoSave({ stages: updatedStages });
  };

  const handleUpdateStageTitle = (stageId: string, newTitle: string) => {
    if (!isSuperAdmin) return;
    const updatedStages = stages.map(s => s.id === stageId ? { ...s, title: newTitle } : s);
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleAddStageContractor = (stageId: string, contractorName: string, roleName: string) => {
    if (!contractorName) return;
    const formattedEntry = roleName ? `${contractorName} (${roleName})` : contractorName;
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        const currentList = (s as any).contractors || (s.contractor ? [s.contractor] : []);
        if (!currentList.includes(formattedEntry)) {
          return { ...s, contractors: [...currentList, formattedEntry] };
        }
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleRemoveStageContractor = (stageId: string, contractorEntry: string) => {
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        const currentList = (s as any).contractors || (s.contractor ? [s.contractor] : []);
        return { ...s, contractors: currentList.filter((c: string) => c !== contractorEntry) };
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleDeleteStage = (id: string) => {
    if (!isSuperAdmin) return;
    const updatedStages = stages.filter(s => s.id !== id);
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleToggleStageTrackTime = (stageId: string) => {
    const updatedStages = stages.map(s => s.id === stageId ? { ...s, trackTime: s.trackTime === false } : s);
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleToggleStageTimer = (stageId: string) => {
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        return { ...s, isTimerRunning: !s.isTimerRunning };
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleSaveManualTime = (stageId: string) => {
    const sec = (parseInt(manualHours) || 0) * 3600 + (parseInt(manualMinutes) || 0) * 60;
    const updatedStages = stages.map(s => s.id === stageId ? { ...s, loggedSeconds: sec } : s);
    setStages(updatedStages);
    setEditingTimeStageId(null);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleUpdateStageDates = (stageId: string, field: 'startDate' | 'endDate', val: string) => {
    if (!isSuperAdmin) return;
    if (val) {
      const dateObj = new Date(val);
      const dayOfWeek = dateObj.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        alert('Вихідні (субота та неділя) не можуть бути вибрані. Будь ласка, оберіть будній день.');
        return;
      }
    }
    const updatedStages = stages.map(s => s.id === stageId ? { ...s, [field]: val } : s);
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleAddSubStage = (stageId: string) => {
    const title = newSubStageTitle[stageId];
    if (!title || !title.trim()) return;

    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        const newSub: SubStage = {
          id: Date.now().toString(),
          title: title.trim(),
          completed: false,
          nestedItems: []
        } as any;
        return { ...s, subStages: [...s.subStages, newSub] };
      }
      return s;
    });

    setStages(updatedStages);
    setNewSubStageTitle({ ...newSubStageTitle, [stageId]: '' });
    triggerAutoSave({ stages: updatedStages });
  };

  const handleMoveSubStage = (stageId: string, index: number, direction: 'up' | 'down') => {
    if (!canManageSubtasks || !enableSubtaskMoving) return;
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const subList = [...s.subStages];
        if (targetIndex < 0 || targetIndex >= subList.length) return s;
        const [moved] = subList.splice(index, 1);
        subList.splice(targetIndex, 0, moved);
        return { ...s, subStages: subList };
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleUpdateSubStageTitle = (stageId: string, subStageId: string, newTitle: string) => {
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          subStages: s.subStages.map(sub => sub.id === subStageId ? { ...sub, title: newTitle } : sub)
        };
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleToggleSubStage = (stageId: string, subStageId: string) => {
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          subStages: s.subStages.map(sub => sub.id === subStageId ? { ...sub, completed: !sub.completed } : sub)
        };
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleDeleteSubStage = (stageId: string, subStageId: string) => {
    if (!canManageSubtasks) return;
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        return { ...s, subStages: s.subStages.filter(sub => sub.id !== subStageId) };
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleAddNestedItem = (stageId: string, subStageId: string) => {
    if (!canManageSubtasks || !enableNestedItems) return;

    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          subStages: s.subStages.map(sub => {
            if (sub.id === subStageId) {
              const nested = (sub as any).nestedItems || [];
              const newItem = { id: Date.now().toString(), title: '', completed: false };
              return { ...sub, nestedItems: [...nested, newItem] };
            }
            return sub;
          })
        };
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleMoveNestedItem = (stageId: string, subStageId: string, index: number, direction: 'up' | 'down') => {
    if (!canManageSubtasks || !enableSubtaskMoving) return;
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          subStages: s.subStages.map(sub => {
            if (sub.id === subStageId) {
              const nested = [...((sub as any).nestedItems || [])];
              const targetIndex = direction === 'up' ? index - 1 : index + 1;
              if (targetIndex < 0 || targetIndex >= nested.length) return sub;
              const [moved] = nested.splice(index, 1);
              nested.splice(targetIndex, 0, moved);
              return { ...sub, nestedItems: nested };
            }
            return sub;
          })
        };
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleUpdateNestedItemTitle = (stageId: string, subStageId: string, itemId: string, newTitle: string) => {
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          subStages: s.subStages.map(sub => {
            if (sub.id === subStageId) {
              const nested = (sub as any).nestedItems || [];
              return {
                ...sub,
                nestedItems: nested.map((item: any) => item.id === itemId ? { ...item, title: newTitle } : item)
              };
            }
            return sub;
          })
        };
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleToggleNestedItem = (stageId: string, subStageId: string, itemId: string) => {
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          subStages: s.subStages.map(sub => {
            if (sub.id === subStageId) {
              const nested = (sub as any).nestedItems || [];
              return {
                ...sub,
                nestedItems: nested.map((item: any) => item.id === itemId ? { ...item, completed: !item.completed } : item)
              };
            }
            return sub;
          })
        };
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleDeleteNestedItem = (stageId: string, subStageId: string, itemId: string) => {
    if (!canManageSubtasks) return;
    const updatedStages = stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          subStages: s.subStages.map(sub => {
            if (sub.id === subStageId) {
              const nested = (sub as any).nestedItems || [];
              return {
                ...sub,
                nestedItems: nested.filter((item: any) => item.id !== itemId)
              };
            }
            return sub;
          })
        };
      }
      return s;
    });
    setStages(updatedStages);
    triggerAutoSave({ stages: updatedStages });
  };

  const handleFinalSave = () => {
    const updatedProject: Project = {
      ...project,
      id: projectId.trim(),
      name: name.trim(),
      color: colors[selectedColorIndex],
      passportRows: generalRows,
      stages,
      enableRoles,
      enableTeamRoles: enableRoles,
      enableTags,
      showStageTags,
      enableData,
      enableTimeTracking,
      showDates,
      enableSubtaskMoving,
      enableNestedItems,
      enableStructure: true,
      customStatuses: statuses,
      tagsTitle,
      dataTitle,
      structureTitle,
      settingsTitle
    } as any;

    onUpdateProject(updatedProject);

    if (saveAsTemplate && templateNameInput.trim()) {
      onSaveAsTemplate(updatedProject, templateNameInput.trim());
    }

    alert('Зміни успішно збережено!');
    onBack();
  };

  const formatTime = (sec: number = 0) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}г ${m}хв`;
  };

  const displayedStages = stages.filter(st => {
    if (!enableRoles) return true;
    if (!showOnlyAssignedStages || isSuperAdmin) return true;
    const stageContractors: string[] = (st as any).contractors || (st.contractor ? [st.contractor] : []);
    return stageContractors.some(c => c.toLowerCase().includes(currentUserRole.toLowerCase()));
  });

  const formatDateShort = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}`;
  };

  const lastStage = stages[stages.length - 1];
  const finalProjectDeadline = lastStage ? ((lastStage as any).reviewDate || lastStage.endDate) : '';

  const dateBoxStyle: React.CSSProperties = {
    height: '24px',
    boxSizing: 'border-box',
    fontSize: '12px',
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#1c1c1e',
    backgroundColor: '#e5e5ea',
    border: 'none',
    padding: '0 8px',
    borderRadius: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    lineHeight: 1
  };

  const firstTag = statuses[0];
  const remainingTags = statuses.slice(1);

  return (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', color: '#1c1c1e', paddingBottom: '80px', fontFamily: "'SF Pro Condensed', -apple-system, sans-serif", fontSize: '11px', lineHeight: 1 }}>
      <button 
        onClick={onBack} 
        style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', color: '#000000', cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1 }}
      >
        <span>←</span> <span>НАЗАД</span>
      </button>

      {/* 1. Header Block */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
        <div 
          onClick={() => setIsHeaderOpen(!isHeaderOpen)} 
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isHeaderOpen ? '10px' : 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#8e8e93' }}>{isHeaderOpen ? '▲' : '▼'}</span>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', lineHeight: 1 }}>{name || 'Без назви'}</h3>
          </div>
        </div>

        {isHeaderOpen && isSuperAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
            <div>
              <label style={labelStyle}>Назва проекту</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => triggerAutoSave({ name: e.target.value.trim() })}
                style={cardInputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>ID проекту</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                onBlur={(e) => triggerAutoSave({ id: e.target.value.trim() })}
                style={cardInputStyle}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px', marginTop: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
              {colors.slice(0, 8).map((c, idx) => {
                const isSelected = selectedColorIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedColorIndex(idx);
                      triggerAutoSave({ color: c });
                    }}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: '1px solid #d1d1d6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {isSelected && <span style={{ color: '#fff', fontSize: '10px' }}>✓</span>}
                  </div>
                );
              })}

              <label
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#e5e5ea',
                  border: '1px solid #d1d1d6',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '14px',
                  color: '#007aff',
                  position: 'relative',
                  padding: 0,
                  margin: 0,
                  boxSizing: 'border-box'
                }}
                title="Додати власний колір"
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', lineHeight: 1 }}>+</span>
                <input
                  type="color"
                  value={colors[selectedColorIndex] || '#007aff'}
                  onChange={handleCustomColorPicker}
                  style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', top: 0, left: 0 }}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Блок "Теги" */}
      {isSuperAdmin && enableTags && (
        <div style={{ backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: isTagsOpen ? '8px' : 0 }}>
            <span 
              onClick={() => setIsTagsOpen(!isTagsOpen)} 
              style={{ fontSize: '11px', color: '#8e8e93', cursor: 'pointer', userSelect: 'none' }}
            >
              {isTagsOpen ? '▲' : '▼'}
            </span>
            <input
              type="text"
              value={tagsTitle}
              onChange={(e) => {
                setTagsTitle(e.target.value);
                triggerAutoSave({ tagsTitle: e.target.value });
              }}
              style={{ ...inlineTitleInputStyle, fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', flex: 1, padding: 0 }}
            />
          </div>

          {isTagsOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                <button onClick={handleAddStatus} style={{ ...compactPlusBtnStyle, height: '24px', width: '24px', borderRadius: '12px' }} title="Додати тег">+</button>

                <label 
                  style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: globalPickerColor, 
                    border: '1px solid #d1d1d6', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexShrink: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    boxSizing: 'border-box'
                  }}
                  title="Обрати колір"
                >
                  <input
                    type="color"
                    value={globalPickerColor}
                    onChange={handleGlobalPickerChange}
                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', top: 0, left: 0 }}
                  />
                </label>

                {firstTag && (
                  <div 
                    key={firstTag.id} 
                    style={{ 
                      height: '24px',
                      boxSizing: 'border-box',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      padding: '0 8px 0 2px', 
                      borderRadius: '12px', 
                      backgroundColor: '#e5e5ea', 
                      border: 'none',
                      color: '#1c1c1e', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      fontStyle: 'italic'
                    }}
                  >
                    <div 
                      onClick={() => {
                        setSelectedTagId(firstTag.id);
                        setGlobalPickerColor(firstTag.color);
                      }}
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        backgroundColor: firstTag.color, 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0 
                      }}
                    >
                      {selectedTagId === firstTag.id && <span style={{ color: '#fff', fontSize: '9px', lineHeight: 1 }}>✓</span>}
                    </div>

                    <input
                      type="text"
                      value={firstTag.label}
                      onChange={(e) => handleUpdateStatusLabel(firstTag.id, e.target.value)}
                      style={{ border: 'none', background: 'transparent', color: '#1c1c1e', fontSize: '12px', fontWeight: 'bold', fontStyle: 'italic', outline: 'none', width: `${Math.max(firstTag.label.length, 4) * 7}px`, height: '100%', lineHeight: '24px' }}
                    />

                    {statuses.length > 1 && (
                      <button 
                        onClick={(e) => handleDeleteStatus(firstTag.id, e)} 
                        style={{ background: 'none', border: 'none', color: '#8e8e93', cursor: 'pointer', fontSize: '10px', padding: 0 }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>

              {remainingTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  {remainingTags.map(s => {
                    const isSelected = selectedTagId === s.id;
                    return (
                      <div 
                        key={s.id} 
                        style={{ 
                          height: '24px',
                          boxSizing: 'border-box',
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          padding: '0 8px 0 2px', 
                          borderRadius: '12px', 
                          backgroundColor: '#e5e5ea', 
                          border: 'none',
                          color: '#1c1c1e', 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          fontStyle: 'italic'
                        }}
                      >
                        <div 
                          onClick={() => {
                            setSelectedTagId(s.id);
                            setGlobalPickerColor(s.color);
                          }}
                          style={{ 
                            width: '16px', 
                            height: '16px', 
                            borderRadius: '50%', 
                            backgroundColor: s.color, 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            flexShrink: 0 
                          }}
                        >
                          {isSelected && <span style={{ color: '#fff', fontSize: '9px', lineHeight: 1 }}>✓</span>}
                        </div>

                        <input
                          type="text"
                          value={s.label}
                          onChange={(e) => handleUpdateStatusLabel(s.id, e.target.value)}
                          style={{ border: 'none', background: 'transparent', color: '#1c1c1e', fontSize: '12px', fontWeight: 'bold', fontStyle: 'italic', outline: 'none', width: `${Math.max(s.label.length, 4) * 7}px`, height: '100%', lineHeight: '24px' }}
                        />

                        {statuses.length > 1 && (
                          <button 
                            onClick={(e) => handleDeleteStatus(s.id, e)} 
                            style={{ background: 'none', border: 'none', color: '#8e8e93', cursor: 'pointer', fontSize: '10px', padding: 0 }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Блок "Дані" */}
      {isSuperAdmin && enableData && (
        <div style={{ backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span 
              onClick={() => setIsGeneralDataOpen(!isGeneralDataOpen)}
              style={{ fontSize: '11px', color: '#8e8e93', cursor: 'pointer', userSelect: 'none' }}
            >
              {isGeneralDataOpen ? '▲' : '▼'}
            </span>
            <input
              type="text"
              value={dataTitle}
              onChange={(e) => {
                setDataTitle(e.target.value);
                triggerAutoSave({ dataTitle: e.target.value });
              }}
              style={{ ...inlineTitleInputStyle, fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', flex: 1, padding: 0 }}
            />
          </div>

          {isGeneralDataOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              {generalRows.map((r, index) => (
                <div 
                  key={r.id} 
                  draggable={isSuperAdmin}
                  onDragStart={() => handleDataDragStart(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDataDrop(index)}
                  style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: isSuperAdmin ? 'grab' : 'default' }}
                >
                  <textarea
                    placeholder="Назва рядка або вставте посилання"
                    value={r.label || ''}
                    onChange={(e) => handleUpdateGeneralRow(r.id, 'label', e.target.value)}
                    disabled={!isSuperAdmin}
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                    style={{ 
                      ...cardInputStyle, 
                      flex: 1, 
                      minHeight: '24px', 
                      height: '24px',
                      padding: '4px 6px', 
                      boxSizing: 'border-box',
                      resize: 'none',
                      overflow: 'hidden',
                      lineHeight: 1,
                      fontFamily: 'inherit',
                      fontSize: '11px',
                      fontStyle: 'italic'
                    }}
                  />

                  {r.enableSecondRow && (
                    <div style={{ flex: 'none', display: 'flex', alignItems: 'center' }}>
                      {r.value && (r.value.startsWith('http://') || r.value.startsWith('https://')) ? (
                        <a
                          href={r.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={r.value}
                          style={{
                            ...cardInputStyle,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#007aff',
                            textDecoration: 'underline',
                            width: 'auto',
                            minWidth: '60px',
                            maxWidth: '120px',
                            height: '24px',
                            padding: '2px 6px',
                            boxSizing: 'border-box',
                            fontSize: '11px',
                            fontStyle: 'italic',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer'
                          }}
                        >
                          {r.label || 'Посилання'}
                        </a>
                      ) : (
                        <input
                          type="text"
                          placeholder="Значення"
                          value={r.value}
                          onChange={(e) => handleUpdateGeneralRow(r.id, 'value', e.target.value)}
                          disabled={!isSuperAdmin}
                          style={{ 
                            ...cardInputStyle, 
                            flex: 'none', 
                            width: `${Math.max((r.value || '').length + 4, 8)}ch`, 
                            minWidth: '60px',
                            height: '24px', 
                            padding: '2px 6px', 
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            fontSize: '11px',
                            fontStyle: 'italic' 
                          }}
                        />
                      )}
                    </div>
                  )}

                  <input
                    type="checkbox"
                    checked={r.enableSecondRow ?? true}
                    onChange={(e) => handleUpdateGeneralRow(r.id, 'enableSecondRow', e.target.checked)}
                    title="Увімкнути значення"
                    style={{ cursor: 'pointer', width: '14px', height: '14px', flexShrink: 0 }}
                  />

                  {isSuperAdmin && (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '60px', justifyContent: 'center' }}>
                      <button onClick={() => handleAddRowAfter(index)} style={compactPlusBtnStyle}>+</button>
                      <button onClick={() => handleDeleteGeneralRow(r.id)} style={{ ...compactPlusBtnStyle, color: '#ff3b30' }}>🗑️</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Блок "Структура" */}
      <div style={{ backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isStructureOpen ? '10px' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <span 
              onClick={() => setIsStructureOpen(!isStructureOpen)}
              style={{ fontSize: '11px', color: '#8e8e93', cursor: 'pointer', userSelect: 'none' }}
            >
              {isStructureOpen ? '▲' : '▼'}
            </span>
            <input
              type="text"
              value={structureTitle}
              onChange={(e) => {
                setStructureTitle(e.target.value);
                triggerAutoSave({ structureTitle: e.target.value });
              }}
              style={{ ...inlineTitleInputStyle, fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', flex: 1, padding: 0 }}
            />
          </div>

          {showDates && finalProjectDeadline && (
            <div style={dateBoxStyle}>
              📅 {formatDateShort(finalProjectDeadline)}
            </div>
          )}
        </div>

        {isStructureOpen && (
          <>
            {isSuperAdmin && (
              <form onSubmit={handleAddStage} style={{ display: 'flex', gap: '6px', marginBottom: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="створіть власну структуру"
                  value={newStageTitle}
                  onChange={(e) => setNewStageTitle(e.target.value)}
                  style={{ ...cardInputStyle, flex: 1, height: '24px', padding: '2px 6px', boxSizing: 'border-box', fontSize: '11px', fontStyle: 'italic' }}
                />
                <button type="submit" style={compactPlusBtnStyle}>
                  +
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayedStages.map((st) => {
                const isCollapsed = collapsedStages[st.id];
                const isTrackTimeOn = st.trackTime !== false;
                const stageContractors: string[] = (st as any).contractors || (st.contractor ? [st.contractor] : []);
                
                const currentStageStatusLabel = (st as any).currentStatus || statuses[0]?.label || 'В процесі';
                const currentStatusObj = statuses.find(s => s.label === currentStageStatusLabel) || statuses[0];

                const deadlineDateStr = (st as any).reviewDate || st.endDate;

                return (
                  <div key={st.id} style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e5e5ea' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      {showDates && deadlineDateStr && (
                        <div style={dateBoxStyle}>
                          📅 {formatDateShort(deadlineDateStr)}
                        </div>
                      )}

                      {showStageTags && (
                        <select 
                          value={currentStageStatusLabel}
                          onChange={(e) => handleUpdateStageStatus(st.id, e.target.value)}
                          style={{ 
                            height: '24px',
                            boxSizing: 'border-box',
                            border: 'none', 
                            borderRadius: '12px', 
                            padding: '0 8px', 
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            fontStyle: 'italic',
                            backgroundColor: currentStatusObj?.color || '#8e8e93',
                            color: '#000000',
                            cursor: 'pointer',
                            outline: 'none',
                            lineHeight: 1
                          }}
                        >
                          {statuses.map(s => (
                            <option key={s.id} value={s.label} style={{ backgroundColor: '#fff', color: '#000000', fontStyle: 'normal' }}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                        <span 
                          onClick={() => setCollapsedStages({ ...collapsedStages, [st.id]: !isCollapsed })}
                          style={{ fontSize: '11px', color: '#8e8e93', cursor: 'pointer', userSelect: 'none' }}
                        >
                          {isCollapsed ? '▼' : '▲'}
                        </span>

                        {isSuperAdmin ? (
                          <input
                            type="text"
                            value={st.title}
                            onChange={(e) => handleUpdateStageTitle(st.id, e.target.value)}
                            style={{ ...inlineTitleInputStyle, fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic' }}
                          />
                        ) : (
                          <span style={{ fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', color: '#1c1c1e' }}>{st.title}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {enableRoles && enableTimeTracking && isTrackTimeOn && (
                          <>
                            <button
                              onClick={() => handleToggleStageTimer(st.id)}
                              style={{
                                ...btnStyle,
                                backgroundColor: st.isTimerRunning ? '#ff3b30' : '#34c759',
                                color: '#fff',
                                fontSize: '10px',
                                padding: '2px 6px'
                              }}
                            >
                              {st.isTimerRunning ? `⏸ [ ${formatTime(st.loggedSeconds)} ]` : `▶ [ ${formatTime(st.loggedSeconds)} ]`}
                            </button>

                            <button
                              onClick={() => {
                                setEditingTimeStageId(editingTimeStageId === st.id ? null : st.id);
                                setManualHours(Math.floor((st.loggedSeconds || 0) / 3600).toString());
                                setManualMinutes(Math.floor(((st.loggedSeconds || 0) % 3600) / 60).toString());
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                            >
                              ⏱️
                            </button>
                          </>
                        )}

                        {isSuperAdmin && (
                          <div style={{ width: '32px', display: 'flex', justifyContent: 'center' }}>
                            <button onClick={() => handleDeleteStage(st.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px' }}>
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingTimeStageId === st.id && (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '6px', padding: '4px', backgroundColor: '#f2f2f7', borderRadius: '6px', fontSize: '11px' }}>
                        <span>Годин:</span>
                        <input type="number" value={manualHours} onChange={(e) => setManualHours(e.target.value)} style={{ ...cardInputStyle, width: '40px', padding: '2px 4px', height: '24px', boxSizing: 'border-box', fontSize: '11px', fontStyle: 'italic' }} />
                        <span>Хвил:</span>
                        <input type="number" value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} style={{ ...cardInputStyle, width: '40px', padding: '2px 4px', height: '24px', boxSizing: 'border-box', fontSize: '11px', fontStyle: 'italic' }} />
                        <button onClick={() => handleSaveManualTime(st.id)} style={{ ...btnStyle, backgroundColor: '#34c759', color: '#fff', padding: '2px 4px', fontSize: '10px' }}>✓</button>
                      </div>
                    )}

                    {!isCollapsed && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #e5e5ea' }}>
                        
                        {enableRoles && enableTimeTracking && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                            <span>Облік часу</span>
                            <div style={{ width: '32px', display: 'flex', justifyContent: 'center' }}>
                              <div
                                onClick={() => handleToggleStageTrackTime(st.id)}
                                style={{
                                  width: '30px',
                                  height: '16px',
                                  borderRadius: '8px',
                                  backgroundColor: isTrackTimeOn ? '#34c759' : '#e5e5ea',
                                  position: 'relative',
                                  cursor: 'pointer'
                                }}
                              >
                                <div
                                  style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fff',
                                    position: 'absolute',
                                    top: '2px',
                                    left: isTrackTimeOn ? '16px' : '2px',
                                    transition: 'left 0.2s'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Підстадії */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                          {st.subStages.map((sub, idx) => {
                            const nestedItems = (sub as any).nestedItems || [];
                            const isSubCollapsed = collapsedSubStages[sub.id];

                            return (
                              <div key={sub.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: '#f9f9fb', padding: '6px', borderRadius: '6px', border: '1px solid #e5e5ea' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                                    
                                    {canManageSubtasks && enableSubtaskMoving && (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginRight: '2px' }}>
                                        <button 
                                          onClick={() => handleMoveSubStage(st.id, idx, 'up')}
                                          disabled={idx === 0}
                                          style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', fontSize: '7px', padding: 0, color: idx === 0 ? '#d1d1d6' : '#007aff', lineHeight: 1 }}
                                        >
                                          ▲
                                        </button>
                                        <button 
                                          onClick={() => handleMoveSubStage(st.id, idx, 'down')}
                                          disabled={idx === st.subStages.length - 1}
                                          style={{ background: 'none', border: 'none', cursor: idx === st.subStages.length - 1 ? 'default' : 'pointer', fontSize: '7px', padding: 0, color: idx === st.subStages.length - 1 ? '#d1d1d6' : '#007aff', lineHeight: 1 }}
                                        >
                                          ▼
                                        </button>
                                      </div>
                                    )}

                                    {enableNestedItems && (
                                      <span 
                                        onClick={() => setCollapsedSubStages({ ...collapsedSubStages, [sub.id]: !isSubCollapsed })}
                                        style={{ fontSize: '10px', color: '#8e8e93', cursor: 'pointer', userSelect: 'none', width: '10px', textAlign: 'center' }}
                                      >
                                        {isSubCollapsed ? '▶' : '▼'}
                                      </span>
                                    )}

                                    <input
                                      type="checkbox"
                                      checked={sub.completed}
                                      onChange={() => handleToggleSubStage(st.id, sub.id)}
                                      style={{ width: '12px', height: '12px' }}
                                    />
                                    <span style={{ color: '#1c1c1e', userSelect: 'none', minWidth: '14px', fontStyle: 'italic' }}>{idx + 1}.</span>

                                    <input
                                      type="text"
                                      value={sub.title}
                                      disabled={!canManageSubtasks}
                                      onChange={(e) => handleUpdateSubStageTitle(st.id, sub.id, e.target.value)}
                                      style={{
                                        ...inlineTitleInputStyle,
                                        fontSize: '11px',
                                        fontStyle: 'italic',
                                        textDecoration: sub.completed ? 'line-through' : 'none',
                                        color: sub.completed ? '#8e8e93' : '#1c1c1e'
                                      }}
                                    />
                                  </div>

                                  {canManageSubtasks && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      {enableNestedItems && (
                                        <button 
                                          onClick={() => {
                                            if (isSubCollapsed) {
                                              setCollapsedSubStages({ ...collapsedSubStages, [sub.id]: false });
                                            }
                                            handleAddNestedItem(st.id, sub.id);
                                          }} 
                                          style={{ ...compactPlusBtnStyle, width: '20px', height: '20px', fontSize: '11px' }}
                                        >
                                          +
                                        </button>
                                      )}
                                      <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                                        <button onClick={() => handleDeleteSubStage(st.id, sub.id)} style={{ ...iconBtnStyle, color: '#ff3b30' }}>🗑️</button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {enableNestedItems && !isSubCollapsed && nestedItems.length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '22px', marginTop: '2px' }}>
                                    {nestedItems.map((item: any, itemIdx: number) => (
                                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                                          
                                          {canManageSubtasks && enableSubtaskMoving && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginRight: '2px' }}>
                                              <button 
                                                onClick={() => handleMoveNestedItem(st.id, sub.id, itemIdx, 'up')}
                                                disabled={itemIdx === 0}
                                                style={{ background: 'none', border: 'none', cursor: itemIdx === 0 ? 'default' : 'pointer', fontSize: '7px', padding: 0, color: itemIdx === 0 ? '#d1d1d6' : '#636366', lineHeight: 1 }}
                                              >
                                                ▲
                                              </button>
                                              <button 
                                                onClick={() => handleMoveNestedItem(st.id, sub.id, itemIdx, 'down')}
                                                disabled={itemIdx === nestedItems.length - 1}
                                                style={{ background: 'none', border: 'none', cursor: itemIdx === nestedItems.length - 1 ? 'default' : 'pointer', fontSize: '7px', padding: 0, color: itemIdx === nestedItems.length - 1 ? '#d1d1d6' : '#636366', lineHeight: 1 }}
                                              >
                                                ▼
                                              </button>
                                            </div>
                                          )}

                                          <input
                                            type="checkbox"
                                            checked={item.completed}
                                            onChange={() => handleToggleNestedItem(st.id, sub.id, item.id)}
                                            style={{ width: '12px', height: '12px' }}
                                          />
                                          <span style={{ color: '#636366', userSelect: 'none', minWidth: '20px', fontStyle: 'italic' }}>{idx + 1}.{itemIdx + 1}</span>

                                          <input
                                            type="text"
                                            value={item.title}
                                            disabled={!canManageSubtasks}
                                            onChange={(e) => handleUpdateNestedItemTitle(st.id, sub.id, item.id, e.target.value)}
                                            style={{
                                              ...inlineTitleInputStyle,
                                              fontSize: '11px',
                                              fontStyle: 'italic',
                                              textDecoration: item.completed ? 'line-through' : 'none',
                                              color: item.completed ? '#8e8e93' : '#3a3a3c'
                                            }}
                                          />
                                        </div>

                                        {canManageSubtasks && (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ width: '20px' }} />
                                            <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                                              <button onClick={() => handleDeleteNestedItem(st.id, sub.id, item.id)} style={{ ...iconBtnStyle, color: '#ff3b30' }}>🗑️</button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {canManageSubtasks && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="Додати підзадачу"
                              value={newSubStageTitle[st.id] || ''}
                              onChange={(e) => setNewSubStageTitle({ ...newSubStageTitle, [st.id]: e.target.value })}
                              style={{ ...cardInputStyle, padding: '2px 6px', fontSize: '11px', fontStyle: 'italic', height: '24px', boxSizing: 'border-box', flex: 1 }}
                            />
                            <button onClick={() => handleAddSubStage(st.id)} style={{ ...compactPlusBtnStyle, width: '24px', height: '24px', boxSizing: 'border-box' }}>
                              +
                            </button>
                          </div>
                        )}

                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #d1d1d6', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          
                          {showDates && isSuperAdmin && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '11px', color: '#636366' }}>Терміни (Старт / Дедлайн):</span>
                              <div style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
                                <input
                                  type="date"
                                  title="Дата початку"
                                  value={st.startDate || ''}
                                  onChange={(e) => handleUpdateStageDates(st.id, 'startDate', e.target.value)}
                                  style={{ ...cardInputStyle, flex: 1, padding: '2px 4px', fontSize: '11px', fontStyle: 'italic', height: '24px', boxSizing: 'border-box' }}
                                />
                                <input
                                  type="date"
                                  title="Дедлайн"
                                  value={(st as any).reviewDate || st.endDate || ''}
                                  onChange={(e) => handleUpdateStageDates(st.id, 'endDate', e.target.value)}
                                  style={{ ...cardInputStyle, flex: 1, padding: '2px 4px', fontSize: '11px', fontStyle: 'italic', height: '24px', boxSizing: 'border-box' }}
                                />
                              </div>
                            </div>
                          )}

                          {isSuperAdmin && enableRoles && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', alignItems: 'center' }}>
                                <select
                                  id={`select-contractor-${st.id}`}
                                  defaultValue=""
                                  style={{ ...cardInputStyle, fontSize: '11px', fontStyle: 'italic', height: '24px', padding: '2px 6px', boxSizing: 'border-box', width: '100%' }}
                                >
                                  <option value="">Виберіть виконавця...</option>
                                  {teamDatabase.map(m => (
                                    <option key={m.id} value={m.fullName} style={{ fontStyle: 'normal' }}>
                                      {m.fullName}
                                    </option>
                                  ))}
                                </select>

                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '100%' }}>
                                  <select
                                    id={`select-role-${st.id}`}
                                    defaultValue=""
                                    style={{ ...cardInputStyle, fontSize: '11px', fontStyle: 'italic', height: '24px', padding: '2px 6px', boxSizing: 'border-box', flex: 1 }}
                                  >
                                    <option value="">Виберіть роль...</option>
                                    {availableRoles.map((r, rIdx) => (
                                      <option key={rIdx} value={r} style={{ fontStyle: 'normal' }}>
                                        {r}
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const contractorEl = document.getElementById(`select-contractor-${st.id}`) as HTMLSelectElement;
                                      const roleEl = document.getElementById(`select-role-${st.id}`) as HTMLSelectElement;
                                      if (contractorEl && contractorEl.value) {
                                        handleAddStageContractor(st.id, contractorEl.value, roleEl ? roleEl.value : '');
                                        contractorEl.value = '';
                                        if (roleEl) roleEl.value = '';
                                      }
                                    }}
                                    style={{ ...compactPlusBtnStyle, width: '24px', height: '24px', boxSizing: 'border-box', flexShrink: 0 }}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {stageContractors.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                                  {stageContractors.map((cEntry, cIdx) => (
                                    <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#e5e5ea', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                                      <span>{cEntry}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveStageContractor(st.id, cEntry)}
                                        style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: '10px', padding: 0 }}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* --- Блок "Налаштування" --- */}
      {isSuperAdmin && (
        <div style={{ backgroundColor: '#f2f2f7', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: isSettingsOpen ? '10px' : 0 }}>
            <span 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              style={{ fontSize: '11px', color: '#8e8e93', cursor: 'pointer', userSelect: 'none' }}
            >
              {isSettingsOpen ? '▲' : '▼'}
            </span>
            <input
              type="text"
              value={settingsTitle}
              onChange={(e) => {
                setSettingsTitle(e.target.value);
                triggerAutoSave({ settingsTitle: e.target.value });
              }}
              style={{ ...inlineTitleInputStyle, fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', flex: 1, padding: 0 }}
            />
          </div>

          {isSettingsOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              
              <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e5ea' }}>
                <span style={{ fontSize: '11px', color: '#1c1c1e', fontStyle: 'italic' }}>Ролі</span>
                <div
                  onClick={() => {
                    const nextVal = !enableRoles;
                    setEnableRoles(nextVal);
                    triggerAutoSave({ enableRoles: nextVal, enableTeamRoles: nextVal });
                  }}
                  style={{
                    width: '30px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: enableRoles ? '#34c759' : '#e5e5ea',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: enableRoles ? '16px' : '2px',
                      transition: 'left 0.2s'
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e5ea' }}>
                <span style={{ fontSize: '11px', color: '#1c1c1e', fontStyle: 'italic' }}>Теги</span>
                <div
                  onClick={() => {
                    const nextVal = !enableTags;
                    setEnableTags(nextVal);
                    triggerAutoSave({ enableTags: nextVal });
                  }}
                  style={{
                    width: '30px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: enableTags ? '#34c759' : '#e5e5ea',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: enableTags ? '16px' : '2px',
                      transition: 'left 0.2s'
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e5ea' }}>
                <span style={{ fontSize: '11px', color: '#1c1c1e', fontStyle: 'italic' }}>Теги в структурі</span>
                <div
                  onClick={() => {
                    const nextVal = !showStageTags;
                    setShowStageTags(nextVal);
                    triggerAutoSave({ showStageTags: nextVal });
                  }}
                  style={{
                    width: '30px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: showStageTags ? '#34c759' : '#e5e5ea',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: showStageTags ? '16px' : '2px',
                      transition: 'left 0.2s'
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e5ea' }}>
                <span style={{ fontSize: '11px', color: '#1c1c1e', fontStyle: 'italic' }}>Дані</span>
                <div
                  onClick={() => {
                    const nextVal = !enableData;
                    setEnableData(nextVal);
                    triggerAutoSave({ enableData: nextVal });
                  }}
                  style={{
                    width: '30px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: enableData ? '#34c759' : '#e5e5ea',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: enableData ? '16px' : '2px',
                      transition: 'left 0.2s'
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e5ea' }}>
                <span style={{ fontSize: '11px', color: '#1c1c1e', fontStyle: 'italic' }}>Облік часу</span>
                <div
                  onClick={() => {
                    const nextVal = !enableTimeTracking;
                    setEnableTimeTracking(nextVal);
                    triggerAutoSave({ enableTimeTracking: nextVal });
                  }}
                  style={{
                    width: '30px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: enableTimeTracking ? '#34c759' : '#e5e5ea',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: enableTimeTracking ? '16px' : '2px',
                      transition: 'left 0.2s'
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e5ea' }}>
                <span style={{ fontSize: '11px', color: '#1c1c1e', fontStyle: 'italic' }}>Терміни</span>
                <div
                  onClick={() => {
                    const nextVal = !showDates;
                    setShowDates(nextVal);
                    triggerAutoSave({ showDates: nextVal });
                  }}
                  style={{
                    width: '30px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: showDates ? '#34c759' : '#e5e5ea',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: showDates ? '16px' : '2px',
                      transition: 'left 0.2s'
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e5ea' }}>
                <span style={{ fontSize: '11px', color: '#1c1c1e', fontStyle: 'italic' }}>Переміщення підстадій</span>
                <div
                  onClick={() => {
                    const nextVal = !enableSubtaskMoving;
                    setEnableSubtaskMoving(nextVal);
                    triggerAutoSave({ enableSubtaskMoving: nextVal });
                  }}
                  style={{
                    width: '30px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: enableSubtaskMoving ? '#34c759' : '#e5e5ea',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: enableSubtaskMoving ? '16px' : '2px',
                      transition: 'left 0.2s'
                    }}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e5ea' }}>
                <span style={{ fontSize: '11px', color: '#1c1c1e', fontStyle: 'italic' }}>Створення нових підпунктів</span>
                <div
                  onClick={() => {
                    const nextVal = !enableNestedItems;
                    setEnableNestedItems(nextVal);
                    triggerAutoSave({ enableNestedItems: nextVal });
                  }}
                  style={{
                    width: '30px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: enableNestedItems ? '#34c759' : '#e5e5ea',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: enableNestedItems ? '16px' : '2px',
                      transition: 'left 0.2s'
                    }}
                  />
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* 5. Save Block */}
      <div style={{ backgroundColor: '#ffffff', padding: '12px', border: '1px solid #e5e5ea', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontStyle: 'italic', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
            style={{ width: '12px', height: '12px' }}
          />
          Зберегти як новий шаблон
        </label>

        {saveAsTemplate && (
          <input
            type="text"
            placeholder="Назва шаблону"
            value={templateNameInput}
            onChange={(e) => setTemplateNameInput(e.target.value)}
            style={{ ...cardInputStyle, height: '24px', padding: '2px 6px', boxSizing: 'border-box', fontSize: '11px', fontStyle: 'italic' }}
          />
        )}

        <button
          onClick={handleFinalSave}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontStyle: 'italic', fontSize: '12px', cursor: 'pointer', lineHeight: 1 }}
        >
          Зберегти шаблон
        </button>
      </div>
    </div>
  );
};

const cardInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  backgroundColor: '#e5e5ea',
  border: '1px solid #d1d1d6',
  borderRadius: '6px',
  fontSize: '11px',
  fontStyle: 'italic',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1c1c1e',
  lineHeight: 1
};

const inlineTitleInputStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  background: 'transparent',
  fontSize: '14px',
  fontWeight: 'bold',
  fontStyle: 'italic',
  color: '#1c1c1e',
  outline: 'none',
  padding: '2px 0',
  lineHeight: 1
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#636366',
  marginBottom: '2px',
  display: 'block',
  lineHeight: 1,
  fontStyle: 'italic'
};

const btnStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: 'none',
  fontSize: '11px',
  cursor: 'pointer',
  lineHeight: 1,
  fontStyle: 'italic'
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '11px',
  padding: '2px 4px',
  lineHeight: 1
};

const compactPlusBtnStyle: React.CSSProperties = {
  backgroundColor: '#e5e5ea',
  border: '1px solid #d1d1d6',
  borderRadius: '6px',
  width: '24px',
  height: '24px',
  fontSize: '14px',
  lineHeight: 1,
  color: '#1c1c1e',
  padding: 0,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: '0',
  boxSizing: 'border-box'
};

export default ProjectDetail;
