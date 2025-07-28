
export const formatDuration = (seconds: number): string => {
  if (seconds <= 0) return 'Ready!';

  const units = [
    { name: 'w', value: 604800 }, // weeks
    { name: 'd', value: 86400 },  // days
    { name: 'h', value: 3600 },   // hours
    { name: 'm', value: 60 },     // minutes
    { name: 's', value: 1 }       // seconds
  ];

  const parts: string[] = [];
  let remaining = Math.floor(seconds);

  for (const unit of units) {
    if (remaining >= unit.value) {
      const count = Math.floor(remaining / unit.value);
      parts.push(`${count}${unit.name}`);
      remaining %= unit.value;
    }
  }

  return parts.length > 0 ? parts.join(' ') : '0s';
};

export const calculateRemainingTime = (jobStart: string | null, runtime: number): number => {
  if (!jobStart || !runtime) return 0;
  
  const startTime = new Date(jobStart).getTime();
  const currentTime = Date.now();
  const elapsedSeconds = (currentTime - startTime) / 1000;
  
  return Math.max(0, runtime - elapsedSeconds);
};
