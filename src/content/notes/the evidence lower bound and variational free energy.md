---
title: the evidence lower bound and variational free energy
draft: true
---

let's take a prototypical scenario in Bayesian inference. you have some data $\{x_i\}_{i=0}^N$  and you're seeking to fit some model, let's say a Gaussian, with parameters $\theta$ to it. so we have
$$
\text{posterior} = \frac{\text{likelihood}\times\text{prior}}{\text{evidence}}
\implies
p(\theta|x) = \frac{p(x|\theta)p(\theta)}{p(x)}
$$
we can compute our likelihood just fine. 
$$
p(x|\theta) = \prod_{i=0}^N p(x_i|\theta)
$$
and the priors are given by the generative model you start with. for example, maybe we think that the mean of the data has a sampling distribution centered at $\mu$ with variance $\sigma^2/\sqrt{n}$ and the variance of the data has a sampling distribution centered at $\sigma^2$ with variance $\frac{1}{\sigma^2}$. then $p(\theta) = p(\mu, \sigma^2)$ under the sampling distributions we just specified. 

the more difficult element to obtain is $p(x)$, often called the *model evidence* or *marginal likelihood*.  
$$
p(x) = \int_{\theta} p(x,\theta)d\theta
$$
computing directly would mean integrating over the entire parameter space, this is usually intractable. 

we can circumvent these difficulties with the following trick: introduce an *approximate posterior distribution* $q(\theta)$. we'll be trying to make sure that this approximation gets as accurate as possible to the true distribution. now notice that 
$$
\log p(x) = \log \int_\theta p(x, \theta) d\theta = \log \int_\theta q(\theta) \frac{p(x,\theta)}{q(\theta)}d\theta = \log \mathbb{E}_q\left[ \frac{p(x, \theta)}{q(\theta)} \right]
$$
now, using **jensen's inequality** and noting that logarithms are concave functions we observe:
$$
\log p(x) = \log \mathbb{E}_q\left[ \frac{p(x, \theta)}{q(\theta)} \right] \geq \mathbb{E}_q\left[\log \frac{p(x, \theta)}{q(\theta)} \right]
$$
there is our evidence lower bound (ELBO)! we define
$$
\text{ELBO}[q] = \mathbb{E}_q\left[\log \frac{p(x, \theta)}{q(\theta)} \right]
$$
and with some further derivations:
$$
\mathbb{E}_q\left[\log \frac{p(x, \theta)}{q(\theta)} \right] = \mathbb{E}_q\left[\log p(x) - \log \frac{q(\theta)}{p(\theta|x)}\right] =
\log p(x) - \int_\theta q(\theta) \log \frac{q(\theta)}{p(\theta|x)} d\theta
$$
here we introduce the Kullback-Leibler divergence:
$$
D_{KL}(P || Q) = \int_x P(x) \log\frac{P(x)}{Q(x)}dx
$$
which means that
$$
\text{ELBO}[q] = \log p(x) - D_{KL}\left[q(\theta) \ || \ p(\theta|x) \right]
$$
so, the more accurate our posterior approximation is, the higher our lower bound on model evidence is.

now, lets introduce *variational free energy* 
$$
F[q] = -\text{ELBO}[q] = -\mathbb{E}_q[\log \frac{p(x,\theta)}{q(\theta)}] = \mathbb{E}_q[-\log p(x, \theta)] - (-\mathbb{E}_q[\log q(\theta)]) = \mathbb{E}_q[-\log p(x, \theta)] - H[q]
$$
so we can analogize to something like helmholtz free energy where we have
$$
F = E - TS = \mathbb{E}_q[-\log p(x, \theta)] - H[q]
$$
so we treat expectation of negative log joint probability as energy.
