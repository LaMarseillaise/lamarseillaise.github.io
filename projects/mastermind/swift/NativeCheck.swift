@main struct Check {
    static func main() {
        let solver = MastermindSolver()
        precondition(solver.nextGuess() == 7)
        for secret in 0..<1296 {
            solver.reset()
            var count = 0
            while true {
                let guess = solver.nextGuess()
                precondition((0..<1296).contains(guess))
                let grade = solver.score(secret: secret, guess: guess)
                count += 1
                precondition(count <= 5)
                if grade == 20 { break }
                precondition(solver.observe(guess: guess, exact: grade / 5, partial: grade % 5) > 0)
            }
        }
        print("PASS: the same Swift core compiled natively and solved all 1,296 secrets within five guesses.")
    }
}
