'use client';
export default function TrainTestButton() {
  return (
    <button className="btn" onClick={() => {
        console.log("UI thread is not blocked.");
        alert("UI thread is not blocked.");
    }}>
      UI thread TEST
    </button>
  );
}
