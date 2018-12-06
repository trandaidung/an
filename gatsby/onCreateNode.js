/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 */

'use strict';

const path = require('path');

// Parse date information out of vocabulary post filename.
const VOCABULARY_POST_FILENAME_REGEX = /([0-9]+)\-([0-9]+)\-([0-9]+)\-(.+)\.md$/;

function buildRedirectString(permalink, redirect_from) {
  if (!permalink || !permalink.endsWith('.html')) {
    return redirect_from ? JSON.stringify(redirect_from) : '';
  }

  let basePath = permalink.slice(0, -'.html'.length);
  let redirects = [basePath, basePath + '/'];
  if (Array.isArray(redirect_from)) {
    redirects = redirects.concat(redirect_from);
  }

  return JSON.stringify(redirects);
}

// Add custom fields to MarkdownRemark nodes.
module.exports = exports.onCreateNode = ({node, actions, getNode}) => {
  const {createNodeField} = actions;

  switch (node.internal.type) {
    case 'MarkdownRemark':
      const {permalink, redirect_from} = node.frontmatter;
      const {relativePath, sourceInstanceName} = getNode(node.parent);

      let slug = permalink;

      if (!slug) {
        if (relativePath.includes('vocabulary')) {
          // Vocabulary posts don't have embedded permalinks.
          // Their slugs follow a pattern: /vocabulary/<year>/<month>/<day>/<slug>.html
          // The date portion comes from the file name: <date>-<title>.md
          const match = VOCABULARY_POST_FILENAME_REGEX.exec(relativePath);
          const year = match[1];
          const month = match[2];
          const day = match[3];
          const filename = match[4];

          slug = `/vocabulary/${year}/${month}/${day}/${filename}.html`;

          const date = new Date(year, month - 1, day);

          // Vocabulary posts are sorted by date and display the date in their header.
          createNodeField({
            node,
            name: 'date',
            value: date.toJSON(),
          });
        }
      }

      if (!slug) {
        // This will likely only happen for the partials in /content/home.
        slug = `/${relativePath.replace('.md', '.html')}`;
      }

      // Used to generate URL to view this content.
      createNodeField({
        node,
        name: 'slug',
        value: slug,
      });

      // Used to generate a GitHub edit link.
      // this presumes that the name in gastby-config.js refers to parent folder
      createNodeField({
        node,
        name: 'path',
        value: path.join(sourceInstanceName, relativePath),
      });

      // Used by createPages() above to register redirects.
      createNodeField({
        node,
        name: 'redirect',
        value: buildRedirectString(permalink, redirect_from),
      });

      return;
  }
};
