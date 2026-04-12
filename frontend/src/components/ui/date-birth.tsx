"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerSimpleProps {
  value?: string;
  onChange?: (dateStr: string) => void;
}

export function DatePickerSimple({ value, onChange }: DatePickerSimpleProps) {
  const [open, setOpen] = React.useState(false)
  
  let date: Date | undefined = undefined;
  if (value) {
    const parts = value.split('-');
    if (parts.length === 3) {
      date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
  }

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-start font-normal"
            type="button"
          >
            {date ? date.toLocaleDateString() : "Seleccionar fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0 z-[100]" align="start" side="bottom">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            captionLayout="dropdown"
            onSelect={(d) => {
              if (d && onChange) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                onChange(`${yyyy}-${mm}-${dd}`);
              } else if (!d && onChange) {
                onChange("");
              }
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
