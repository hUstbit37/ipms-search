"use client"

import * as React from "react"
import { CalendarDays } from "lucide-react"
import { addDays, format, startOfDay, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  numberOfMonths?: number
  dateFormat?: string
  showPresets?: boolean
}

export function DateRangePicker({
  date,
  onDateChange,
  placeholder = "dd/mm/yyyy - dd/mm/yyyy",
  className,
  disabled = false,
  numberOfMonths = 2,
  dateFormat = "dd/MM/yyyy",
  showPresets = true
}: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    setSelectedPreset('custom')
    onDateChange?.(selectedDate)
    // Không auto-close ở custom range theo yêu cầu
  }

  const today = new Date()
  const buildRange = (from: Date, to: Date): DateRange => ({ from, to })

  const presets: { key: string; label: string; range: () => DateRange }[] = [
    {
      key: 'today',
      label: 'Today',
      range: () => {
        const d = startOfDay(today)
        return buildRange(d, d)
      }
    },
    {
      key: 'yesterday',
      label: 'Yesterday',
      range: () => {
        const d = startOfDay(subDays(today, 1))
        return buildRange(d, d)
      }
    },
    {
      key: 'last7',
      label: 'Last 7 Days',
      range: () => buildRange(startOfDay(subDays(today, 6)), startOfDay(today))
    },
    {
      key: 'last30',
      label: 'Last 30 Days',
      range: () => buildRange(startOfDay(subDays(today, 29)), startOfDay(today))
    },
    {
      key: 'thisMonth',
      label: 'This Month',
      range: () => buildRange(startOfMonth(today), endOfMonth(today))
    },
    {
      key: 'lastMonth',
      label: 'Last Month',
      range: () => {
        const base = subMonths(today, 1)
        return buildRange(startOfMonth(base), endOfMonth(base))
      }
    },
    {
      key: 'thisQuarter',
      label: 'This Quarter',
      range: () => {
        const currentMonth = today.getMonth()
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3
        const start = new Date(today.getFullYear(), quarterStartMonth, 1)
        const end = endOfMonth(new Date(today.getFullYear(), quarterStartMonth + 2, 1))
        return buildRange(start, end)
      }
    },
    {
      key: 'lastQuarter',
      label: 'Last Quarter',
      range: () => {
        // Lùi 3 tháng để đảm bảo nằm trong quý trước
        const prevQuarterDate = subMonths(today, 3)
        const prevMonth = prevQuarterDate.getMonth()
        const quarterStartMonth = Math.floor(prevMonth / 3) * 3
        const start = new Date(prevQuarterDate.getFullYear(), quarterStartMonth, 1)
        const end = endOfMonth(new Date(prevQuarterDate.getFullYear(), quarterStartMonth + 2, 1))
        return buildRange(start, end)
      }
    },
    {
      key: 'thisYear',
      label: 'This Year',
      range: () => buildRange(startOfYear(today), endOfYear(today))
    },
    {
      key: 'lastYear',
      label: 'Last Year',
      range: () => {
        const base = subYears(today, 1)
        return buildRange(startOfYear(base), endOfYear(base))
      }
    },
  ]

  const applyPreset = (p: { key: string; range: () => DateRange }) => {
    const range = p.range()
    setSelectedPreset(p.key)
    onDateChange?.(range)
    setOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, dateFormat)} -{" "}
                  {format(date.to, dateFormat)}
                </>
              ) : (
                format(date.from, dateFormat)
              )
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {showPresets && (
              <div className="w-44 border-r  p-2 text-sm h-[320px] overflow-y-auto shrink-0">
                <ul className="space-y-1">
                  {presets.map(p => {
                    const active = selectedPreset === p.key
                    return (
                      <li key={p.key}>
                        <button
                          type="button"
                          onClick={() => applyPreset(p)}
                          className={cn(
                            'w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer',
                            active && 'bg-primary text-white hover:bg-primary'
                          )}
                        >
                          {p.label}
                        </button>
                      </li>
                    )
                  })}
                  <li>
                    <button
                      type="button"
                      onClick={() => setSelectedPreset('custom')}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded hover:bg-gray-100',
                        selectedPreset === 'custom' && 'bg-primary text-white hover:bg-primary'
                      )}
                    >
                      Custom Range
                    </button>
                  </li>
                </ul>
              </div>
            )}
            <div className="p-2">
              <Calendar
              captionLayout="dropdown"
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={numberOfMonths}
                disabled={disabled}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
