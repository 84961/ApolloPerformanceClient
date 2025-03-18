import { gql } from '@apollo/client';

export const GET_SPEAKERS = gql`
  query GetSpeakers($offset: Int, $limit: Int) {
    speakers(offset: $offset, limit: $limit) {
     datalist {
      id
      first
      last
      company
      twitterHandle
      bio
      favorite
      sessions {
        id
        title
        eventYear
        room {
          id
          name
          capacity
        }
      }
    }
  }
}
`;
