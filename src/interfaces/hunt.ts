export interface Hunt {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate: string | null;
  endDate: string | null;
  location: LocationType | null;
  mode: "PUBLIC" | "PRIVATE";
  fee: number | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  steps: HuntStep[];
  estimatedDuration?: number;
  tags?: string[];
  participantCount?: number;
  _count: {
    participants: number;
  };
  participants?: {
    userId: string;
  }[];
}

export interface LocationType {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface HuntStep {
  id: string;
  description: string;
  stepOrder: number;
  title?: string;
  imageUrl?: string;
  location?: LocationType;
  createdAt: string;
}
