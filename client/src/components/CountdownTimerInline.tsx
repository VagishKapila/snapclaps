import React, { useState, useEffect } from 'react';

interface CountdownTimerInlineProps {
  expiresAt: string;
}

// Compact inline countdown — no colored wrapper, parent controls styling
export const CountdownTimerInline: React.FC<CountdownTimerInlineProps> = ({ expiresAt }) => {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setDisplay('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (h > 24) setDisplay(`${Math.floor(h / 24)}d`);
      else if (h > 0) setDisplay(`${h}h ${m}m`);
      else setDisplay(`${m}m`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return <>{display}</>;
};
