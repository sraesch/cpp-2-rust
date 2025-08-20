# cpp-2-rust

*cpp-2-rust* is an experimental project that explores the translation of C++/CMake based projects into Rust projects.
The idea is to apply Agentic Process Automation (APA) — a method where LLM-powered agents guide and automate parts of the workflow while still keeping a human-in-the-loop for supervision and decision-making.

## Motivation
### Not fully automatable
Cpp is too complex to be fully automatically translated into Rust. Decisions have to made in terms of

- Which language construct is translated to which Rust construct?
- How to handle C++ specific features that have no direct equivalent in Rust?
- What are the best practices for structuring the Rust code?
- Handling dependencies and build configurations in the transition from CMake to Cargo.

### Why use LLMs for this task?
Why use LLMs for this task and not rely on more traditional approaches?
- Translating C++ code to Rust code requires a deep understanding of both languages and their ecosystems. Doing this fully automated by parsing C++ code is a challenging task, as it involves not only syntax translation but also semantic understanding and context awareness.
- Early experiments with tools like Copilot have shown promise in assisting with code translation tasks, but they still require human oversight and intervention.

## Changelog
See [CHANGELOG.md](CHANGELOG.md) for details.