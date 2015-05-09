/*
    Type Lattice class
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
var logger = log4js.getLogger('TypeLattice');

require('string.prototype.repeat');

var Type = require('./Type');

// Initialises the lattice
// Creates top and bottom and initialises the list of types and the lub_matrix
// options: implicit_types configures if types can be implicitly introduced
function TypeLattice(options) {
  // least specific, smallest type
  this.bottom = new Type("BOTTOM");
  // undefined, result of two types that cannot be unified
  this.top = new Type("TOP");
  this.lub_matrix = new Array(2);
  this.bottom.index = 0;
  this.top.index = 1;
  this.lub_matrix[0] = [this.bottom.index];
  this.lub_matrix[1] = [this.top.index, this.top.index];
  this.types = [this.bottom, this.top];
  this.number_of_types = 2;
  this.implicit_types = options.implicit_types;
}

// Look up the type with name name
// If a type is not found, it is created and added to the lattice with empty 
// supertypes
// Lookup is now inefficient for a large number of types
// Maybe add a map from names to types later
TypeLattice.prototype.get_type_by_name = function(name) {
  var found = false;
  var i = 0;
  
  // loop while not found
  do {
    found = (this.types[i].name === name);
    i++;
  }
  while ((found === false) && (i < this.types.length));
  if (found) {
    return(this.types[i-1]);
  }
  else {
    if (this.implicit_types) {
      // create the type
      var new_type = new Type(name, []);
      this.add_type(new_type);
      return(new_type);
    }
    else {
      return(null);
    }
  }
};

// Adds a type to the lattice
// type is an object
TypeLattice.prototype.add_type = function(type) {
  type.index = this.number_of_types;
  this.number_of_types++;
  this.types.push(type);
  logger.debug('TypeLattice.add_type: ' + type.pretty_print());
  // add a row to the lub_matrix of length this.number_of_types
  this.lub_matrix.push(Array(this.number_of_types));
  // initialise the new row to top
  for (var i = 0; i < this.number_of_types; i++) {
    this.lub_matrix[type.index][i] = this.top.index;
  }
  // add trivial least upper bounds with bottom and itself
  this.lub_matrix[type.index][this.bottom.index] = type.index;
  this.lub_matrix[type.index][type.index] = type.index;
  // add the super types to the matrix: least upper bound is the new type
  var that = this;
  if (type.super_types) {
    type.super_types.forEach(function (super_type) {
      that.lub_matrix[type.index][super_type.index] = type.index;
    });
  }
  // recalculate the lub_matrix
  this.compute_lub_matrix();
};

// Computes the least upper bound matrix
// Based on an algorithm by Mark Moll
TypeLattice.prototype.compute_lub_matrix = function() {
  var i,j;
  // variables for better readability
  var n = this.number_of_types;
  var lub = this.lub_matrix;

  logger.debug('TypeLattice.compute_lub_matrix');

  for (i = n - 2; i > 2; i--) {
    if (lub[n - 1][j] === (n - 1)) {
      for (j = i - 1; j > 1; j--) {
        if (lub[i][j] === i) {
          lub[n - 1][j] = n - 1;
        }
      }
    }
  }
  for (i = 3; i < n; i++) {
    if (lub[n - 1][i] === n - 1) {
      for (j = 2; j < i; j++) {
        if ((lub[n - 1][j] === (n - 1)) && (lub[i][j] === this.top.index)) {
          lub[i][j] = n - 1;
        }
      }
    }
  }
};

// Prints a table with the least upper bound relation
TypeLattice.prototype.pretty_print = function() {
  var n = this.number_of_types;
  var result = '';
  
  result += '\t' + '-'.repeat(8);
  result += '\n';
  for (var i = 0; i < n; i++) {
    result += this.types[i].name.substr(0,6);
    result += '\t|';
    for (var j = 0; j <= i; j++) {
      result += this.types[this.lub_matrix[i][j]].name.substring(0, 6) + '\t|';
    }
    result += '\n';
    result += '\t' + '-'.repeat(8 * (i + ((i === n-1) ? 1 : 2)));
    result += '\n';
  }
  result += '\t ';
  for (var i = 0; i < n; i++) {
    result += this.types[i].name.substr(0,6) + '\t ';
  }  
  return(result);
};

module.exports = TypeLattice;