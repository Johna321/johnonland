---
title: chatgpt's references for erdos 324
draft: true
---

You mean **Erdős #324** (not #334): “$∃$ nonconstant $f\in\mathbb Z[x]$ s.t. all $f(a)+f(b)$ with $0\le a<b$ are distinct?” (open). ([Erdős Problems][1])

Rephrase: $A={f(0),f(1),\dots}$ should be a **Sidon / $B_2$** set:
$$
f(a)+f(b)=f(c)+f(d)\ \Rightarrow\ {a,b}={c,d}.
$$
Equiv (often easier): **distinct differences** ($f(b)-f(a)$) for ($a<b$) (Golomb-ruler viewpoint). ([Renyi Users][2])

### What’s already known (so you don’t waste cycles)

* **deg 1,2 impossible** (quadratic ruled out via Erdős density-type obstruction; linear trivial). 
* **deg 3 impossible**: Dubickas–Novikas prove every cubic ($f\in\mathbb Z[x]$) has infinitely many nontrivial solutions to $f(m)+f(n)=f(r)+f(s)$ 
* **the “obvious candidate” ($f(x)=x^4$) fails** (nontrivial $A^4+B^4=C^4+D^4$, Swinnerton-Dyer 1968). 
* **$f(x)=x^5$** (and higher powers) is *plausible but open*: even the existence of **any** nontrivial integer solution to $a^5+b^5=c^5+d^5$ is unknown (a.k.a. generalized taxicab for 5th powers). ([Mathematics Stack Exchange][3])
* Near-miss: Ruzsa constructs an **“almost polynomial”** Sidon sequence like $n^5+\lfloor c n^4\rfloor$ with irrational $c$(so not an integer-coeff polynomial, but instructive). ([MathOverflow][4])

### A high-yield reading path (minimal background → right frontier)

**0) Definitions + first contact**

* Erdős–Turán classic paper introducing the $B_2$ lens + density bounds. ([Renyi Users][2])
* Fast intro notes w/ “Sidon = Golomb ruler” intuition: Apostolico et al. (Golomb rulers → Sidon sets chapter). 

**1) The map of the territory**

* **O’Bryant, “Complete annotated bibliography…”** = the index of essentially everything; also has sections explicitly on **Sidon subsets of squares / fifth powers** + open problems. ([arXiv][5])

**2) Core techniques for infinite Sidon sets (probabilistic / constructive)**

* Maldonado’s note spelling out (and simplifying) Ruzsa’s probabilistic construction ideas. ([arXiv][6])
  *Why you care:* the “avoid collisions by controlled perturbation” mindset is exactly what polynomial attempts mimic.

**3) The polynomial-specific frontier**

* Dubickas’ CANT abstract is a compact “state of play” for **polynomial Sidon sequences** (deg 1–4 obstructions, Ruzsa near-miss, cubic theorem). 
* Dubickas–Novikas (2021): **no cubic integer polynomial** can work (read for the style of constructing parametric collision families). ([Wiley Online Library][7])

**4) The “equal sums of like powers” rabbit hole (esp. for ($x^k$))**

* Lander–Parkin–Selfridge survey (1967) = classical compendium on equal sums of like powers (context for why (x^5) is singled out). ([DNB Portal][8])
* Swinnerton-Dyer 1968 (fourth powers): historical “why ($x^4$) dies”. ([DNB Portal][8])
* For the exact ($a^5+b^5=c^5+d^5$) status + refs: Math.SE literature-review thread; also modern summary in “Generalized Sidon sets of perfect powers”. ([Mathematics Stack Exchange][3])

**5) Useful generalization/weaponization**

* Nathanson (2022) “Sidon sets for linear forms”: reframes Sidon-ness as injectivity of a form; good for building the right mental API (representation functions, property N, perturbations). ([Theory of Numbers][9])

### Topics to learn (the “skill tree” that actually touches #324)

* **Sidon basics:** counting function $A(x)$, extremal size in $[1,n]$, Singer/Bose constructions, probabilistic constructions. (O’Bryant is your compass.) ([arXiv][5])
* **Collision equation geometry:** study integer points on
  $$
  f(a)+f(b)-f(c)-f(d)=0
  $$
  and/or differences $f(n+h)-f(n)$. For deg $d$, these are surfaces/curves of degree $\sim d$. (Think: when does algebraic structure *force* infinitely many integral points?)
* **Perturbation / diophantine approximation tricks:** why irrational “(c)” breaks additive structure in Ruzsa’s near-polynomial sequence; what it would take to “arithmetize” that into $\mathbb Z[x]$. ([MathOverflow][4])
* **Perfect powers as test cases:** $n^k$ Sidon ⇔ forbid nontrivial $a^k+b^k=c^k+d^k$. Fifth powers are the first plausible “no known counterexample” regime. ([Springer][10])

### A concrete “entry project” (good first attack surface)

1. Pick a candidate degree $d\ge 4$ (realistically $d\ge 5$ if you want to dodge known landmines). 
2. Work in the **difference formulation**: $D_h(n)=f(n+h)-f(n)$. Need global injectivity of the map $(n,h)\mapsto D_h(n)$.
3. For fixed small (h,k), analyze the Diophantine curve $D_h(n)=D_k(m)$. Try to prove it always has nontrivial integer points (⇒ obstruction), or engineer $f$ so every such curve has only trivial ones (⇒ construction path).
4. Benchmark everything against the monomial case $f(n)=n^5$: any progress here is automatically relevant to the “fifth powers Sidon?” subproblem. ([Springer][10])

Integrative punch: **learn Sidon sets via O’Bryant + Erdős–Turán; absorb Ruzsa perturbation ideology; internalize the deg≤3 obstruction proof style; then treat #324 as “kill all integer points on a family of collision curves” (esp. monomial $n^5$ first).**

[1]: https://www.erdosproblems.com/tags/number%20theory "
  
    Erdős Problems
  
"
[2]: https://users.renyi.hu/~p_erdos/1944-02.pdf?utm_source=chatgpt.com "[PDF] 208 A PROBLEM OF SIDON IN ADDITIVE NUMBER THEORY. ON A ..."
[3]: https://math.stackexchange.com/questions/3057348/literature-review-for-a5-b5-c5-d5?utm_source=chatgpt.com "diophantine equations - Literature Review for $a^5 + b^5 = ..."
[4]: https://mathoverflow.net/questions/460928/on-fifth-powers-forming-a-sidon-set "nt.number theory - On fifth powers forming a Sidon set - MathOverflow"
[5]: https://arxiv.org/pdf/math/0407117?utm_source=chatgpt.com "[PDF] A Complete Annotated Bibliography of Work Related to Sidon ... - arXiv"
[6]: https://arxiv.org/abs/1103.5732?utm_source=chatgpt.com "A remark of Ruzsa's construction of an infinite Sidon set"
[7]: https://onlinelibrary.wiley.com/doi/full/10.1002/mana.202000334?utm_source=chatgpt.com "No cubic integer polynomial generates a Sidon sequence"
[8]: https://d-nb.info/1274605555/34 "Generalized Sidon sets of perfect powers"
[9]: https://www.theoryofnumbers.com/melnathanson/pdfs/nath2022-200.pdf "Sidon sets for linear forms"
[10]: https://link.springer.com/article/10.1007/s11139-022-00622-z?utm_source=chatgpt.com "Generalized Sidon sets of perfect powers | The Ramanujan Journal"
