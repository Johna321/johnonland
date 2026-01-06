---
title: math concepts
draft: true
---


a group $G$ is a monoid in which each $g \in G$ possesses an inverse $g^{-1} \in G$ satisfying
$$
g g^{-1} = g^{-1} g = e
$$

$S \subset G$ is set of *generators* if every element of $G$ expressible as a product of elements from S and their inverses (sets of generators not unique). 

the group is called *free* if it does not possess nontrivial relations.

*i.e.* there exists a set $S$ of generators such that *any element* of $G$ can be written in a unique way from S **besides** inserting trivial products of the form $g g^{-1}$ 

$G$ is *torsionfree* if 
$$
g^n \neq e \text{ for all } g \in G, n \in \mathbb{Z}, n\neq0
$$
free groups are torsionfree! if $g^n = e$ nontrivially, then $e$ can be expressed in more than one way as a product in $G$, and hence the same would hold for *any other element* e.g. 
$$
h = g^n h
$$

the smallest nontrivial group is 
$$
\mathbb{Z}_2 := (\{0, 1\}, +)
$$
with $0+0=1+1=0$ and $0+1=1+0=1$.

replacing with $\cdot$ we get a *monoid*
$$
M_2 := ( \{0, 1 \}, \cdot)
$$
with $0 \cdot 0 = 0 \cdot 1 = 1 \cdot 0 = 0$ and $1 \cdot 1 = 1$
(monoid because 0 has no inverse)


for $q \geq 2$ we can consider the *cyclic group* 
$$
\mathbb{Z}_q := ( \{ 0, 1, ..., q-1\}, +)
$$
where addition is defined *modulo $q$* 

equipping this set with *multiplication* modulo $q$ you obtain the **monoid** $M_q$, which is not a group.

$$
q \text{ is prime} \Leftrightarrow \mathbb{Z}_q \text{ has no nontrivial subgroups}
$$




