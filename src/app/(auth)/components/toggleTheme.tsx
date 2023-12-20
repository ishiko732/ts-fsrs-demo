
'use client'
import React from 'react';
import { useTheme } from 'next-themes'

function ToggleTheme() {
  const { theme, setTheme } = useTheme()
  return (
    <select className="ml-4 select select-bordered max-w-60" value={theme} onChange={e => setTheme(e.target.value)}>
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}

export default ToggleTheme;