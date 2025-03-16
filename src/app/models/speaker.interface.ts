export interface Speaker {
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
  