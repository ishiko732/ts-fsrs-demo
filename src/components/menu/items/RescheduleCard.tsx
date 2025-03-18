import RescheduledSubmitButton from '../submit/RescheduledSubmit'
import MenuItem from '.'

async function RescheduledCard() {
  const tip = 'Reschedule'
  return (
    <MenuItem tip={tip}>
      <RescheduledSubmitButton tip={tip} />
    </MenuItem>
  )
}

export default RescheduledCard
