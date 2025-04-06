import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DayPicker, DayPickerSingleProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onSelect: (date?: Date) => void;
  className?: string;
}

export function DatePicker({ date, onSelect, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  // Define custom styles for react-day-picker components using Tailwind CSS
  const dayPickerStyles: DayPickerSingleProps["classNames"] = {
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium text-gray-900 dark:text-gray-100",
    nav: "space-x-1 flex items-center",
    nav_button: cn(
      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
      "flex items-center justify-center rounded-md"
    ),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell: "text-gray-900 dark:text-gray-100 text-sm p-0 relative w-9 h-9 text-center",
    day: cn(
      "h-9 w-9 p-0 font-normal rounded-md",
      "hover:bg-gray-100 dark:hover:bg-gray-700",
      "focus:outline-none focus:ring-2 focus:ring-blue-500"
    ),
    day_selected: cn(
      "bg-blue-600 text-white",
      "hover:bg-blue-700 dark:hover:bg-blue-500",
      "focus:bg-blue-600 dark:focus:bg-blue-600"
    ),
    day_today: "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100",
    day_outside: "text-gray-400 dark:text-gray-500 opacity-50",
    day_disabled: "text-gray-400 dark:text-gray-500 opacity-50",
    day_hidden: "invisible",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-gray-500 dark:text-gray-400",
            "border-gray-300 dark:border-gray-600",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-auto p-0",
          "bg-white dark:bg-gray-800",
          "border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
        )}
      >
        <DayPicker
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onSelect(selectedDate);
            setOpen(false);
          }}
          initialFocus
          classNames={dayPickerStyles}
          modifiersClassNames={{
            today: "border border-blue-500 dark:border-blue-400",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}