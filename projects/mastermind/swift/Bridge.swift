// Small integer ABI for the browser worker. The shared core has no Wasm imports.
private var solver: MastermindSolver?
@_cdecl("mm_init") public func initialize() { solver = MastermindSolver() }
@_cdecl("mm_reset") public func reset() { solver?.reset() }
@_cdecl("mm_observe") public func observe(_ guess: Int32, _ exact: Int32, _ partial: Int32) -> Int32 {
    Int32(solver?.observe(guess: Int(guess), exact: Int(exact), partial: Int(partial)) ?? -5)
}
@_cdecl("mm_next") public func next() -> Int32 { Int32(solver?.nextGuess() ?? -5) }
@_cdecl("mm_remaining") public func remaining() -> Int32 { Int32(solver?.remaining ?? -5) }
@_cdecl("mm_worst") public func worst() -> Int32 { Int32(solver?.worstCase ?? -5) }
@_cdecl("mm_score") public func score(_ secret: Int32, _ guess: Int32) -> Int32 {
    Int32(solver?.score(secret: Int(secret), guess: Int(guess)) ?? -5)
}
