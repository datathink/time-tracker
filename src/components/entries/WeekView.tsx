"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, isToday } from "date-fns"
import { formatDecimalHours } from "@/lib/utils"

interface TimeEntry {
  id: string
  date: string
  duration: number
  description: string | null
  billable: boolean
  project?: {
    id: string
    name: string
    color: string
  } | null
}

interface WeekViewProps {
  entries: TimeEntry[]
  currentWeek: Date
  onWeekChange: (date: Date) => void
  onAddEntry: (date: Date) => void
  onEditEntry: (entry: TimeEntry) => void
}

export function WeekView({
  entries,
  currentWeek,
  onWeekChange,
  onAddEntry,
  onEditEntry,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }) // Sunday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 })
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getEntriesForDay = (day: Date) => {
    return entries.filter((entry) => {
      // Parse the date string in local timezone
      const dateStr = typeof entry.date === 'string' ? entry.date : entry.date.toISOString()
      const [year, month, dayNum] = dateStr.split('T')[0].split('-').map(Number)
      const entryDate = new Date(year, month - 1, dayNum)
      return isSameDay(entryDate, day)
    })
  }

  const getTotalHoursForDay = (day: Date) => {
    const dayEntries = getEntriesForDay(day)
    const totalMinutes = dayEntries.reduce((sum, entry) => sum + entry.duration, 0)
    return totalMinutes
  }

  const getTotalHoursForWeek = () => {
    const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0)
    return totalMinutes
  }

  const goToPreviousWeek = () => {
    onWeekChange(subWeeks(currentWeek, 1))
  }

  const goToNextWeek = () => {
    onWeekChange(addWeeks(currentWeek, 1))
  }

  const goToCurrentWeek = () => {
    onWeekChange(new Date())
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium min-w-[200px] text-center">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToCurrentWeek}>
            Today
          </Button>
        </div>
        <div className="text-sm font-semibold">
          Week Total: {formatDecimalHours(getTotalHoursForWeek())}h
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-3">
        {daysOfWeek.map((day) => {
          const dayEntries = getEntriesForDay(day)
          const totalMinutes = getTotalHoursForDay(day)
          const today = isToday(day)

          return (
            <Card
              key={day.toISOString()}
              className={`p-3 ${today ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="space-y-2">
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">
                      {format(day, "EEE")}
                    </div>
                    <div className={`text-lg font-semibold ${today ? "text-blue-600" : ""}`}>
                      {format(day, "d")}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => onAddEntry(day)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Day Total */}
                {totalMinutes > 0 && (
                  <div className="text-xs font-semibold text-gray-700">
                    {formatDecimalHours(totalMinutes)}h
                  </div>
                )}

                {/* Entries */}
                <div className="space-y-1.5">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => onEditEntry(entry)}
                      className="cursor-pointer hover:bg-gray-50 rounded p-1.5 border border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {entry.project && (
                          <>
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: entry.project.color }}
                            />
                            <div className="text-xs font-medium truncate">
                              {entry.project.name}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <div className="text-xs text-gray-600">
                          {formatDecimalHours(entry.duration)}h
                        </div>
                        {entry.billable && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">
                            $
                          </Badge>
                        )}
                      </div>
                      {entry.description && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {entry.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {dayEntries.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">
                    No entries
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
