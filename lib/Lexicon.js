/*
    Lexicon class that maps words to feature structures
    Copyright (C) 2015 Hugo W.L. ter Doest

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var settings = require('../config/Settings');

var log4js = require('log4js');
log4js.configure(settings.log4js_config);
var logger = log4js.getLogger('Lexicon');

// Constructor
function Lexicon() {
  this.lexicon = {};
}

// Adds a word to the lexicon
// If the already exists the feature structure is added to the array
Lexicon.prototype.add_word = function(word, fs) {
  logger.debug('Lexicon.add_word: ' + word + '\n' + fs.pretty_print());
  if (this.lexicon[word]) {
    this.lexicon[word].push(fs);
  }
  else {
    this.lexicon[word] = [fs];
  }
};

// Looks up the feature structures for word and returns it
// This is an array
Lexicon.prototype.get_word = function(word) {
  return(this.lexicon[word]);
};

// Tags a sentence with zero or more feature structures
// words is an array of strings
Lexicon.prototype.tag_sentence = function(words) {
  var result = [];
  var that = this;
  words.forEach(function(word, index) {
    result[index] = [];
    result[index][0] = word;
    that.lexicon[word].forEach(function(fs) {
      result[index].push(fs);
    });
  });
  return(result);
};

Lexicon.prototype.pretty_print = function() {
  var that = this;
  var result = '';
  Object.keys(this.lexicon).forEach(function(word) {
    that.lexicon[word].forEach(function(fs) {
      result += '[' + word + ']' + '->\n' + fs.pretty_print() + '\n';      
    });
  });
  return(result);
};

module.exports = Lexicon;