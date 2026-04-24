export type InputType = "checkbox" | "counter" | "slider" | "number";

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  input_type: InputType;
  unit: string | null;
  min_value: number;
  max_value: number;
  step: number;
  target: number | null;
  position: number;
  archived: boolean;
  created_at: string;
};

export type Entry = {
  id: string;
  habit_id: string;
  value: number;
  logged_date: string;
  created_at: string;
};
