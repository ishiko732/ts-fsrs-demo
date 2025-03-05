import { Button } from '@/components/ui/button';

import MenuItem from '.';

async function ServerTest() {
  const submit = async (formData: FormData) => {
    'use server';
    console.log(formData);
    console.log('hello');
  };

  return (
    <MenuItem tip='Server Test' formAction={submit}>
      <Button className='w-full' variant={'outline'} type='submit'>
        TEST
      </Button>
    </MenuItem>
  );
}

export default ServerTest;
