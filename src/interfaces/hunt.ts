export interface Hunt {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  mode: "PUBLIC" | "PRIVATE";
  fee: number | null;
  createdAt: string;
  _count: {
    participants: number;
  };
}
