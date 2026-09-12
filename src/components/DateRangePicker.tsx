import { useId } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { fromIsoDate, toIsoDate, today } from '../lib/dates'
import { formatDate } from '../lib/dates'
import './DateRangePicker.css'

type Props = {
  startDate: string
  endDate: string
  onChange: (next: { startDate: string; endDate: string }) => void
  error?: string
}

/**
 * Past-only start/end range built on React DayPicker.
 * A single click selects the start; the second click closes the range.
 * The range can never be inverted because DayPicker orders it for us.
 */
export function DateRangePicker({ startDate, endDate, onChange, error }: Props) {
  const errorId = useId()
  const selected: DateRange | undefined = startDate
    ? { from: fromIsoDate(startDate), to: endDate ? fromIsoDate(endDate) : undefined }
    : undefined

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) return onChange({ startDate: '', endDate: '' })
    onChange({ startDate: toIsoDate(range.from), endDate: range.to ? toIsoDate(range.to) : '' })
  }

  return (
    <div className="date-range">
      <div className="date-range-summary" aria-live="polite">
        <DateChip label="Start date" value={startDate} placeholder="Pick a day" />
        <DateChip label="End date" value={endDate} placeholder={startDate ? 'Pick the last day' : 'Pick a day'} />
      </div>
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={handleSelect}
        disabled={{ after: today() }}
        endMonth={today()}
        defaultMonth={selected?.from ?? today()}
        showOutsideDays={false}
        weekStartsOn={1}
        aria-describedby={error ? errorId : undefined}
      />
      <div className="date-range-foot">
        <p className="body-sm text-muted">Only past dates can be chosen.</p>
        {startDate && (
          <button type="button" className="btn btn-text" onClick={() => onChange({ startDate: '', endDate: '' })}>
            Clear dates
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function DateChip({ label, value, placeholder }: { label: string; value: string; placeholder: string }) {
  return (
    <div className={`date-chip${value ? ' is-set' : ''}`}>
      <span className="date-chip-label">{label}</span>
      <span className="date-chip-value">{value ? formatDate(value) : placeholder}</span>
    </div>
  )
}
