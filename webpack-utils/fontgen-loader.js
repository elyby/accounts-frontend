/* eslint-env node */
/**
 * Forked from
 *
 * https://github.com/DragonsInn/fontgen-loader
 */

const loaderUtils = require('loader-utils');
const fontgen = require('webfonts-generator');
const path = require('path');
const glob = require('glob');

const mimeTypes = {
  eot: 'application/vnd.ms-fontobject',
  svg: 'image/svg+xml',
  ttf: 'application/x-font-ttf',
  woff: 'application/font-woff',
};

function absolute(from, to) {
  if (arguments.length < 2) {
    return function(to) {
      return path.resolve(from, to);
    };
  }

  return path.resolve(from, to);
}

function getFilesAndDeps(patterns, context) {
  let files = [];
  const filesDeps = [];
  let directoryDeps = [];

  function addFile(file) {
    filesDeps.push(file);
    files.push(absolute(context, file));
  }

  function addByGlob(globExp) {
    const globOptions = { cwd: context };

    const foundFiles = glob.sync(globExp, globOptions);
    files = files.concat(foundFiles.map(absolute(context)));

    const globDirs = glob.sync(`${path.dirname(globExp)}/`, globOptions);
    directoryDeps = directoryDeps.concat(globDirs.map(absolute(context)));
  }

  // Re-work the files array.
  patterns.forEach(pattern => {
    if (glob.hasMagic(pattern)) {
      addByGlob(pattern);
    } else {
      addFile(pattern);
    }
  });

  return {
    files,
    dependencies: {
      directories: directoryDeps,
      files: filesDeps,
    },
  };
}

module.exports = function(content) {
  this.cacheable();
  const params = loaderUtils.getOptions(this) || {};
  let config;
  try {
    config = JSON.parse(content);
  } catch (ex) {
    config = this.exec(content, this.resourcePath);
  }

  config.__dirname = path.dirname(this.resourcePath);

  // Sanity check
  /*
     if(typeof config.fontName != "string" || typeof config.files != "array") {
     this.reportError("Typemismatch in your config. Verify your config for correct types.");
     return false;
     }
     */
  const filesAndDeps = getFilesAndDeps(config.files, this.context);
  filesAndDeps.dependencies.files.forEach(this.addDependency.bind(this));
  filesAndDeps.dependencies.directories.forEach(
    this.addContextDependency.bind(this),
  );
  config.files = filesAndDeps.files;

  // With everything set up, let's make an ACTUAL config.
  let formats = config.types || ['eot', 'woff', 'ttf', 'svg'];

  if (formats.constructor !== Array) {
    formats = [formats];
  }

  const fontconf = {
    files: config.files,
    fontName: config.fontName,
    types: formats,
    order: formats,
    fontHeight: config.fontHeight || 1000, // Fixes conversion issues with small svgs
    templateOptions: {
      baseClass: config.baseClass || 'icon',
      classPrefix: 'classPrefix' in config ? config.classPrefix : 'icon-',
    },
    dest: '',
    writeFiles: false,
    formatOptions: config.formatOptions || {},
  };

  // This originally was in the object notation itself.
  // Unfortunately that actually broke my editor's syntax-highlighting...
  // ... what a shame.
  if (typeof config.rename === 'function') {
    fontconf.rename = config.rename;
  } else {
    fontconf.rename = function(filePath) {
      return path.basename(filePath, '.svg');
    };
  }

  if (config.cssTemplate) {
    fontconf.cssTemplate = absolute(this.context, config.cssTemplate);
  }

  for (const option in config.templateOptions) {
    if (config.templateOptions.hasOwnProperty(option)) {
      fontconf.templateOptions[option] = config.templateOptions[option];
    }
  }

  // svgicons2svgfont stuff
  const keys = [
    'fixedWidth',
    'centerHorizontally',
    'normalize',
    'fontHeight',
    'round',
    'descent',
  ];

  for (const x in keys) {
    if (typeof config[keys[x]] !== 'undefined') {
      fontconf[keys[x]] = config[keys[x]];
    }
  }

  const cb = this.async();
  const opts = this._compiler.options;
  const pub = opts.output.publicPath || '/';
  const embed = !!params.embed;

  if (fontconf.cssTemplate) {
    this.addDependency(fontconf.cssTemplate);
  }

  fontgen(fontconf, (err, res) => {
    if (err) {
      return cb(err);
    }

    const urls = {};

    for (const i in formats) {
      if (!formats.hasOwnProperty(i)) {
        continue;
      }

      const format = formats[i];

      if (embed) {
        urls[format] = `data:${
          mimeTypes[format]
        };charset=utf-8;base64,${new Buffer(res[format]).toString('base64')}`;
      } else {
        let filename =
          config.fileName || params.fileName || '[hash]-[fontname][ext]';
        filename = filename
          .replace('[fontname]', fontconf.fontName)
          .replace('[ext]', `.${format}`);

        const url = loaderUtils.interpolateName(this.context, filename, {
          content: res[format],
        });

        urls[format] = path.join(pub, url).replace(/\\/g, '/');
        this.emitFile(url, res[format]);
      }
    }

    const code = res.generateCss(urls);

    cb(null, `module.exports = ${JSON.stringify(code)}`);
  });
};
