import { AddNoteDialog } from '../client/addNoteDialog'
import MenuItem from '.'

function AddNote() {
  const tip = 'Add Note'
  return (
    <MenuItem tip={tip}>
      <AddNoteDialog tip={tip} />
    </MenuItem>
  )
}

export default AddNote
