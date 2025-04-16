
export type IssueStatus = 'open' | 'in-progress' | 'resolved';

export type IssueType = 
  | 'pothole'
  | 'streetlight'
  | 'graffiti'
  | 'trash'
  | 'sidewalk'
  | 'water'
  | 'traffic-signal'
  | 'other';

export interface Issue {
  id: string;
  type: IssueType;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: IssueStatus;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  reportedBy?: string;
}
