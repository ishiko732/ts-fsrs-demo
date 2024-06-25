'use client';
import { useState } from 'react';
import MenuItem from '.';
import { Button } from '@/components/ui/button';

function ClientTest() {
  const [cnt, setCnt] = useState(0);
  const handleClick = () => {
    setCnt((pre) => pre + 1);
  };

  return (
    <MenuItem tip='Client Test' onClick={handleClick}>
      <Button variant={'outline'} className='w-full' type='submit'>
        {cnt}
      </Button>
    </MenuItem>
  );
}

export default ClientTest;
