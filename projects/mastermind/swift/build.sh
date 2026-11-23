#!/bin/sh
# A matching swift.org toolchain and Wasm SDK are required; no global install.
set -eu
: "${SWIFT_TOOLCHAIN:?Set SWIFT_TOOLCHAIN to the toolchain root containing usr/bin}"
: "${SWIFT_WASM_SDK:?Set SWIFT_WASM_SDK to the SDK directory containing WASI.sdk}"
base=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
build_cache=$(mktemp -d "${TMPDIR:-/tmp}/mastermind-swift.XXXXXX")
trap 'rm -rf "$build_cache"' EXIT HUP INT TERM
"$SWIFT_TOOLCHAIN/usr/bin/swiftc" -module-cache-path "$build_cache" \
  -target wasm32-unknown-wasip1 \
  -sdk "$SWIFT_WASM_SDK/WASI.sdk" \
  -resource-dir "$SWIFT_WASM_SDK/swift.xctoolchain/usr/lib/swift" \
  -static-stdlib -enable-experimental-feature Embedded -wmo -O -parse-as-library \
  -Xclang-linker -mexec-model=reactor -Xclang-linker -nostdlib \
  -Xlinker "$SWIFT_WASM_SDK/swift.xctoolchain/usr/lib/clang/lib/wasip1/libclang_rt.builtins-wasm32.a" \
  -Xlinker "$SWIFT_WASM_SDK/WASI.sdk/lib/wasm32-wasip1/crt1-reactor.o" \
  -Xlinker -lc \
  -Xlinker --export=mm_init -Xlinker --export=mm_reset \
  -Xlinker --export=mm_observe -Xlinker --export=mm_next \
  -Xlinker --export=mm_remaining -Xlinker --export=mm_worst -Xlinker --export=mm_score \
  -Xlinker --strip-all \
  "$base/Sources/MastermindCore/MastermindSolver.swift" "$base/Bridge.swift" \
  -o "$build_cache/mastermind.wasm"
# Replace the shipped artifact only after a successful compile and link.
mv "$build_cache/mastermind.wasm" "$base/../mastermind.wasm"
