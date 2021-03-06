/*
    Production rule unit test
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
var logger = log4js.getLogger('ProductionRule');

var ProductionRule = require('../lib/ProductionRule');
var Constraint = require('../lib/Constraint');
var Signature = require('../lib/Signature');
var TypeLattice = require('../lib/TypeLattice');
var Type = require('../lib/Type');

describe('ProductionRule', function() {

  it('should create a production rule with unification constraints', function() {
    var rule = new ProductionRule('S', ['NP', 'VP'], 1);
    var path2 = ['NP', 'agreement', 'number'];
    var path1 = ['VP', 'agreement', 'number'];
    var constraint1 = new Constraint(path1, path2);
    var path3 = ['S', 'head'];
    var path4 = ['VP', 'head'];
    var constraint2 = new Constraint(path3, path4);
    var path5 = ['NP', 'agreement'];
    var path6 = 'agreement';
    var constraint3 = new Constraint(path5, path6);

    var signature = new Signature({
      implicitTypes:false
    });
    var agreement = new Type('agreement', [signature.typeLattice.bottom]);
    signature.typeLattice.addType(agreement);



    rule.processConstraints([constraint1, constraint2, constraint3], signature);
    
    //expect().toEqual(true);
    console.log('Feature structure: ' + JSON.stringify(rule.fs, null, 2));
  });
});