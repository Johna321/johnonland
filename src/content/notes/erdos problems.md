---
title: erdos problems
draft: true
---


# erdos 324
does there exist a polynomial $f(x) \in \mathbb{Z}[ x ]$ such that all the sums $f(a) + f(b)$ with $a < b$ nonnegative integers are distinct?

![[Pasted image 20251222034021.png]]


## gpt
here's what [[chatgpt's thought process on erdos 334]] (without web search) was before "losing network connection" after 15m 22s

and here is [[chatgpt's references for erdos 324]]

## real-valued example
best result so far is [ruzsa2001](./ruzsa2001.pdf) where he proved existence of a real $\xi \in [0,1]$ for which the set
$$
\left\{ 
n^5 + \lfloor \xi n^4 \rfloor : n \geq n_0 
\right\}
$$
is a sidon set for suitable $n_0$



## erdos, turan 1941 
( pdf found [here](./erdos_1941-01.pdf) )

suppose $n$ is given and $a_x \leq n < a_{x+1}$ ; how large can $x$ be? i.e. how many terms not exceeding $n$ can a sidon set have?

set $x := \phi(n)$ and denote by $\Phi(n)$ the maximum of $\phi(n)$ or given $n$. sidon observed that $\Phi(n) > cn^{1/4}$. we'll now prove that 
$$
\Phi(n) > \left( \frac{1}{\sqrt{2}} - \epsilon \right) \sqrt{n}
$$
for any positive $\epsilon$ and all $n > n_0 (\epsilon)$. 

it is clear that $\Phi(n) < \sqrt{2n} + 1$ 