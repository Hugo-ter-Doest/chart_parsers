This is a library of chart parsers for natural language processing using 
context-free grammars and unification-based grammars.


# Supported algorithms
The following parsing algorithms are supported:
* Cocke Younger Kasama (CYK) Parser: an efficient purely bottom up chart 
parser for parsing with grammars in Chomsky Normal Form (CNF)
* Earley Parser:  a basic chart parser based on Earley's algorithm for 
parsing with context-free grammars
* Left-Corner Parser: a chart parser for parsing with top-down predictions 
based on the left-corner of production rules.
* Head-Corner Parser: a chart parser for parsing with top-down predictions  
based on the head of production rules.

All four parsers are created and called in the same way and return the same 
type of result, that is a chart with recognised items. Both context-free 
grammars and unification grammars can be used. In the next section it will be
explained how grammars and parsers are used in general. After that each 
parser will be discussed in more detail.


# Installation
This module can be installed using npm as follows:
```
npm install chart-parsers
```

# Usage
All four parser are used in the same way: load a grammar, create a parser and
 parse sentences.
```
var GrammarParser = require('GrammarParser');
var ParserFactory = require('ParserFactory');
var parserFactory = new ParserFactory();

var tagged_sentence = [['I', 'NP'], ['saw', 'V'], ['the', 'DET'], ['man', 'N'], 
                       ['with', 'P'], ['the', 'DET'], ['telescope', 'N']];
var grammar_text = "S -> NP *VP*\nNP -> DET *N*\nNP -> *NP* PP\nPP -> P *NP*\nVP -> *V* NP\nVP -> *VP* PP";

// Parse the grammar
var grammar = GrammarParser.parse(grammar_text);
// Create a parser; other parsing algorithms are 'Earley', 'LeftCorner', 'HeadCorner'
var parser = parserFactory.createParser({
  grammar: grammar, 
  type: 'CYK', 
  unification: false, 
  listOfCategories: true
});
// parse the sentence
var chart = parser.parse(tagged_sentence);
```
The resulting chart is an array of length N+1, and each entry contains items of the form [rule, dot, from, children] where:
* rule is the production rule; it has two members: lhs for the left-hand-side of the rule, and rhs for the right-hand-side of the rule.
* dot is the position in the right hand side of the rule up to which it has been recognised. 
* from is the origin position pointing at the position in the sentence at which recognition of this rule began.
* children are the completed items that are used to recognise the current item

Based on the children of the completed items the parse(s) of a sentence can 
be reconstructed.


# Context-Free Grammars
The grammar module reads context-free grammars from file, and offers some methods that are practical for parsing.

The syntax of production rules is as follows (in EBNF):
```
grammar =         { comment | production_rule }
production_rule = nonterminal, [ white_space ], "->", [ white_space ], [nonterminal_seq] , ["*" nonterminal "*" nonterminal_seq ]
nonterminal_seq = nonterminal, { whitespace, nonterminal }
nonterminal =     non_whitespace_char, { non_whitespace_char }
comment =         "//", { any_character }
```
Note the possibility of identifying one nonterminal as the head of the production rule. This information is used by the head-corner parser for predicting new partial parses.
Terminals are not allowed in the grammar, because we assume these to be 
recognised by a lexer and tagged with (lexical) categories (or feature 
structures). In the grammar these lexical categories are seen as preterminals.
The grammar parser also allows adding constraints to the production rules. Contraints may have two possible forms:
```
<nonterminal1 feature1 feature2> = type
<nonterminal2 feature3 feature3> = <nonterminal3 feature4>
```
where type is a type defined by a type lattice. See below for an explanation 
of type lattices.


# CYK Chart Parser
The CYK algorithm works with context-free grammars in Chomsky Normal Form (CNF). Production rules are of the form:
```
A -> B C
A -> a
```
where A, B and C are nonterminals and a is a terminal.

##Algorithm
The CYK algorithm is as follows:
```
function CYK-PARSE(sentence, grammar)
  let the input be a sentence consisting of n characters: a1 ... an.
  This grammar contains the subset Rs which is the set of start symbols.

  chart = INITIALISE-CHART(sentence, grammar)
  for each i = 2 to n do // Length of span
    for each j = 1 to n-i+1 do // Start of span
      for each k = 1 to i-1 do // Partition of span
        for each production A -> B C do
          if chart[j,k,B] and chart[j+k,i-k,C] then 
            chart[j,i,A] = true
          end
        end
      end
    end
  end
  return chart
end

function INITIALISE-CHART(sentence, grammar)
  let chart[n,n,r] be an array of booleans 
    where n is the length of the sentence and
    r the number of nonterminal symbols. 
  Initialize all elements of chart to false.
  for i = 1 to n do
    for each unit production A -> ai
      chart[i,1,A] = true
    end
  end
  return chart
end
```
(Adapted from: Wikipedia, http://en.wikipedia.org/wiki/CYK_algorithm)

Below is a simple toy grammar that is in CNF:
```
S -> NP VP
NP -> DET N
NP -> NP PP
PP -> P NP
VP -> V NP
VP -> VP PP
DET -> the
NP -> I
N -> man
N -> telescope
P -> with
V -> saw
N -> cat
N -> dog
N -> pig
N -> hill
N -> park
N -> roof
P -> from
P -> on
P -> in
```
The language generated by this grammar contains a.o. "I saw the man with the telescope". Clearly, this grammar contains the lexicon as well. In our parser the lexicon is separated from the grammar. The parser expects a tokenized and tagged sentence as input. In this way we feed the output of a tagger into the parser.

# Earley Chart Parser
The Earley Chart Parser can parse all context-free languages and uses arbitrary context-free grammars.

##Algorithm
The algorithm in pseudo code:
```
function EARLEY-PARSE(words, grammar)
  ENQUEUE((γ → •S, 0), chart[0])
  for i ← from 0 to LENGTH(words) do
      for each state in chart[i] do
        if INCOMPLETE?(state) then
          PREDICTOR(state, i, grammar)
        else
          COMPLETER(state, i)
        end
      end
  end
  return chart
end
 
procedure PREDICTOR((A → α•B, i), j, grammar)
    for each (B → γ) in GRAMMAR-RULES-FOR(B, grammar) do
        ADD-TO-SET((B → •γ, j), chart[j])
    end
end
 
procedure COMPLETER((B → γ•, j), k)
  for each (A → α•Bβ, i) in chart[j] do
    ADD-TO-SET((A → αB•β, i), chart[k])
  end
end
```
(Adapted from: Wikipedia, http://en.wikipedia.org/wiki/Earley_parser)

# Left-Corner Chart Parser
The left-corner algorithm is parses the sentence from left to right just like the Earley algorithm. The only difference is in the prediction of new items. The left-corner relation is used to optimise predictions top down. Therefore, the left-corner algorithm is called an bottom-up with top-down filtering.
The left-corner relation is based on the left-corner of production rules. Consider the following production rule
```
S -> NP VP
```
NP is called the left-corner of S, written as <code> S >_lc NP</code>. The transitive reflexive closure, written as <code>>_lc*</code>,  is used for filtering.

## Algorithm
```
function LEFT-CORNER-PARSE(sentence)
  chart = INITIALISE-CHART(sentence)
  agenda = INITIALISE-AGENDA(sentence)
  for i = 0 to n do
    for items [A → α•β, i] do
      LC-PREDICTOR(item, chart, grammar)
      COMPLETER(item, chart, grammar)
    end
  end
  return chart
end
```
The deduction rules that is applied by LC-PREDICTOR is:
```
D_lc = {[X → γ•, k, j], [A → α.Cβ,i,k] |- [B → X.δ, k, j] | B → Xδ, C >_lc* B}
```

# Head-Corner Chart Parser
The algorithm of head corner parsing is based on the idea that the right-hand side of a production rule contains a head, a word or constituent that determines the syntactic type of the complete phrase. To make the algorithm work in each production rule the right hand-side must a symbol that is decorated as head, like this:
 ```
NP -> DET *N*
```
This means that N is head-corner of NP, or <code>NP >_hc N</code>. The parser uses these the head-corner relation to predict new partial parses. In fact, it uses the reflexive transitive closure of the head-corner relation to create new goal items and head-corner items. The closure is written as <code>>_hc*</code>

## Algorithm
Head-corner parsing involves a complex administrative bookkeeping. It uses a chart and an agenda. As long as items are available on the agenda, it takes an item from the agenda and tries to combine it with items on the chart. New items are added to the agenda. Algorithm in pseudo-code:
```
function HEAD-CORNER-PARSE(sentence)
  chart = INITIALISE-CHART(sentence)
  agenda = INITIALISE-AGENDA(sentence)
  while not IS-EMPTY(agenda) do
    current = GET-ITEM-FROM-AGENDA(agenda)
      if not IS-ON-CHART(current) then
        ADD-TO-CHART(chart, current)
        COMBINE-WITH-CHART(chart, current)
      end
  end
  return chart
end
```
The following types of items are used:
* CYK items are of the form <code>[A, i, j]</code> which means that nonterminal A can produce the sentence from position i to position j.
* Goal items are of the form <code>[l, r, A]</code> which means that the nonterminal is expected to be recognised somewhere between position l and r.
* Head-corner items are of the form <code>[S -> NP VP, i, j, l, r] </code> where the right hand side of the production rule has been recognised from position i to j, and the recognised part of the production can generate the sentence from position l to r.

Given a sentence a1, a2, .. , an, the following set is used to initialise the agenda; it adds goal items to the agenda for the start symbol.
```
D_init_agenda = {[i, j, S]|0 <= i <= j <= n}
```
The following set is used to initialise the chart; for each word of the sentence appropriate CYK items are added to the chart.
```
D_init_chart = {[A, i, i+1]| A -> a_i, 0 <= i <= n}
```
These deduction rules are used for creating new items in the combine step:
```
(1) D_HC = {[i, j, A], [X, i, j] |- [B -> α•X•β, i, j] | A >_hc* B}
(2) D_HC_epsilon = {[j, j, A] |- [B -> ••, j, j] | A >_hc* B}
(3) D_left_predict = {[l, r, A], [B -> αC•β•γ, k, r] |- [i, j, C] | A >_hc* B, l <= i <= j <= k}
(4) D_right_predict = {[l, r, A], [B -> α•β•Cγ, l, i] |- [j, k, C] | A >_hc* B, i <= j <= k <= r}
(5) D_pre_complete = {[A -> •β•, i, j] |- [A, i, j]}
(6) D_left_complete = {[i, k, A], [X, i, j], [B -> αX•β•γ, j, k] |- [B -> α•Xβ•γ, i, k] | A >_hc* B}
(7) D_right_complete = {[i, k, A], [B -> α•β•Xγ, i, j], [X, j, k] |- [B -> α•βX•γ, i, k] | A >_hc* B}
```
Deduction rules (1) and (2) introduce head-corner items from goal items. Rules (3) and (4) introduce goal items from partially recognised head-corner items. Rule (5) creates CYK items for head-corner items that are completely recognised. Rules (6) and (7) recognise parts of head-corner items based on CYK items. 

## Usage
The head-corner parser is created and applied as usual; there is one 
difference: the production rules of the grammar must be decorated with heads 
as follows:
```
S -> NP *VP*
NP -> DET *N*
NP -> *NP* PP
PP -> P *NP*
VP -> *V* NP
VP -> *VP* PP
```

# Specification of a type lattice
A type lattice is specified as follows:
```
Type type1 ()
Type type2 ()
Type type3 (type1 type2)
Type type4 (type1)
Type type5 (type 4)
```
Each type specification if started with keyword Type followed by the type 
name and the super types between braces. If no super types are supplied, 
BOTTOM (the most general type) is assumed to be the sole super type.

Once a type lattice has been created the least upper bound of two types can be 
determined:
```
var LUB = type1.LUB(type2, type_lattice);
```
Checking if one type subsumes another type is done as follows:
```
if (type1.subsumes(type2, type_lattice)) {
  console.log(type1.prettyPrint() + ' subsumes ' + type2.prettyPrint());
}
```
A type may be appropriate for a feature with a value type. These appropriate
 features are specified in the form of a feature structure:
```
Type type1 ()
Type type2 ()
Type type3 (type1 type2) ->
[type3
 FEATURE1: type1
 FEATURE2: [type2
            FEATURE3: type1
           ]
]
```
When a new type with a feature structure is defined:
* The feature structure of the type is unified with the feature structures of
 its super types.
* The types used in the feature structure are unified with the respective 
feature structures belonging to these types.

As a result the feature structure inherits all appropriate features and types
 from super types and used types.
 
Built-in types are (types are case sensitive):
* <code>BOTTOM</code>: least specific type
* <code>TOP</code>: most specific type 
* <code>LIST</code>: a list of coreferences and/or feature structures
* <code>CONCATLIST</code>: concatenation of lists referred to
* <code>STRING</code>: a lexical string
* <code>RULE</code>: type used for the feature structures of production rules
* <code>CONSTITUENT</code>: type used for the feature structures of a 
RHS nonterminal 

# Typed feature structures
Feature structures are specified using a specification language that largely 
follows PATRII. The LexiconParser reads lexicons that assign feature structures 
to words. Multiple alternative feature structures may be assigned to the same
word by specifying multiple entries of the word. Each node of a feature  
structure has a type assigned that is specified in a type lattice.
```
[home] ->
[sign
 CATEGORY: noun
 AGREEMENT: [agreement
             NUMBER: singular
             GENDER: neutrum
            ]
]
```
In this example the root node of the feature structure is of type sign and 
category is of type noun.

Feature structures can be unified as follows:
```
var result = fs1.unify(fs2, typeLattice);
```

Features may have several different values:
**Type**: <code>feature: type</code>
```
PERSON: first
```
**Feature structure**: <code>f1: [t1 f2: t2]</code>
```
AGREEMENT: [agreement
            PERSON: first
            GENDER: masculin
           ]
```
A **coreference** to a feature structures: <code>FEATURE: [1]</code>
```
AGREEMENT: [1][agreement
               PERSON: first
               GENDER: masculin
              ]
SAME: [1]
```
A **list** of coreferences to other feature structures: <code><[1], [2], ..
.></code>; A list may contain embedded feature structures.
```
NP: [1]: [...]
PP: [2]: [...]
CAT: [cat
      COMPS: <[1], [2], [BOTTOM f: type]>
     ]
```
A **concatenated list** of coreferences: <code>[1] + 
[2]</code>
```
CAT: [cat
      SUBJ: [1]: <>
      SPR: [2]: <>
      COMPS: [3]: <NP>
      ARG-STR: <[1] + [2] + [3]>
     ]
```

# References
* An Introduction to Unification-Based Approaches to Grammar, Stuart M. 
Shieber, 2003, URL: https://dash.harvard.edu/handle/1/11576719
* Head-Driven Phrase Structure Grammar, Pollard, Carl, and Ivan A. Sag. 1994. 
 Chicago: University of Chicago Press and Stanford: CSLI Publications. 
 Chapters 1, 3 and 4 are online available: http://hpsg.stanford.edu/LSA07/
* Introduction to Head-driven Phrase Structure Grammar, Steve Harlow, 2009, 
URL: http://www-users.york.ac.uk/~sjh1/hpsgcourse.pdf
