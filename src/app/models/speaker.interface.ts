export interface ParentType {
  __typename?: string;
}
export interface Speaker extends ParentType {
    id: number;
    first: string;
    last: string;
    fullName?: string;
    checkBoxColumn?: boolean;
    favorite: boolean;
  }
  
  export interface SpeakersResponse {
    speakers: {
      datalist: Speaker[];
    };
  }
  
  export interface SpeakerInput {
    first: string; 
    last: string;
    favorite: boolean;
  }

  export interface SpeakersPaginatedResponse {
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

  
  export interface PageInfo {
    hasNextPage: boolean;
    lastCursor: string;
  }
  
  export interface SpeakersCursorResponse {
    speakersConcat: {
      datalist: Speaker[];
      pageInfo: PageInfo;
    };
  }

  export interface Session {
    id: string;
    eventYear: string;
    title: string;
  }
  

  export interface SessionsCursorResponse {
    sessionsConcat: {
      datalist: Session[];
      pageInfo: {
        hasNextPage: boolean;
        lastCursor: string;
      };
    };
  }
  