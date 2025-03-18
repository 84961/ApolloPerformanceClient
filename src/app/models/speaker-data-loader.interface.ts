export interface Speaker {
  id: string;
  first: string;
  last: string;
  company: string;
  twitterHandle: string;
  bio: string;
  favorite: boolean;
  sessions: Session[];
}

export interface Session {
  id: string;
  title: string;
  eventYear: string;
  room: Room;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
}



export interface SpeakersResponse {
  speakers: {
    datalist: Speaker[];
    pageInfo: {
      totalItemCount: number;
    };
  };
}
export interface PaginationParams {
  offset: number;
  limit: number;
}