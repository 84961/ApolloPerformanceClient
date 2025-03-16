export interface ParentType {
  __typename?: string;
}
export interface Speaker extends ParentType {
    id: number;
    first: string;
    last: string;
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