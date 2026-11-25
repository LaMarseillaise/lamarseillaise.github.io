export const samples = {
 javascript: {name:'JavaScript', runnable:true, note:'Native JavaScript · BigInt gives exact integers. Return fib(n); do not print it.', variants:{
 simple:`function fib(n) {
  if (n < 2) return BigInt(n);
  return fib(n - 1) + fib(n - 2);
}`,
 memo:`function fib(n, memo = new Map([[0, 0n], [1, 1n]])) {
  if (memo.has(n)) return memo.get(n);
  const value = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, value);
  return value;
}`,
 iterative:`function fib(n) {
  let a = 0n, b = 1n;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}`}},
 ruby: {name:'Ruby', runnable:true, note:'Ruby 4.0 / ruby.wasm · Integer grows as needed. Define fib(n); the runner calls it.', variants:{
 simple:`def fib(n)
  return n if n < 2
  fib(n - 1) + fib(n - 2)
end`,
 memo:`def fib(n, memo = {0 => 0, 1 => 1})
  memo[n] ||= fib(n - 1, memo) + fib(n - 2, memo)
end`,
 iterative:`def fib(n)
  a, b = 0, 1
  n.times { a, b = b, a + b }
  a
end`}},
 python: {name:'Python', runnable:true, note:'Python / Pyodide · int gives exact integers. Define fib(n); the runner calls it.', variants:{
 simple:`def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`,
 memo:`def fib(n, memo=None):
    if memo is None:
        memo = {0: 0, 1: 1}
    if n not in memo:
        memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]`,
 iterative:`def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`}},
 swift: {name:'Swift', note:'Reference source · UInt64 supports F(0)…F(93). No Swift compiler is loaded on this page.', source:`func fib(_ n: Int) -> UInt64 {
    precondition((0...93).contains(n))
    var memo: [Int: UInt64] = [0: 0, 1: 1]
    func solve(_ k: Int) -> UInt64 {
        if let value = memo[k] { return value }
        let value = solve(k - 1) + solve(k - 2)
        memo[k] = value
        return value
    }
    return solve(n)
}
print(fib(10)) // 55`},
 rust: {name:'Rust', note:'Reference source · u128 supports F(0)…F(186). No Rust compiler is loaded on this page.', source:`fn fib(n: usize) -> u128 {
    assert!(n <= 186);
    let mut memo = vec![None; n + 1];
    fn solve(n: usize, memo: &mut [Option<u128>]) -> u128 {
        if n < 2 { return n as u128; }
        if let Some(value) = memo[n] { return value; }
        let value = solve(n - 1, memo) + solve(n - 2, memo);
        memo[n] = Some(value);
        value
    }
    solve(n, &mut memo)
}
fn main() { println!("{}", fib(10)); } // 55`},
 csharp: {name:'C#', note:'Reference source · Adapted from my C-Sharp/Fibonacci.cs. BigInteger preserves exact results. No C# compiler is loaded.', source:`using System;
using System.Numerics;

static BigInteger NthFibonacci(int n)
{
    if (n < 0) throw new ArgumentOutOfRangeException(nameof(n));
    BigInteger[] memo = new BigInteger[n + 1];
    if (n > 0) memo[1] = 1;
    return Solve(n, memo);
}

static BigInteger Solve(int n, BigInteger[] memo)
{
    if (n < 2 || memo[n] > 0) return memo[n];
    memo[n] = Solve(n - 1, memo) + Solve(n - 2, memo);
    return memo[n];
}

Console.WriteLine(NthFibonacci(5));  // 5
Console.WriteLine(NthFibonacci(10)); // 55
Console.WriteLine(NthFibonacci(20)); // 6765`},
 go: {name:'Go', note:'Reference source · A closure shares the cache without default arguments. math/big gives exact integers. No Go compiler is loaded.', source:`package main

import (
    "fmt"
    "math/big"
)

func fib(n int) *big.Int {
    if n < 0 { panic("n must be nonnegative") }
    memo := map[int]*big.Int{0: big.NewInt(0), 1: big.NewInt(1)}
    var solve func(int) *big.Int
    solve = func(k int) *big.Int {
        if value, ok := memo[k]; ok { return value }
        // A fresh receiver avoids modifying cached integers.
        value := new(big.Int).Add(solve(k-1), solve(k-2))
        memo[k] = value
        return value
    }
    return new(big.Int).Set(solve(n))
}

func main() { fmt.Println(fib(10)) } // 55`}
};
