---
title: '1. The Start'
date: '2024-01-14'
---

##  AlphaZeroPlusPlus

Objective: To train an RL system to play chess at ~1200 elo from scratch.

(How hard is it, really? Can it even be done on my home PC?)

Todo: Details and history.

## Previous attempts

Previous attempts failed because of:

- Trying RL even before SL
- Slow iteration speed
- No tracking of progress
- Not looking for help when stuck
- No experimentation framework
- No observability into the data/model
- Not being in a presentable state
- Trying a lot of things but not thinking mathematically
- No Unit Tests! (Or any tests at all!)

## New attempt

We're gonna start from scratch again.

This time we will:

- Optimise iteration time
    - Start with small neural nets for fast training
    - Optimise algorithm for execution speed
- Do SL before RL
- Track progress on this blog
- Look up books/articles/papers etc for help when stuck
- Develop an experimentation and observability framework
- Visualise the models and data at every step
- Spend some time making it presentable
- Thinking more analytically about the problem before experimenting with code
- Write unit tests!
