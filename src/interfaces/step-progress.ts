import { HuntStep, Participation, User } from "@prisma/client";

export interface StepProgress {
  id: string;
  userId: string;
  stepId: string;
  participationId: string;
  isCompleted: boolean;
  completedAt: Date | null;
  points: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  step?: HuntStep;
  participation?: Participation;
}

export interface StepProgressWithDetails extends StepProgress {
  step: HuntStep;
}
