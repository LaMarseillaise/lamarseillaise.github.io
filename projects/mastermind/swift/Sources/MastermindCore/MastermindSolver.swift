// Adapted from Andur Carr's Code.swift and Knuth.swift. See ../README.md.
// No UI, Foundation, JavaScript, or platform-specific dependencies.
// One solver instance owns one history. Use it from a single executor.
public final class MastermindSolver {
    public static let codeCount = 1296
    private let scores: [UInt8]
    private var candidates: [Int] = Array(0..<1296)
    private var turns = 0
    private var solved = false
    public private(set) var worstCase = 0
    public var remaining: Int { candidates.count }

    public init() {
        let codes = (0..<1296).map { Self.digits($0) }
        let counts = codes.map { code in
            var counts = [Int](repeating: 0, count: 6)
            for color in code { counts[color] += 1 }
            return counts
        }
        var table = [UInt8](repeating: 0, count: 1296 * 1296)
        for a in 0..<1296 {
            for b in 0...a {
                var exact = 0, common = 0
                for p in 0..<4 { if codes[a][p] == codes[b][p] { exact += 1 } }
                for c in 0..<6 { common += min(counts[a][c], counts[b][c]) }
                let score = UInt8(exact * 5 + common - exact)
                table[a * 1296 + b] = score
                table[b * 1296 + a] = score
            }
        }
        scores = table
    }

    public static func digits(_ code: Int) -> [Int] {
        [code / 216, (code / 36) % 6, (code / 6) % 6, code % 6]
    }

    public func reset() {
        candidates = Array(0..<1296); turns = 0; solved = false; worstCase = 0
    }

    // -1 invalid input; -2 contradictory history; -3 solved; -4 turn limit.
    // Rejected observations never change the candidate set or turn count.
    public func observe(guess: Int, exact: Int, partial: Int) -> Int {
        guard (0..<1296).contains(guess), (0...4).contains(exact),
              (0...4).contains(partial), exact + partial <= 4 else { return -1 }
        guard !solved else { return -3 }
        guard turns < 12 else { return -4 }
        let target = UInt8(exact * 5 + partial)
        let next = candidates.filter { scores[guess * 1296 + $0] == target }
        guard !next.isEmpty else { return -2 }
        candidates = next; turns += 1; solved = exact == 4; worstCase = 0
        return candidates.count
    }

    public func score(secret: Int, guess: Int) -> Int {
        guard (0..<1296).contains(secret), (0..<1296).contains(guess) else { return -1 }
        return Int(scores[secret * 1296 + guess])
    }

    public func nextGuess() -> Int {
        guard !solved else { return -3 }
        guard turns < 12 else { return -4 }
        if turns == 0 { worstCase = 256; return 7 } // 0, 0, 1, 1
        if candidates.count == 1 { worstCase = 1; return candidates[0] }
        var possible = [Bool](repeating: false, count: 1296)
        for candidate in candidates { possible[candidate] = true }
        var best = -1, smallestWorst = Int.max
        for guess in 0..<1296 {
            var buckets = [Int](repeating: 0, count: 21)
            var worst = 0
            for candidate in candidates {
                let score = Int(scores[guess * 1296 + candidate])
                buckets[score] += 1; worst = max(worst, buckets[score])
                if worst > smallestWorst { break }
            }
            if worst < smallestWorst || (worst == smallestWorst && possible[guess] && !possible[best]) {
                best = guess; smallestWorst = worst
            }
        }
        worstCase = smallestWorst
        return best
    }
}
