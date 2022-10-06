## LAST

**L**ookup **A**bstract **S**yntax **T**ree

`last` is a specification for representing the input format for the `lookup` function 
as an abstract syntax tree. It implements the [unist][] spec. 

## Lookup

The setup chain `lookup` function has two major phases

1. parsing
2. executing

The parsing phase takes a raw value and compiles it into a lookup syntax tree.
The executing phase walks the tree performing the actions as describe by
the tree. The end result of the executing phase is a single value that will replace
the original input value.

## Parse

The setup chain uses a custom parser to convert the lookup syntax
into a [unist][] compliant syntax tree. Internally, when `lookup` is
call, the input string is lexed into tokens and tanslated into a raw
parser tree. Finally the parse tree is converted into the abstract syntax
tree which is used to execute the various functions declared in the original input.

[unist]: https://github.com/syntax-tree/unist

