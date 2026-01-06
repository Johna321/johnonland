---
title: the agent who mistook his world for a lorenz attractor
draft: true
---


recently, i've been attempting to learn about Karl Friston's Active Inference, and the variational Bayesian mathematics associated with it. we'll motivate this framework through a weird but interesting example from Friston's 2009 paper *reinforcement learning or active inference?* 

let's say we have an agent living in some 3D space with a rubber-band pulling him toward the origin. the agent can act on his environment, and there are occasionally gusts of wind that push him in random directions. this agent has some sensory input by which he can measure his current position (with some additive noise). 

*brief aside on notation*: we will be using **bold** variable names for true environment variables. plain font will represent the agent's model. we'll also be using Newton notation for time derivatives so $\dot{x} = \frac{dx}{dt}$. 

this environment can be written as:
$$
\begin{align*}
&\mathbf{s} = \mathbf{x} + z \\
&\dot{\mathbf{x}} = -M\mathbf{x} + Ca + Bv + w \\
\end{align*}
$$
where we define our linear drift as the transformation on position:
$$
M = 
\begin{bmatrix} 
1 & -0.5 & -0.5 \\
0.5 & 1 & 0 \\
0 & 0 & 1 \\
\end{bmatrix}
$$
the agent's actions $a$ affect all 3 coordinates, and the gusts of wind only affect his $x_1$ coordinate, i.e.
$$
C = \mathbf{1}_{3\times1}\
B = \begin{bmatrix}1 \\ 0 \\ 0\end{bmatrix}
$$
and finally, we have some random additive noise $w$ on $\dot{\mathbf{x}}$. 

now, our agent will be imbued with its own model of the world, separate from the true environment. our agent's prior will be that the dynamics of his environment is that of a Lorenz attractor, i.e.
$$
\begin{align*}
&s = x + z \\
&\dot{x} = f(x) + w = 
\begin{bmatrix}
10(x_2 - x_1) \\ x_1(32 - x_3) - x_2 \\ x_1 x_2 - \frac{8}{3}x_3
\end{bmatrix} + w
\end{align*}
$$

in sum, we've got two stories running: **the true environment** (linear drift + actions + gusts) and **the agent's model of the environment** (lorenz attractor). the agent must *infer* the hidden state $x$ from sensations $s$ under noise, and may even desire to act on the environment (via the $a$ term in $\dot{\mathbf{x}}$). 

the agent needs a rule that maps a hypothesized state $x$ to a distribution of sensations $s$. in our room, the sensors read out state with additive noise, which we will model as gaussian. i.e.
$$
p(s|x) \sim N(s; g(x), \Sigma_z)
$$
where $g(x) = x$ as before. 

however, before even seeing this sensory input, the agent has a model of the dynamics. it expects derivatives of position to sit near its vector field $f(x)$ (here, lorenz). note: this is a prior over motion, not a measurement rule. we can model this as:
$$
p(\dot{x} | x) = N(\dot{x}; f(x), \Sigma_w)
$$
so the full generative story can be described under the joint distribution
$$
p(s, \dot{x}, x) = p(s|x)p(\dot{x}|x)p(x)
$$
the agent really wants to maximize the posterior distribution
$$
p(x|s) = \frac{p(s|x)p(x)}{p(s)}
$$
our main issue here is $p(s)$, called the *model evidence*, which has the form:
$$
p(s) = \int_x p(s,x)dx
$$
$p(s)$ is interpreted as how *good* a model is at explaining sensory input *s*, trading off how well the model fits the data vs the complexity of the model (i.e. how much surprise is minimized in general). model evidence is computationally intractable in nonlinear models such as our lorenz system. variational bayesian inference circumvents this by using an approximate posterior distribution $q(x)$ in place of our posterior:
$$
\log p(s) = \log \int q(x) \frac{p(s,x)}{q(x)} dx = \log \mathbb{E}_q \left[\frac{p(s,x)}{q(x)}\right] \geq \mathbb{E}_q \left[\log \frac{p(s,x)}{q(x)}\right] = \text{ELBO}[q]
$$
in other words we have
$$
\log p(s) = \text{ELBO} + D_{KL}(q(x) || p(x|s))
$$
where e




our agent's model supplies us with likelihoods and priors:
- likelihood: $p(s|x) \sim N(s; g(x), \Sigma_z)$ where $g(x) = x$. 
- prior on dynamics: $p(\dot{x} | x) \sim N(\dot{x}; f(x), \Sigma_w)$ where $f(x)$ is our Lorenz attractor from before
- hyperpriors (treat as known): $p(\Sigma_z)$ and $p(\Sigma_w)$ with precision $\Pi_z = \Sigma_z^{-1}$ etc. 

the *joint* distribution at a specific time step is
$$
p(s, \dot{x}, x) \propto p(s | x) p(\dot{x} | x) p(x)
$$
we want to find a form for the posterior and we want to be able to maximize it. 
$$
p(x | s) = \frac{p(s|x)p(x)}{p(s)} = \frac{\text{likelihood} \times \text{prior}}{\text{evidence}}
$$
we have access to our likelihoods and priors, but we do not have access to *model evidence* which is written as:
$$
p(s) = \int_x p(s,x) dx
$$
model evidence forms a bound on fit vs complexity. here is where variational bayes comes in. we posit a tractable form for the posterior distribution $q(x)$ and we seek to tighten the bound on fit vs complexity. 

 