# The dream of HyperCard

Project direction captured from Andur's conversations, 23 November 2026. This is an exploratory brief, not an implemented product or a commitment to build an operating-system emulator.

## The personal starting point

Around 1994, Andur's father downloaded *Land of the Fuzzies*. Andur and his sister discovered that its HyperCard buttons, fields and scripts were easy to modify, then began making their own games. Andur remembers thinking in second grade about moving back and forth between cards to create real-time behavior, then imagining a card interacting with itself—a first intuition of recursion.

Andur compares that direct experience with later developer environments: large text editors, elaborate file structures and command-line ceremony often felt archaic and regressive. HyperCard was sufficiently simple and visual for him to build things at seven. He recalls the phrase “command line bullshittery” from a CS professor's post, but the author and post have not been identified; do not invent an attribution.

The new possibility is AI: a return to creating by intention and immediate interaction. In Andur's words, “The dream of HyperCard might be realized in this new age.” This may merit a major project, rather than a nostalgic portfolio ornament.

## Proposed product thesis

Let a person point at a thing, change it, try it, and understand what happened. Natural-language assistance should work alongside direct manipulation, with inspectable behaviors and reversible edits. The person remains the author. The product should be useful even before AI is connected.

## A deliberately small first experiment

An editable stack of three cards, with buttons, text fields, navigation and a tiny set of visible behaviors. Recreate the *kind* of interaction Andur remembers; do not claim to reconstruct the original game without its source.

A person can:

1. Add or select a button on a card and change its appearance.
2. Assign “when clicked, go to this card” through visual controls.
3. Add a counter and a conditional action, then watch each action execute.
4. Switch between editing and playing without a build step.
5. Undo changes and export/import a portable, versioned stack file.

Keep the document model and action interpreter independent of rendering. A Swift core compiled for iOS and WebAssembly is one candidate, to evaluate after the Mastermind experiment. Plain JavaScript is also viable; technology should follow the interaction design.

## AI as a proposed second layer

Select a card or object and ask for a change. Show the proposed change to the stack and its behavior before applying it; make each accepted change undoable as one operation. Prefer a constrained action model over arbitrary generated code initially. Show intermediate state when debugging so a user can explain a mistake in terms of what they saw.

An initial success case: a novice makes a working branching story with a score, without arranging source files or opening a terminal. Then they can modify a rule, explain its effect, and recover from an unwanted edit.

## Decisions for a later design session

- First audience: children, curious adults, educators, or experienced developers seeking a simpler medium?
- First useful artifact: interactive stories, small games, personal tools, or all three with one shared model?
- How much scripting is visible, optional or required? What should a user see when an action repeats or calls itself?
- Local-only AI versus an explicitly connected service; cost and privacy need concrete choices before implementation.
- Native iOS editing versus browser-first authoring. Sharing, collaboration and hosting can follow a useful single-user version.

Avoid starting with operating-system emulation, arbitrary-code execution, a general IDE, accounts, a marketplace or multi-user synchronization. Those are scope choices for later, not prerequisites for testing the central idea.
