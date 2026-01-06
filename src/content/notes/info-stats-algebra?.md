---
title: info-stats-algebra?
draft: true
---

this sparked by reading about Warren Sturgis McCulloch's *How we know universals*

two approaches to "how we know universals":
- computing invariant (i.e. average over symmetry group, reynolds operator)
	- additional question here: what's the group?
- compression = classification. a model can compress away all information unnecessary for distinguishing between set of classes. 
	- additional question here: what classes?

distinction of purpose. info theoretic approach bargains that essence depends on task (i.e. there *is* a particular lossy channel). 

**rate-distortion theory**
the problem of determining the minimal number of bits per symbol, as measured by the rate $R$ that should be communicated over a channel, so that the source can be approximately reconstructed at the receiver without exceeding an expected distortion D.

why is *rate* relevant here? the original question was over a channel, so asking about rate was asking "how much information am i getting per bit received", i.e. bits per second. 


compression = classification =? transmission

the functions that relate the rate and distortion are found as the solution of:
$$
\min_{Q_{Y|X}(y|x)} I_Q(Y;X) \text{ subject to } D_Q \leq D^*
$$
(minimize the mutual information between Y and X under distribution Q)
we're minimizing over $Q_{Y|X}(y|x)$, the conditional dist (encoder), sometimes called the test channel, that maps input X to representation Y. remember, mutual info defined as:
$$
I(Y;X) = H(Y) - H(Y|X)
$$
note:
- if there is no communication at all $H(Y|X) = H(Y) = 0$ 
- if there is perfect channel $H(Y|X) = 0$ and $H(Y) = H(X) = I(Y;X)$
	- no "surprise" learning Y if you already know X

its not easy to find analytical solutions to this minimization problem. but there are bounds, famously the **shannon lower bound**:
$$
R(D) \geq h(X) - h(D)
$$
where $h(D)$ is the differential entropy of a Gaussian random var with variance D.

"every good regulator of a system must be a model of that system" - W. Ross Ashby
under general conditions, the entropy of variation of output of controlled system is minimized when there is a (deterministic) mapping $h: S \rightarrow R$ from states of the system to states of the regulator. 

as john baez put it "every good key must be a model of the lock it opens".
self-referential example: the regulator is some organism, system is the world it lives in, including *itself*. then it would follow that the regulator should include a model of *itself*. 

lets look at baez's take on this theorem. let $R$ and $S$ be finite sets, and fix a probability distribution $p$ on $S$. Suppose $q$ is any probability distribution on $R \times S$ such that
$$
p(s) = \sum_{r \in R} q(r,s) \text{ for all } s \in S
$$
with this, we have $H(q) \geq H(p)$, with equality if there is a function $h: S \rightarrow R$ such that
$$
q(r,s) = \begin{cases}
p(s) & \text{if } r = h(s) \\
0 & \text{otherwise}
\end{cases}
$$
Ashby-Conant consider five sets and 3 functions:
![[Pasted image 20250920024640.png]]
- $Z$ is set of events that may occur, the regulated and unregulated
- $G \subseteq Z$ a subset of good events
- $D$ set of primary disturbers that, by causing the events in system $S$, drive the outcomes out of $G$ 
- $S$ set of states of system affected by $D$
- $R$ set of events in the regulator, also affected by $D$
- $\phi: D \rightarrow S$ saying how a disturbance determines a state of the system
- $\rho: D \rightarrow R$ saying how a disturbance determines a state of the regulator
- $\psi : S \times R \rightarrow Z$ saying how state of system and state of regulator determines an outcome
(baez) 
we want the outcome to be good regardless of disturbance (?)
i.e. for every $d \in D$, we have $\psi(\phi(d), \rho(d)) \in G$ 

(conant and ashby)
"R is a good regulator" is equivalent to $\rho \subset [\psi^{-1}(G)]\phi$
$\psi^{-1}(G) = \{r \in R : \psi(r) \in G \}$, i.e. set of regulator actions that lead to good outcomes?
then we use a strange composition notation to get a relation $D \rightarrow R$ where
- for each disturbance $d \in D$ we get state $s = \phi(d)$ 
- then we need $r \in R$ such that, when applied to $s$, we get outcome $\psi(s, r) \in G$
so i guess we $\psi$ has two domains? this notation is bad...

anyways, we are looking for a regulator that takes disturbances and makes them good outcomes in the context of the system state. 

then to ensure that $\rho$ is an actual mapping and not empty, $\rho \rho^{-1} \subset 1 \subset \rho^{-1} \rho$ 
![[Pasted image 20250920030828.png]]
ha! they even acknowledge their weird abuse and inconsistency of notation.

i guess conant-ashby puts more emphasis on how the regulator is central to the problem.
anyways, they say that the state of the regulator depends on the state of the system via a conditional distribution $p(r|s)$. 
now $p(S)$ and $p(R|S)$ jointly determine $p(R,S)$ and hence $p(Z)$ and $H(Z)$, the entropy in the set of outcomes. 
$$
H(Z) = -\sum_{z \in Z} p(z)\log(p(z))
$$
with $p(S)$ fixed, the class of optimal regulators therefore corresponds to the class of optimal distributions $p(R|S)$ for which $H(Z)$ is minimal. they call this class of optimal dists $\pi$ 

baez says:
"i believe the claim is that when entropy is minimized there's a function $h: R \rightarrow S$ such that $p(r|s) = 1$ if $r = h(s)$"

![[Pasted image 20250920164238.png]]
ashby's *homeostat*. 

![[Pasted image 20250920033405.png]]


something to explore, ideally in the least hand-wavey inflated manner, and with deference to technical rigor, mathematical humility:

at one point does compression give a "scientific" model? and first of all, can any compression necessarily become a "scientific" model?

something saussure had convictions about was that sequences of absence/presence (syntax) informs the semantics of a language, an explanation for how on a purely digital + statistical basis, a vector embedding model can learn "king - man + woman = queen". and this idea that change, the pattern of on/off in a sequence, morphisms, etc. are the fundament of objects, categories, whatnot. it feels like a triviality honestly. but it is a strong claim that syntax completely captures semantics. and there is a sense in which the radical progression on this is that purely from this kind of syntactic grokking or compression, a system can develop an explainable/interpretable process for its outputs. 

maybe there are two separate problems:
- universal representation vs classification/compression in set state space
- semantics thru syntax vs interpretable knowledge

largely ignorant on field of mechanistic interpretability, but it seems that the assumption in that field is that these models *can* be interpreted in the first place, which i dont think is a trivial assumption. its not like you get much more once you know that, at least at first glance. but i think its worth examining with some rigor. 

at the end of a paper discussing this kind of thing, the author wrote:
"We have established that semantic meaning is a product of writing and that a
computational system that approximates the behavior of signs in writing aligns
with the post-structuralist notion of meaning. However, we are left to question
the boundaries of this modeled semantic meaning concerning concepts such as
“knowledge” and “truth”, which lie beyond the scope of deeper exploration in
this paper."

i always like when hamilton morris defers to the claim that a certain crack-pot idea he is discussing is "not useful". for a cybernetic system, truth might be the criteria for successful intervention, and down the hierarchy knowledge is compressed regularities, meaning is differential play of signs. then the catholic says God is the regulator.

![[Pasted image 20250921161606.png]]

its my hunch that language and experience are intimately connected. thinking and language is a different question. i recall finding julian jaynes' description of thinking as an automatic process, that is only made to feel intentional in retrospect when in a state of self-consciousness. does thinking take place in language? i know that i am not always doing a monologue when thinking through something, but that does not make it separate from language. the unconscious is structured like a language might be the relevant axiom here. separate point of departure, is "the unconscious is structured like a language" and "language is what shapes conscious experience" the same statement? 

distinguish spoken language like English from unconscious language with undefined form. should interrogate lacan's writing on the topic.