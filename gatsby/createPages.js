/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 */

'use strict';

const {resolve} = require('path');

module.exports = async ({graphql, actions}) => {
  const {createPage, createRedirect} = actions;

  // Used to detect and prevent duplicate redirects
  const redirectToSlugMap = {};

  const vocabularyTemplate = resolve(__dirname, '../src/templates/vocabulary.js');
  const communityTemplate = resolve(__dirname, '../src/templates/community.js');
  const docsTemplate = resolve(__dirname, '../src/templates/docs.js');
  const tutorialTemplate = resolve(__dirname, '../src/templates/tutorial.js');

  // Redirect /index.html to root.
  createRedirect({
    fromPath: '/index.html',
    redirectInBrowser: true,
    toPath: '/',
  });

  const allMarkdown = await graphql(
    `
      {
        allMarkdownRemark(limit: 1000) {
          edges {
            node {
              fields {
                redirect
                slug
              }
            }
          }
        }
      }
    `,
  );

  if (allMarkdown.errors) {
    console.error(allMarkdown.errors);

    throw Error(allMarkdown.errors);
  }

  allMarkdown.data.allMarkdownRemark.edges.forEach(edge => {
    const slug = edge.node.fields.slug;

    if (slug === 'docs/error-decoder.html') {
      // No-op so far as markdown templates go.
      // Error codes are managed by a page in src/pages
      // (which gets created by Gatsby during a separate phase).
    } else if (
      slug.includes('vocabulary/') ||
      slug.includes('community/') ||
      slug.includes('contributing/') ||
      slug.includes('docs/') ||
      slug.includes('tutorial/') ||
      slug.includes('warnings/')
    ) {
      let template;
      if (slug.includes('vocabulary/')) {
        template = vocabularyTemplate;
      } else if (slug.includes('community/')) {
        template = communityTemplate;
      } else if (
        slug.includes('contributing/') ||
        slug.includes('docs/') ||
        slug.includes('warnings/')
      ) {
        template = docsTemplate;
      } else if (slug.includes('tutorial/')) {
        template = tutorialTemplate;
      }

      const createArticlePage = path =>
        createPage({
          path: path,
          component: template,
          context: {
            slug,
          },
        });

      // Register primary URL.
      createArticlePage(slug);

      // Register redirects as well if the markdown specifies them.
      if (edge.node.fields.redirect) {
        let redirect = JSON.parse(edge.node.fields.redirect);
        if (!Array.isArray(redirect)) {
          redirect = [redirect];
        }

        redirect.forEach(fromPath => {
          if (redirectToSlugMap[fromPath] != null) {
            console.error(
              `Duplicate redirect detected from "${fromPath}" to:\n` +
                `* ${redirectToSlugMap[fromPath]}\n` +
                `* ${slug}\n`,
            );
            process.exit(1);
          }

          // A leading "/" is required for redirects to work,
          // But multiple leading "/" will break redirects.
          // For more context see github.com/reactjs/reactjs.org/pull/194
          const toPath = slug.startsWith('/') ? slug : `/${slug}`;

          redirectToSlugMap[fromPath] = slug;
          createRedirect({
            fromPath: `/${fromPath}`,
            redirectInBrowser: true,
            toPath,
          });
        });
      }
    }
  });

  const newestVocabularyEntry = await graphql(
    `
      {
        allMarkdownRemark(
          limit: 1
          filter: {fileAbsolutePath: {regex: "/vocabulary/"}}
          sort: {fields: [fields___date], order: DESC}
        ) {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
    `,
  );

  const newestVocabularyNode = newestVocabularyEntry.data.allMarkdownRemark.edges[0].node;

  // Vocabulary landing page should always show the most recent vocabulary entry.
  ['/vocabulary/', '/vocabulary'].map(slug => {
    createRedirect({
      fromPath: slug,
      redirectInBrowser: true,
      toPath: newestVocabularyNode.fields.slug,
    });
  });
};
