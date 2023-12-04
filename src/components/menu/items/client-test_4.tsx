'use client'
import { useState } from "react";
import MenuItem from ".";

function ClientTest() {
  const [cnt,setCnt] = useState(0)
  const handleClick =()=>{
    setCnt(pre=>pre+1)
  }

  return (
    <MenuItem tip="Client Test" onClick={handleClick}>
      <button className="btn btn-xs btn-square" type="submit">
        {cnt}
      </button>
    </MenuItem>
  );
}

export default ClientTest;
