import { JournalEntry } from "@/types/event";
import { v4 as uuidv4 } from "uuid";

/**
 * Demo seed data — ~5 months of sample journal entries.
 * Covers overlapping feelings, recurring themes, forward projections, mixed emotions.
 */
export const generateSeedData = (): JournalEntry[] => {
  const now = new Date();
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  return [
    // ~3 months ago — rough patch
    {
      id: uuidv4(),
      text: "can't stop replaying that conversation with mom. she didn't mean it the way it sounded but it still sits in my chest.",
      createdAt: day(-90),
      anchorDate: day(-90),
      sentiment: { color: "#2E5BBA", intensity: 0.7, categories: ["sadness"] },
      temporalScope: "point",
    },
    {
      id: uuidv4(),
      text: "the past two weeks have been this slow weight. not sad exactly, just... heavy. going through motions.",
      createdAt: day(-85),
      anchorDate: day(-85),
      endDate: day(-71),
      sentiment: { color: "#9B6BB0", intensity: 0.6, categories: ["mixed"] },
      temporalScope: "smear",
    },
    // ~2 months ago — uptick
    {
      id: uuidv4(),
      text: "coffee with jay today. laughed for the first time in a while. forgot how good that feels.",
      createdAt: day(-65),
      anchorDate: day(-65),
      sentiment: { color: "#F5A623", intensity: 0.8, categories: ["joy"] },
      temporalScope: "point",
    },
    {
      id: uuidv4(),
      text: "still thinking about mom's call. three weeks later and it comes back at night. I should just call her.",
      createdAt: day(-60),
      anchorDate: day(-60),
      sentiment: { color: "#2E5BBA", intensity: 0.5, categories: ["sadness", "anxiety"] },
      temporalScope: "point",
    },
    {
      id: uuidv4(),
      text: "started running again. just 2k but my lungs burned and it felt incredible. the good kind of pain.",
      createdAt: day(-55),
      anchorDate: day(-55),
      sentiment: { color: "#4CAF50", intensity: 0.7, categories: ["hope", "joy"] },
      temporalScope: "point",
    },
    // ~6 weeks ago — mixed
    {
      id: uuidv4(),
      text: "work has been relentless since the reorg. I keep telling myself it's fine but I can't sleep.",
      createdAt: day(-42),
      anchorDate: day(-42),
      endDate: day(-28),
      sentiment: { color: "#3ABFBF", intensity: 0.7, categories: ["anxiety"] },
      temporalScope: "smear",
    },
    {
      id: uuidv4(),
      text: "date night with S. we just drove around and talked. the simplest things.",
      createdAt: day(-38),
      anchorDate: day(-38),
      sentiment: { color: "#E05AA0", intensity: 0.8, categories: ["love"] },
      temporalScope: "point",
    },
    // ~3 weeks ago
    {
      id: uuidv4(),
      text: "finally called mom. we cried. I don't know why I waited so long.",
      createdAt: day(-21),
      anchorDate: day(-21),
      sentiment: { color: "#E05AA0", intensity: 0.9, categories: ["love", "sadness"] },
      temporalScope: "point",
    },
    {
      id: uuidv4(),
      text: "the anxiety about work is fading. got some clarity on what actually matters vs what I was catastrophizing about.",
      createdAt: day(-18),
      anchorDate: day(-18),
      sentiment: { color: "#4CAF50", intensity: 0.6, categories: ["hope"] },
      temporalScope: "point",
    },
    // Last week
    {
      id: uuidv4(),
      text: "something shifted. I feel lighter. maybe it's the running, maybe it's just time doing its thing.",
      createdAt: day(-7),
      anchorDate: day(-7),
      sentiment: { color: "#F5A623", intensity: 0.6, categories: ["joy", "hope"] },
      temporalScope: "point",
    },
    {
      id: uuidv4(),
      text: "yesterday was perfect. nothing happened. just a normal, quiet, good day.",
      createdAt: day(-2),
      anchorDate: day(-2),
      sentiment: { color: "#B0B0B0", intensity: 0.3, categories: ["neutral", "joy"] },
      temporalScope: "point",
    },
    // Forward projections
    {
      id: uuidv4(),
      text: "the move is in 2 months and I keep swinging between excited and terrified. new city, no safety net.",
      createdAt: day(-5),
      anchorDate: day(-5),
      endDate: day(55),
      sentiment: { color: "#9B6BB0", intensity: 0.7, categories: ["anxiety", "hope"] },
      temporalScope: "forward",
    },
    {
      id: uuidv4(),
      text: "S's birthday is next week. I have a plan and I think she's going to love it.",
      createdAt: day(-3),
      anchorDate: day(-3),
      endDate: day(4),
      sentiment: { color: "#E05AA0", intensity: 0.7, categories: ["love", "joy"] },
      temporalScope: "forward",
    },
  ];
};
