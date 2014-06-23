/**
 * File: ParserController.js
 * Last edit: 19-6-2014
 */

var formidable = require('formidable');

var Grammar = require('./ContextFreeGrammar');
var CYK = require('./CYK');
var EarleyChartParser = require('./EarleyChartParser');

// Page for loading a grammar
exports.choose_grammar_file = function(req, res) {
  res.render('load_grammar');
};

// Submit a grammar file
exports.submit_grammar = function(req, res) {
  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
    var grammar_file = files.grammar_file.path + files.grammar_file.name;
    Grammar.read_grammar_file(files.grammar_file.path, function(error) {
      res.redirect('/parse_sentence');
    });
  });
};

// Page for entering a sentence
exports.input_sentence = function(req, res) {
  res.render('parse_sentence');
};

// Page for presenting the result of parsing
exports.parse_sentence = function(req, res) {
  var chart_CYK, chart_Earley;
  var sentence;
  var start, end, accepted_CYK, accepted_Earley;
  var time_CYK, time_Earley;

  sentence = CYK.tokenize_sentence(req.param('input_sentence'));
  var N = sentence.length;
  
  // CYK
  start = new Date().getTime();
  chart_CYK = CYK.CYK_Chart_Parser(sentence);
  end = new Date().getTime();
  time_CYK = end - start;
  console.log(chart_CYK);
  accepted_CYK = chart_CYK[N - 1][0] ? (chart_CYK[N - 1][0].indexOf(Grammar.start_symbol()) !== -1) : false;
  
  // Earley
  start = new Date().getTime();
  chart_Earley = EarleyChartParser.earley_parse(sentence);
  end = new Date().getTime();
  console.log(end);
  time_Earley = end - start;
  console.log(chart_Earley);
  
  accepted_Earley = false;
  var keys_of_final_state = Object.keys(chart_Earley[N]);
  keys_of_final_state.forEach(function(key) {
    var item = chart_Earley[N][key];
    if ((item.rule.lhs === Grammar.start_symbol()) && (item.rule.rhs.length === item.dot)) {
      accepted_Earley = true;
    }
  });

  res.render('parse_result', {chart_CYK: chart_CYK, parsing_time_CYK: time_CYK, in_language_CYK: accepted_CYK,
                              chart_Earley: chart_Earley, parsing_time_Earley: time_Earley, in_language_Earley: accepted_Earley,
                              N: N, sentence: sentence });
};