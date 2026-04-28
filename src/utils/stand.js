export const STAND_STAT_LABELS = {
  power: '破坏力',
  speed: '速度',
  range: '射程距离',
  durability: '持续力',
  precision: '精密动作性',
  potential: '成长性'
};

export const parseStandName = (rawName) => {
  if (!rawName) return { main: 'UNKNOWN', sub: '' };

  const match = rawName.match(/^(.*?)\s*[(（](.*?)[)）]/);
  if (match) {
    return { main: match[1], sub: match[2] };
  }

  return { main: rawName, sub: '' };
};

export const downloadUrl = (url, filename) => {
  if (!url) return false;

  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  return true;
};
