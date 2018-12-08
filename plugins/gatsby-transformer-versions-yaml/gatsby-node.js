const createRedirects = require('./create-redirects');
const path = require('path');

exports.onPostBuild = async ({store}) => {
  const {program} = store.getState();
  const redirectsFilePath = path.join(
    program.directory,
    'public',
    '_redirects',
  );

  createRedirects(redirectsFilePath);
};
