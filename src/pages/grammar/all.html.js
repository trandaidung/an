// @flow

import AllBlogPosts from 'components/AllBlogPosts';
import type {allMarkdownRemarkData} from 'types';

type Props = {
  data: allMarkdownRemarkData,
  location: Location
};

const AllGrammarPosts = ({data, location}: Props) => (
  <AllBlogPosts 
    blogType={'grammar'}
    data={data}
    location={location}  
  />
);

export const pageQuery = graphql`
  query AllGrammarPostsPageQuery {
    allMarkdownRemark(
      filter: {fileAbsolutePath: {regex: "/grammar/"}}
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

export default AllGrammarPosts;