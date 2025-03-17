import { gql } from '@apollo/client';

export const GET_SESSIONS_CONCAT = gql`
  query sessionsConcat($afterCursor: String, $limit: Int) {
    sessionsConcat(afterCursor: $afterCursor, limit: $limit) {
      datalist {
        id
        eventYear
        title
      }
      pageInfo {
        hasNextPage
        lastCursor
      }
    }
  }
`;
