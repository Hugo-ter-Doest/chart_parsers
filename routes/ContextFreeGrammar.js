/*
 * File: ContextFreeGrammar.js
 * Last edit: 29-6-2014
 * Author: Hugo W.L. ter Doest
 */

var fs = require('fs');

// Production rules and start symbol are global
var _production_rules = [];
var _nonterminals = [];
var _s = null;

// Checks if B is a nonterminal
exports.is_nonterminal = function(B) {
  console.log("Checking if " + B + " is a nonterminal: " + _nonterminals.indexOf(B) !== -1);
  return (_nonterminals.indexOf(B) !== -1);
};

// Looks up all rules with lhs B
exports.rules_with_lhs = function(B) {
  var rules = [];
  
  _production_rules.forEach(function(rule) {
    if (rule.lhs === B) {
      rules.push(rule);
    }
  });
  return(rules);
};

// Returns the start production rule which is the first rule read from file
exports.start_rule = function() {
  return(_production_rules[0]);
};

// Returns the start symbol
exports.start_symbol = function() {
  return _s;
};

// Returns all terminal rules that match right hand side terminal s
exports.left_hand_sides = function(s) {
  var res = [];

  _production_rules.forEach(function(rule){
    if ((rule.rhs[0] === s) && (rule.rhs.length === 1)) {
      res.push(rule);
    }
  });
  return res;
};

// Returns all left hand sides that match right hand side nonterminals s and t
exports.left_hand_sides2 = function(s, t) {
  var res = [];
  
  _production_rules.forEach(function(rule) {
    if ((rule.rhs.length === 2) && (rule.rhs[1] === s) && (rule.rhs[2] === t)) {
      res.push(rule);
    }
  });
  return res;
};

// Parse the grammar into production rules
function parse_grammar(grammar_text) {
  var new_rule;
 
  var re_rule = /^(\w+)\s*->\s*(.*)$/;
  grammar_text = grammar_text.split(/\r?\n/);
  
  for (var i = 0; i < grammar_text.length; ++i) {
    var r = grammar_text[i];
    
    if (r.length === 0) {
      continue;
    }
    
    var a = re_rule.exec(r);
    if (a === null) {
      throw "bad rule syntax: " + r;
    }

    new_rule = {};
    new_rule.lhs = a[1];
    new_rule.rhs = a[2].split(/\s+/);

    _production_rules.push(new_rule);
    _nonterminals.push(new_rule.lhs);
    if (_s === null) {
      _s = a[1];
    }
  }
}

// Reset production rules and start symbol
function initialise_grammar() {
  _production_rules = [];
  _nonterminals = [];
  _s = null;
}

// Read grammar from file
exports.read_grammar_file = function(grammar_file, callback)  {
  initialise_grammar();
  fs.readFile(grammar_file, 'utf8', function (error, grammar_text) {
    if (error) {
      console.log(error);
    }
    parse_grammar(grammar_text);
    console.log(_production_rules);
    console.log(_nonterminals);
    console.log(_s);
    callback(error);
  });
};