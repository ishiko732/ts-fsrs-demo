'use client'
export default function OpenSetting() {
  return (
    <label
      htmlFor="fsrsSetting"
      className="drawer-button"
      onClick={() => (document.activeElement as HTMLElement)?.blur()}
    >
        Settings
    </label>
  );
}
