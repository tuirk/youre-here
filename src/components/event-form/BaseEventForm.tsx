
import React, { useState } from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TimeEvent } from "@/types/event";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { EventTitleSection } from "./EventTitleSection";
import { EventDescriptionSection } from "./EventDescriptionSection";
import { EventTagsSection } from "./EventTagsSection";
import { EventMoodSection } from "./EventMoodSection";
import { EventIntensitySection } from "./EventIntensitySection";
import { EventDateSection } from "./EventDateSection";

interface BaseEventFormProps {
  onSave: (event: TimeEvent) => void;
  onClose: () => void;
  preselectedYear?: number;
  preselectedMonth?: number;
  startYear: number;
  currentYear: number;
}

export const BaseEventForm: React.FC<BaseEventFormProps> = ({
  onSave,
  onClose,
  preselectedYear,
  preselectedMonth,
  startYear: minStartYear,
  currentYear,
}) => {
  const { toast } = useToast();
  
  const minYear = Math.min(minStartYear, currentYear - 5);
  const maxYear = currentYear + 1;
  
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("#9b87f5");
  const [intensity, setIntensity] = useState(5);
  
  const [dateLength, setDateLength] = useState<"ONE_DAY" | "SPAN">("ONE_DAY");
  const [spanType, setSpanType] = useState<"SEASONAL" | "EXACT">("EXACT");
  
  const [singleDay, setSingleDay] = useState(1);
  const [singleMonth, setSingleMonth] = useState(preselectedMonth || 0);
  const [singleYear, setSingleYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );
  
  const [startDay, setStartDay] = useState(1);
  const [startMonth, setStartMonth] = useState(preselectedMonth || 0);
  const [spanStartYear, setSpanStartYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );
  const [specifyDays, setSpecifyDays] = useState(false);
  const [endDay, setEndDay] = useState(1);
  const [endMonth, setEndMonth] = useState(startMonth);
  const [endYear, setEndYear] = useState(spanStartYear);
  
  const [season, setSeason] = useState<string>("Spring");
  const [seasonYear, setSeasonYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );

  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const handleSave = () => {
    if (!title) return;

    if (dateLength === "ONE_DAY") {
      const eventDate = new Date(singleYear, singleMonth, singleDay);
      const minDate = new Date(minYear, 0, 1);
      const maxDate = new Date(maxYear, 11, 31);
      
      if (eventDate < minDate || eventDate > maxDate) {
        toast({
          title: "Invalid Date",
          description: `Date must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`,
          variant: "destructive",
        });
        return;
      }
    } else if (dateLength === "SPAN") {
      if (spanType === "SEASONAL") {
        if (seasonYear < minYear || seasonYear > maxYear) {
          toast({
            title: "Invalid Year",
            description: `Year must be between ${minYear} and ${maxYear}`,
            variant: "destructive",
          });
          return;
        }
      } else {
        const startDate = new Date(spanStartYear, startMonth, specifyDays ? startDay : 1);
        const endDate = new Date(endYear, endMonth, specifyDays ? endDay : daysInMonth(endMonth, endYear));
        const minDate = new Date(minYear, 0, 1);
        const maxDate = new Date(maxYear, 11, 31);
        
        if (startDate < minDate || startDate > maxDate || endDate < minDate || endDate > maxDate) {
          toast({
            title: "Invalid Date Range",
            description: `Dates must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`,
            variant: "destructive",
          });
          return;
        }
        
        if (endDate < startDate) {
          toast({
            title: "Invalid Date Range",
            description: "End date cannot be before start date",
            variant: "destructive",
          });
          return;
        }
      }
    }

    const tags = tagsInput
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    let newEvent: TimeEvent;

    if (dateLength === "ONE_DAY") {
      newEvent = {
        id: uuidv4(),
        title,
        description: description || undefined,
        tags: tags.length > 0 ? tags : undefined,
        color: selectedColor,
        intensity,
        startDate: new Date(singleYear, singleMonth, singleDay),
        eventType: "one-time"
      };
    } else if (dateLength === "SPAN") {
      if (spanType === "SEASONAL") {
        const { startDate, endDate } = getSeasonalDateRange(season, seasonYear);
        
        newEvent = {
          id: uuidv4(),
          title,
          description: description || undefined,
          tags: tags.length > 0 ? tags : undefined,
          color: selectedColor,
          intensity,
          startDate,
          endDate,
          isRoughDate: true,
          roughDateSeason: season,
          roughDateYear: seasonYear,
          eventType: "process"
        };
      } else {
        const startDate = new Date(spanStartYear, startMonth, specifyDays ? startDay : 1);
        const endDate = new Date(endYear, endMonth, specifyDays ? endDay : daysInMonth(endMonth, endYear));
        
        newEvent = {
          id: uuidv4(),
          title,
          description: description || undefined,
          tags: tags.length > 0 ? tags : undefined,
          color: selectedColor,
          intensity,
          startDate,
          endDate,
          eventType: "process"
        };
      }
    }

    onSave(newEvent);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTagsInput("");
    setSelectedColor("#9b87f5");
    setIntensity(5);
    setDateLength("ONE_DAY");
    setSpanType("EXACT");
    setSpecifyDays(false);
  };

  return (
    <div className="grid gap-5 py-4">
      <EventTitleSection 
        title={title}
        onTitleChange={(value) => setTitle(value)}
      />
      
      <EventDescriptionSection 
        description={description}
        onDescriptionChange={(value) => setDescription(value)}
      />
      
      <EventTagsSection 
        tagsInput={tagsInput}
        onTagsInputChange={(value) => setTagsInput(value)}
      />
      
      <EventMoodSection 
        selectedColor={selectedColor}
        onColorSelect={(color) => setSelectedColor(color)}
      />
      
      <EventIntensitySection 
        intensity={intensity}
        onIntensityChange={(value) => setIntensity(value)}
      />
      
      <EventDateSection 
        dateLength={dateLength}
        setDateLength={setDateLength}
        spanType={spanType}
        setSpanType={setSpanType}
        singleDay={singleDay}
        setSingleDay={setSingleDay}
        singleMonth={singleMonth}
        setSingleMonth={setSingleMonth}
        singleYear={singleYear}
        setSingleYear={setSingleYear}
        startDay={startDay}
        setStartDay={setStartDay}
        startMonth={startMonth}
        setStartMonth={setStartMonth}
        spanStartYear={spanStartYear}
        setSpanStartYear={setSpanStartYear}
        specifyDays={specifyDays}
        setSpecifyDays={setSpecifyDays}
        endDay={endDay}
        setEndDay={setEndDay}
        endMonth={endMonth}
        setEndMonth={setEndMonth}
        endYear={endYear}
        setEndYear={setEndYear}
        season={season}
        setSeason={setSeason}
        seasonYear={seasonYear}
        setSeasonYear={setSeasonYear}
        minYear={minYear}
        maxYear={maxYear}
      />

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          disabled={!title}
          className="bg-cosmic-nebula-purple hover:bg-cosmic-nebula-purple/90"
        >
          Add to Spiral
        </Button>
      </DialogFooter>
    </div>
  );
};

// Helper function to calculate days in a month
const daysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get seasonal date range
const getSeasonalDateRange = (season: string, year: number) => {
  const seasonMap: Record<string, { startMonth: number; startDay: number; endMonth: number; endDay: number }> = {
    "Spring": { startMonth: 2, startDay: 20, endMonth: 5, endDay: 20 },
    "Summer": { startMonth: 5, startDay: 21, endMonth: 8, endDay: 22 },
    "Fall": { startMonth: 8, startDay: 23, endMonth: 11, endDay: 20 },
    "Winter": { startMonth: 11, startDay: 21, endMonth: 2, endDay: 19 }
  };

  const { startMonth, startDay, endMonth, endDay } = seasonMap[season] || seasonMap["Spring"];
  
  const startDate = new Date(year, startMonth, startDay);
  // For winter, the end date is in the next year
  const endYear = season === "Winter" ? year + 1 : year;
  const endDate = new Date(endYear, endMonth, endDay);
  
  return { startDate, endDate };
};
