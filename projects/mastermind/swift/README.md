# Shared Swift Mastermind solver

This is a platform-independent adaptation of Andur Carr's `Code.swift` and `Knuth.swift`, prepared with AI assistance. It preserves the original minimax design; ties now use the same numeric order as the browser's JavaScript implementation. The original source repository is unchanged. A future SwiftUI app can depend on this Swift package; no iOS app, signing, simulator or App Store distribution is part of this increment.

## Rebuild the browser artifact

Use the official [Swift WebAssembly SDK instructions](https://www.swift.org/documentation/articles/wasm-getting-started.html). The shipped binary was compiled with **Swift 6.4.3**, SDK checksum `5f24408dc9737ce4cb23b7e3ed4306cabfa02cc02f22ab260b14579b955d4b12`. Toolchain and SDK versions must match. The Swift.org package's Apple signature was verified before extraction; no global installation or Xcode license change was performed.

From the repository root, set these two variables to the corresponding extracted or installed directories, then build:

```sh
export SWIFT_TOOLCHAIN=/path/to/toolchain.xctoolchain
export SWIFT_WASM_SDK=/path/to/swift-6.4.3-RELEASE_wasm/wasm32-unknown-wasip1
sh projects/mastermind/swift/build.sh
node projects/mastermind/wasm-check.mjs
```

`SWIFT_TOOLCHAIN` contains `usr/bin/swiftc`. `SWIFT_WASM_SDK` contains `WASI.sdk` and `swift.xctoolchain`. The script compiles in Embedded mode, links the SDK's reactor startup, libc and compiler builtins explicitly, and strips unused material. The resulting module has zero imports and needs no WASI environment in the browser. Explicit SDK builtins avoid the host compiler's default runtime search path. A temporary module cache is removed after the build; the previous artifact is replaced only after a successful link.

The browser calls `_initialize` and `mm_init` once per worker, then `mm_reset`, `mm_observe` for each turn and `mm_next`. IDs are base-six four-peg codes from 0 through 1295. Feedback is exact × 5 + partial. ABI errors: −1 invalid input, −2 contradictory history, −3 solved, −4 exhausted turns, −5 uninitialized. The JS wrapper rejects non-integers before they could be truncated by the Wasm ABI. A solver instance is mutable and must be used from one executor at a time.

## Native smoke check

`NativeCheck.swift` compiles the exact same source without the Wasm bridge and plays every secret. With a configured native Swift toolchain:

```sh
swiftc -O projects/mastermind/swift/Sources/MastermindCore/MastermindSolver.swift \
  projects/mastermind/swift/NativeCheck.swift -o /tmp/mastermind-native-check
/tmp/mastermind-native-check
```

On this machine, the check used the standalone Swift 6.4.3 toolchain with the already-installed Command Line Tools SDK and `DEVELOPER_DIR=/Library/Developer/CommandLineTools`. No Apple-platform UI was compiled. SwiftPM exposes the core as the `MastermindCore` library.

## Runtime notices

The compiled artifact may include supporting code from Swift, LLVM/compiler-rt and wasi-libc/musl. Their upstream license notices are retained in `licenses/`: Swift's Apache license with Runtime Library Exception; LLVM's license with its exceptions; wasi-libc's license overview and MIT terms; and musl's copyright notice. Sources: the signed Swift toolchain distribution, [LLVM](https://github.com/llvm/llvm-project/blob/main/compiler-rt/LICENSE.TXT), and [wasi-libc](https://github.com/WebAssembly/wasi-libc/blob/main/LICENSE). These notices describe upstream runtime components, not a new license grant for Andur's original game.
