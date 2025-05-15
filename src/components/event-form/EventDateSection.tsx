
import React, { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SEASONS } from "@/utils/seasonalUtils";

interface EventDateSectionProps {
  dateLength: "ONE_DAY" | "SPAN";
  setDateLength: (value: "ONE_DAY" | "SPAN") => void;
  spanType: "SEASONAL" | "EXACT";
  setSpanType: (value: "SEASONAL" | "EXACT") => void;
  singleDay: number;
  setSingleDay: (value: number) => void;
  singleMonth: number;
  setSingleMonth: (value: number) => void;
  singleYear: number;
  setSingleYear: (value: number) => void;
  startDay: number;
  setStartDay: (value: number) => void;
  startMonth: number;
  setStartMonth: (value: number) => void;
  spanStartYear: number;
  setSpanStartYear: (value: number) => void;
  specifyDays: boolean;
  setSpecifyDays: (value: boolean) => void;
  endDay: number;
  setEndDay: (value: number) => void;
  endMonth: number;
  setEndMonth: (value: number) => void;
  endYear: number;
  setEndYear: (value: number) => void;
  season: string;
  setSeason: (value: string) => void;
  seasonYear: number;
  setSeasonYear: (value: number) => void;
  minYear: number;
  maxYear: number;
}

export const EventDateSection: React.FC<EventDateSectionProps> = ({
  dateLength,
  setDateLength,
  spanType,
  setSpanType,
  singleDay,
  setSingleDay,
  singleMonth,
  setSingleMonth,
  singleYear,
  setSingleYear,
  startDay,
  setStartDay,
  startMonth,
  setStartMonth,
  spanStartYear,
  setSpanStartYear,
  specifyDays,
  setSpecifyDays,
  endDay,
  setEndDay,
  endMonth,
  setEndMonth,
  endYear,
  setEndYear,
  season,
  setSeason,
  seasonYear,
  setSeasonYear,
  minYear,
  maxYear
}) => {
  const [availableSingleDays, setAvailableSingleDays] = useState<number[]>([]);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [availableEndDays, setAvailableEndDays] = useState<number[]>([]);
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const years = Array.from(
    { length: maxYear - minYear + 1 }, 
    (_, i) => minYear + i
  );

  // Calculate available days for the single date picker
  useEffect(() => {
    const days = daysInMonth(singleMonth, singleYear);
    setAvailableSingleDays(Array.from({ length: days }, (_, i) => i + 1));
    
    if (singleDay > days) {
      setSingleDay(1);
    }
  }, [singleMonth, singleYear, setSingleDay]);

  // Calculate available days for the start date picker
  useEffect(() => {
    const days = daysInMonth(startMonth, spanStartYear);
    setAvailableDays(Array.from({ length: days }, (_, i) => i + 1));
    
    if (startDay > days) {
      setStartDay(1);
    }
  }, [startMonth, spanStartYear, setStartDay]);

  // Calculate available days for the end date picker
  useEffect(() => {
    const days = daysInMonth(endMonth, endYear);
    setAvailableEndDays(Array.from({ length: days }, (_, i) => i + 1));
    
    if (endDay > days) {
      setEndDay(1);
    }
  }, [endMonth, endYear, setEndDay]);

  return (
    <>
      <div className="grid gap-3 pt-2">
        <Label className="text-sm font-medium leading-none">How long did this event last?</Label>
        
        <RadioGroup
          value={dateLength}
          onValueChange={(value: "ONE_DAY" | "SPAN") => setDateLength(value)}
          className="grid grid-cols-2 gap-4 mt-1"
        >
          <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all ${
            dateLength === "ONE_DAY" ? "border-primary bg-primary/10" : "border-muted"
          }`}>
            <RadioGroupItem value="ONE_DAY" id="date-one-day" className="sr-only" />
            <Label htmlFor="date-one-day" className="flex flex-col cursor-pointer">
              <span className="font-medium">Just one day</span>
              <span className="text-xs text-muted-foreground mt-1">A specific date</span>
            </Label>
          </div>
          
          <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all ${
            dateLength === "SPAN" ? "border-primary bg-primary/10" : "border-muted"
          }`}>
            <RadioGroupItem value="SPAN" id="date-span" className="sr-only" />
            <Label htmlFor="date-span" className="flex flex-col cursor-pointer">
              <span className="font-medium">Over a span</span>
              <span className="text-xs text-muted-foreground mt-1">A period of time</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {dateLength === "ONE_DAY" && (
        <div className="grid gap-3">
          <Label className="text-sm font-medium leading-none">Date</Label>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={singleDay}
              onChange={(e) => setSingleDay(Number(e.target.value))}
              className="rounded-md border border-input bg-background/50 px-3 py-2"
            >
              {availableSingleDays.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select
              value={singleMonth}
              onChange={(e) => setSingleMonth(Number(e.target.value))}
              className="rounded-md border border-input bg-background/50 px-3 py-2"
            >
              {months.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={singleYear}
              onChange={(e) => setSingleYear(Number(e.target.value))}
              className="rounded-md border border-input bg-background/50 px-3 py-2"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {dateLength === "SPAN" && (
        <>
          <div className="grid gap-3">
            <Label className="text-sm font-medium leading-none">How would you define this period?</Label>
            
            <RadioGroup
              value={spanType}
              onValueChange={(value: "SEASONAL" | "EXACT") => setSpanType(value)}
              className="grid grid-cols-2 gap-4 mt-1"
            >
              <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all ${
                spanType === "SEASONAL" ? "border-primary bg-primary/10" : "border-muted"
              }`}>
                <RadioGroupItem value="SEASONAL" id="span-seasonal" className="sr-only" />
                <Label htmlFor="span-seasonal" className="flex flex-col cursor-pointer">
                  <span className="font-medium">Seasonal</span>
                  <span className="text-xs text-muted-foreground mt-1">Spring, Summer, etc.</span>
                </Label>
              </div>
              
              <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all ${
                spanType === "EXACT" ? "border-primary bg-primary/10" : "border-muted"
              }`}>
                <RadioGroupItem value="EXACT" id="span-exact" className="sr-only" />
                <Label htmlFor="span-exact" className="flex flex-col cursor-pointer">
                  <span className="font-medium">Exact dates</span>
                  <span className="text-xs text-muted-foreground mt-1">Specific start & end</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {spanType === "SEASONAL" && (
            <div className="grid gap-3">
              <Label className="text-sm font-medium leading-none">Season & Year</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select 
                  value={season} 
                  onValueChange={(value) => setSeason(value)}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <select
                  value={seasonYear}
                  onChange={(e) => setSeasonYear(Number(e.target.value))}
                  className="rounded-md border border-input bg-background/50 px-3 py-2"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {spanType === "EXACT" && (
            <>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="specifyDays"
                  checked={specifyDays}
                  onCheckedChange={(checked) => setSpecifyDays(!!checked)}
                  className="border-input"
                />
                <Label htmlFor="specifyDays" className="text-sm">
                  I want to specify exact days (not just months)
                </Label>
              </div>

              <div className="grid gap-3">
                <Label className="text-sm font-medium leading-none">Start Date</Label>
                <div className={`grid ${specifyDays ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                  {specifyDays && (
                    <select
                      value={startDay}
                      onChange={(e) => setStartDay(Number(e.target.value))}
                      className="rounded-md border border-input bg-background/50 px-3 py-2"
                    >
                      {availableDays.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  )}
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(Number(e.target.value))}
                    className="rounded-md border border-input bg-background/50 px-3 py-2"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={spanStartYear}
                    onChange={(e) => setSpanStartYear(Number(e.target.value))}
                    className="rounded-md border border-input bg-background/50 px-3 py-2"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3">
                <Label className="text-sm font-medium leading-none">End Date</Label>
                <div className={`grid ${specifyDays ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                  {specifyDays && (
                    <select
                      value={endDay}
                      onChange={(e) => setEndDay(Number(e.target.value))}
                      className="rounded-md border border-input bg-background/50 px-3 py-2"
                    >
                      {availableEndDays.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  )}
                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(Number(e.target.value))}
                    className="rounded-md border border-input bg-background/50 px-3 py-2"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    className="rounded-md border border-input bg-background/50 px-3 py-2"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

// Helper function to calculate days in a month
const daysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};
