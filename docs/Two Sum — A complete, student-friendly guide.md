# **Two Sum — A complete, student-friendly guide**

[Two Sum — a complete, interview-friendly guide](https://docs.google.com/document/d/1n0zqYz3K3Vt8e1InX7o6Xulxk9EJhSoeTInZPDU4Eq4/edit?usp=sharing)

**Difficulty:** Easy  
**Topics:** Array, Hash Table  
**Goal:** Given an array `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. Exactly one solution exists; you may not use the same element twice.

---

# **Problem understanding (in simple terms)**

You are given a list of integers and a number `target`. Find two different elements in the list whose sum equals `target` and return their indices. Order of the two indices does not matter.

Key details to restate:

* Input: `nums` (array of integers), `target` (integer).  
* Output: a pair/array of two indices `[i, j]` such that `nums[i] + nums[j] == target`.  
* Guarantee: **exactly one valid answer exists** (so you can return the first correct pair you find).  
* You cannot use the same element twice (so `i != j`).  
* Constraints: `2 <= nums.length <= 10^4`, values up to ±10^9 — so be mindful of time complexity and integer ranges.

Why this matters: this problem tests recognizing patterns (complement lookup), choosing an appropriate data structure (hash table/ map), and understanding trade-offs between time and space.

---

# **Concept explanation — intuition & data structures**

Two natural ways to think about the problem:

1. Brute force: check every pair (i, j). This always works but is slow: O(n²).  
2. Use extra space to speed up lookup: for each number `x`, compute its complement `target - x` and ask, “have I already seen this complement?” — this suggests using a hash table (dictionary / map) for constant-time lookups.

Why hash tables? From the textbook excerpts: hash tables map keys to values and provide *average* O(1) time for lookups/insertions/deletions (assuming a good hash function and low collisions). That allows replacing an inner loop scan (O(n)) with a constant-time lookup, making the whole algorithm O(n).

Important idea: Instead of scanning the rest of the array to find complement for every `x`, maintain a map from value → index for values you've processed. As you iterate, check if complement already exists in the map.

Edge thought: because numbers can be negative and large, arithmetic is standard integer ops — languages with fixed-size integers may need care, but for typical contest ranges Python/C++ ints are safe.

---

# **Solution approaches**

## **1\) Brute force (explicit pairs)**

Algorithm:

* For every index `i` (0..n-2), for every index `j` (i+1..n-1), check if `nums[i] + nums[j] == target`.  
* If yes, return `[i, j]`.

Why it works: you examine all pairs; since exactly one solution exists, you'll find it.

Complexity:

* Time: O(n²) — nested loops.  
* Space: O(1) — only indices stored.

When it's acceptable: small arrays (n ≲ few thousands) or as a baseline to reason about correctness. But for upper bound n \= 10⁴, O(n²) \~ 10⁸ operations — borderline or slow in many environments.

### **Brute-force Python**

`def two_sum_bruteforce(nums, target):`  
    `n = len(nums)`  
    `for i in range(n):`  
        `for j in range(i+1, n):`  
            `if nums[i] + nums[j] == target:`  
                `return [i, j]`  
    `# problem guarantees a solution, but just in case:`  
    `raise ValueError("No two sum solution")`

Common mistakes with brute force:

* Using `range(n)` for both loops without `j > i` causing double-checks or picking same index twice.  
* Not considering negative numbers or repeated numbers — but brute force handles them.

---

## **2\) Hash table (one-pass) — optimal typical solution**

Key idea: As you iterate, store each number you've seen in a map `value -> index`. For current value `x = nums[i]`, compute `need = target - x`. If `need` is already in the map, you've found the pair: return `[map[need], i]`. Otherwise, add `x` to the map.

Why one-pass: You both check for complements and populate the map in the same loop, so you find the pair as soon as the second element of the pair appears.

Correctness proof sketch:

* Let the two indices that sum to `target` be `a` and `b` with `a < b`. When the loop reaches `b`, `nums[a]` has already been stored in the map, so `need = target - nums[b] == nums[a]` will be found and you return `[a, b]`.

Complexity:

* Time: O(n) average — each element leads to constant-time hash operations (lookup/insert).  
* Space: O(n) — storing up to n elements in the map.

Notes about worst-case hashing: adversarial collisions can degrade to O(n²) in some implementations, but mainstream language implementations (Python dict, Java HashMap) have mitigations and average O(1) is the right model for interview context.

### **One-pass Python (clean, production-ready)**

`def two_sum(nums, target):`  
    `# map from number -> index where it appears (the earliest index is fine)`  
    `seen = {}`  
    `for i, x in enumerate(nums):`  
        `need = target - x`  
        `if need in seen:`  
            `return [seen[need], i]`  
        `# store current number's index for possible future complements`  
        `seen[x] = i`  
    `raise ValueError("No two sum solution")`

Why store `seen[x] = i` *after* checking?  
Storing after ensures we don't pair the element with itself (we would otherwise find `need == x` and match the same index). Doing the check first ensures the earlier index is used for the complement.

Edge case: duplicates like `[3,3]` target `6`. When processing first `3` (`i=0`), `need=3` is not in `seen`, store `seen[3]=0`. When processing second `3` (`i=1`), `need=3` is in `seen` → return `[0,1]`. Works fine.

---

## **3\) Two-pass hash table (alternative)**

Make one pass to build the map value → index for *all* values, then a second pass to check for complements. This is slightly less elegant but valid.

Two-pass algorithm:

1. For each index `i`, put `nums[i]` → `i` into `map`.  
2. For each index `i`, compute `need = target - nums[i]`. If `need` in map and map\[need\] \!= i, return `[i, map[need]]`.

Complexity: still O(n) time and O(n) space, but requires two passes.

Why prefer one-pass? It returns earlier on average and is simpler to implement safely.

---

# **Implementation — commented Python example (one-pass)**

`def two_sum(nums, target):`  
    `"""`  
    `Returns a list [i, j] of indices such that nums[i] + nums[j] == target.`  
    `Assumes exactly one solution exists.`  
    `"""`  
    `# value -> index`  
    `seen = {}`  
    `for i, x in enumerate(nums):`  
        `need = target - x`  
        `# If the complement was already seen, return its index and current index`  
        `if need in seen:`  
            `return [seen[need], i]`  
        `# Otherwise record this number's index for future complements`  
        `seen[x] = i`

    `# According to the problem there is always exactly one answer,`  
    `# but in defensive programming we raise an error if none found.`  
    `raise ValueError("No two sum solution")`

---

# **Complexity analysis**

* **Brute force**  
  * Time: O(n²) — nested loops checking each pair.  
  * Space: O(1).  
* **Hash table (one-pass)**  
  * Time: O(n) average — each element causes one hash lookup and possibly one insert (constant-time on average).  
  * Space: O(n) — storing numbers and indices.  
* **Why O(n) is justified**: Hash table operations (lookup/insert) are average O(1). The textbook excerpt on hashing emphasizes that a good hash with proper collision handling yields expected constant time for these operations.

---

# **Edge cases & common mistakes**

Edge cases to consider (and how our solution handles them):

1. **Duplicate numbers** (e.g., `[3,3]`, `target=6`) — worked through example above.  
2. **Negative numbers** — complement computation `target - x` naturally handles negatives.  
3. **Zero values** — e.g., `[0,4,3,0]`, `target=0` — duplicates and zero handled as normal.  
4. **Very large/small integers** — within ±10⁹ fits typical integer ranges; languages with 32-bit ints are still safe here, but be mindful when dealing with extreme values in other contexts.  
5. **Exactly one solution guarantee** — simplifies logic; if this guarantee wasn't present, you'd potentially need to return all pairs or handle multiple solutions.  
6. **Using same index twice** — ensure you check `need in seen` before inserting current value (so `seen` contains earlier indices only).

Common bugs students make:

* Inserting the current number into the map *before* checking for its complement — this can lead to incorrectly using the same element twice if `need == x`. The standard fix is to check first, then insert.  
* Returning values instead of indices (or mixing up order).  
* Not handling duplicates: assuming values are unique.  
* Using a list `.index()` inside loops — this gives O(n²) behavior.  
* Forgetting to handle unexpected inputs (though the problem guarantee avoids some defensive checks).

---

# **Learning tips — what to take away**

1. **Pattern recognition**: two-sum is the canonical “complement \+ hash map” pattern. Recognize it — it reappears in many variations (k-sum, 3-sum, four-sum, etc.).  
2. **Hash tables are powerful**: they trade space for time — O(n) space reduces many search problems from O(n²) to O(n).  
3. **Order of operations matters**: when building maps while iterating, decide whether to check then insert or insert then check carefully to avoid self-matching bugs.  
4. **Practice variants**:  
   * Return all unique pairs (requires sorting or careful set usage).  
   * Sorted array version: two-pointer technique in O(n) time and O(1) space (but returns values, not indices).  
   * 3-Sum: combine two-sum logic with sorting and two pointers.  
5. **Similar problems to practice**:  
   * 3Sum, 4Sum (combinatorial sums)  
   * Two Sum II — Input array is sorted (two-pointer solution)  
   * Two Sum Less Than K (maximize sum \< K)  
   * Subarray sum equals k (use prefix-sum \+ hash map)  
6. **Explain your solution**: in interviews, describe brute force then optimize. Explain the hash table trade-off.

---

# **Variations & follow-ups**

* **Two Sum II (sorted input)**: If `nums` is sorted, you can use the two-pointer technique (left/right pointers moving inward) to get O(n) time and O(1) space — but that returns values or indices in the sorted array (careful mapping back to original indices).  
* **All pairs summing to target**: Return all distinct pairs — requires careful handling to avoid duplicates (use sets or sorting).  
* **K-sum family**: reduce k-sum to (k-1)-sum \+ two-sum or use meet-in-the-middle for larger k.

---

# **Final notes (quick checklist for interviews)**

* Start with brute force and explain why it’s O(n²).  
* Propose the hash-table optimization: O(n) time, O(n) space.  
* Explain the one-pass algorithm (check complement, then insert).  
* Discuss edge cases: duplicates, negatives, zeros.  
* Provide code that’s readable, with meaningful variable names and comments.  
* If asked about memory limits, discuss two-pointer sorted-array approach if the input is sorted or can be sorted with index tracking.

