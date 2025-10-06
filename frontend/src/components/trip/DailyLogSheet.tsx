import { Clock, FileText } from 'lucide-react'
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from '@/components/ui/card.tsx'
import type { DailyLog, LogEntry } from '@/types/trip.ts'

interface DailyLogSheetProps {
   dailyLog: DailyLog
}

const statusLabels: Record<LogEntry['status'], string> = {
   off_duty: 'Off Duty',
   sleeper: 'Sleeper Berth',
   driving: 'Driving',
   on_duty: 'On Duty (Not Driving)',
}

const statusColors: Record<LogEntry['status'], string> = {
   off_duty: 'bg-gray-500',
   sleeper: 'bg-purple-500',
   driving: 'bg-green-500',
   on_duty: 'bg-amber-500',
}

export default function DailyLogSheet({ dailyLog }: DailyLogSheetProps) {
   const hours = Array.from({ length: 24 }, (_, i) => i)

   const timeToDecimal = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours + minutes / 60
   }

   const renderTimelineBar = () => {
      return dailyLog.entries.map((entry: LogEntry, index: number) => {
         const startDecimal = timeToDecimal(entry.start_time)
         const endDecimal = timeToDecimal(entry.end_time)
         const duration = endDecimal - startDecimal
         const leftPercent = (startDecimal / 24) * 100
         const widthPercent = (duration / 24) * 100

         return (
            <div
               key={index}
               className={`absolute h-full ${statusColors[entry.status]} opacity-80 hover:opacity-100 transition-opacity cursor-pointer group`}
               style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
               }}
               title={`${statusLabels[entry.status]}: ${entry.start_time} - ${entry.end_time} (${entry.duration_hours.toFixed(1)}h)`}
            >
               <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  {statusLabels[entry.status]}
                  <br />
                  {entry.start_time} - {entry.end_time}
                  <br />
                  {entry.duration_hours.toFixed(1)}h
               </div>
            </div>
         )
      })
   }

   return (
      <Card className="w-full">
         <CardHeader className="border-b">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <CardTitle>
                     Daily Log -{' '}
                     {new Date(dailyLog.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                     })}
                  </CardTitle>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
               <div>
                  <p className="text-muted-foreground">Driver</p>
                  <p className="font-semibold">
                     {dailyLog?.driver_name ?? '#'}
                  </p>
               </div>
               <div>
                  <p className="text-muted-foreground">Driving Hours</p>
                  <p className="font-semibold">
                     {dailyLog.total_hours_driving.toFixed(1)}h
                  </p>
               </div>
               <div>
                  <p className="text-muted-foreground">On-Duty Hours</p>
                  <p className="font-semibold">
                     {dailyLog.total_hours_on_duty.toFixed(1)}h
                  </p>
               </div>
            </div>
         </CardHeader>

         <CardContent className="pt-6">
            {/* Timeline */}
            <div className="mb-6">
               <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  24-Hour Timeline
               </h4>

               {/* Hour labels */}
               <div className="relative mb-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                     {hours
                        .filter((h) => h % 3 === 0)
                        .map((h) => (
                           <span
                              key={h}
                              style={{ width: '12.5%', textAlign: 'center' }}
                           >
                              {h.toString().padStart(2, '0')}:00
                           </span>
                        ))}
                  </div>
               </div>

               {/* Timeline bars */}
               <div className="relative h-16 bg-gray-100 dark:bg-gray-800 rounded-md border overflow-hidden">
                  {renderTimelineBar()}
               </div>

               {/* Legend */}
               <div className="flex flex-wrap gap-4 mt-4">
                  {Object.entries(statusLabels).map(([key, label]) => (
                     <div key={key} className="flex items-center gap-2">
                        <div
                           className={`w-4 h-4 rounded ${statusColors[key as LogEntry['status']]}`}
                        />
                        <span className="text-sm">{label}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Log Entries Table */}
            <div>
               <h4 className="font-semibold mb-3">Log Entries</h4>
               <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                     <thead className="bg-muted">
                        <tr>
                           <th className="text-left p-3 font-semibold">
                              Status
                           </th>
                           <th className="text-left p-3 font-semibold">
                              Start Time
                           </th>
                           <th className="text-left p-3 font-semibold">
                              End Time
                           </th>
                           <th className="text-left p-3 font-semibold">
                              Duration
                           </th>
                           <th className="text-left p-3 font-semibold">
                              Location
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        {dailyLog.entries.map(
                           (entry: LogEntry, index: number) => (
                              <tr
                                 key={index}
                                 className="border-t hover:bg-accent"
                              >
                                 <td className="p-3">
                                    <span
                                       className={`inline-block px-2 py-1 rounded text-white text-xs ${statusColors[entry.status]}`}
                                    >
                                       {statusLabels[entry.status]}
                                    </span>
                                 </td>
                                 <td className="p-3">{entry.start_time}</td>
                                 <td className="p-3">{entry.end_time}</td>
                                 <td className="p-3">
                                    {entry.duration_hours.toFixed(1)}h
                                 </td>
                                 <td className="p-3 text-muted-foreground">
                                    {entry.location || '-'}
                                 </td>
                              </tr>
                           )
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </CardContent>
      </Card>
   )
}
