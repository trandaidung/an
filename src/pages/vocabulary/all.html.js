// @flow

import AllBlogPosts from 'components/AllBlogPosts';
import type {allMarkdownRemarkData} from 'types';

type Props = {
  data: allMarkdownRemarkData,
  location: Location
};

const AllVocabularyPosts = ({data, location}: Props) => (
  <AllBlogPosts 
    blogType={'vocabulary'}
    data={data}
    location={location}  
  />
);

export const pageQuery = graphql`
  query AllBlogPostsPageQuery {
    allMarkdownRemark(
      filter: {fileAbsolutePath: {regex: "/vocabulary/"}}
      sort: {fields: [fields___date], order: DESC}
    ) {
      edges {
        node {
          frontmatter {
            title
            author {
              frontmatter {
                name
                url
              }
            }
          }
          fields {
            date(formatString: "MMMM DD, YYYY")
            slug
          }
        }
      }
    }
  }
`;

export default AllVocabularyPosts;