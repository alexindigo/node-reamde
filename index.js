// public interface

module.exports = parseReadme;

// defaults

// TODO: Maybe we'd need to handle use case
// where code block starts at the beginning
// of the document
parseReadme.stripPatterns =
[
  // code blocks fenced with 4 and more backticks
  new RegExp('\\s(`{4,})(?=\\s)(?:[\\s\\S]+?)\\s\\1(?=\\s)', 'g'),
  // code blocks indented with four spaces
  new RegExp('^ {4,}.+$', 'mg')
]

parseReadme.matchPattern = new RegExp('```javascript(?=\\s)([\\s\\S]+?)```(?=\\s)', 'g');

// replaces strings with function body
parseReadme.defaultReplace = {};

// replaces strings with function body
parseReadme.defaultMapping = {};

// passes arguments to a example function call
parseReadme.defaultArguments = {'require': require};

// passes runtime arguments to a example function call
parseReadme.defaultRuntimeArguments = [];

// --- subroutines

function parseReadme(text, options)
{
  var functions = [];

  // combine options
  options = processOptions(options || {});

  // strip non-runnable code blocks
  parseReadme.stripPatterns.forEach(function(pattern)
  {
    text = text.replace(pattern, '');
  });

  text.replace(parseReadme.matchPattern, function(pattern, match)
  {
    // keep options separate per code block
    var func
      , args
      , localOptions = shallowClone(options)
      ;

    // process matched function body
    match = replaceSubstrings(match, localOptions);

    // make arguments usable
    args = argumentsToArrays(localOptions.arguments);

    // assemble function, add predefined arguments, then runtime ones
    // followed by function body
    func = Function.apply(Function, args.keys.concat(localOptions.runtime, match));

    // attach predefined arguments the result function
    // and bind bind to func :)
    functions.push(func.bind.apply(func, [func].concat(args.values)));
  });

  return functions;
}

// sets default options if no user-defined alternative is provided
// but don't do full blown merge
function processOptions(options)
{
  var combined =
  {
    replace   : shallowClone(options.replace   || parseReadme.defaultReplace),
    runtime   : [].concat(options.runtime      || parseReadme.defaultRuntimeArguments),
    mapping   : shallowClone(options.mapping   || parseReadme.defaultMapping),
    arguments : shallowClone(options.arguments || parseReadme.defaultArguments)
  };

  // add require mapping wrapper with fallback to require provided in options
  combined.arguments.require = requireWithMapping.bind(null, combined.arguments.require, combined.mapping);

  return combined;
}

// replaces matched substrings with function body
function replaceSubstrings(text, options)
{
  // untangle options.arguments
  options.arguments = shallowClone(options.arguments);

  Object.keys(options.replace).forEach(function(token, index)
  {
    // TODO: Allow passing prepared regexps
    // it will affect replacement function
    var pattern = new RegExp(token.replace(/\\|\/|\.|\(|\)|\[|\]|\^|\$|\?|\*|\+|\:|\=|\!|\|/g, '\\$&'), 'g');

    // replace matching substrings
    text = text.replace(pattern, function(match)
    {
      var variableId;

      // if replacement is not a string
      // create middleman variable
      // and pass it as an argument
      if (typeof options.replace[token] != 'string')
      {
        variableId = String.fromCharCode(97 + (index % 26)) + '_' + index + '_' + Math.floor(Math.random() * 1000);
        // store reference to the object as function argument
        // TODO: check for collisions
        options.arguments[variableId] = options.replace[token];
        return variableId;
      }
      else
      {
        return options.replace[token];
      }
    });
  });

  return text;
}

// Allows mapping for required modules
function requireWithMapping(require, mapping, module)
{
  var resolved;

  if (module in mapping)
  {
    resolved = mapping[module](require);
  }

  return resolved || require(module);
}

// converts arguments into an arrays of names and values
// to make sure the right order
function argumentsToArrays(obj)
{
  var key, result = {keys: [], values: []};

  for (key in obj)
  {
    if (!obj.hasOwnProperty(key)) continue;
    result.keys.push(key);
    result.values.push(obj[key]);
  }

  return result;
}

// creates shallow clone of the object
function shallowClone(obj)
{
  var result = {};

  for (key in obj)
  {
    if (!obj.hasOwnProperty(key)) continue;
    result[key] = obj[key];
  }

  return result;
}
