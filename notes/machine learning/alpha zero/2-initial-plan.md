---
title: '2. Initial plan'
date: '2024-01-14'
---

## Initial Plan

Let's create a new repository... [done](https://github.com/krkartikay/chess-sl)!

Okay here's the plan. We'll start with doing supervised learning only.
That too on self-generated data. Once we have a neural net that has
at least learnt *the rules of chess* we'll go ahead and try reinforcement
learning using MCTS.

1. Create a new repository.
2. Install pytorch etc., whatever is required.
3. Create the most basic supervised learning model possible.
4. Create an experimentation framework.
5. Create a framework for visualisation of the model and data.

The real question is... How?

What do I mean by experimentation and observability framework?

A few ideas:

1. imagine I have a dashboard where I can adjust hyperparams, 
   click buttons to start/stop training runs, it shows graphs etc.
2. imagine I have a config file where I can specify a few
   different values of hyperparameters and the thing runs
   experiments in the background and stores the results
   in appropriate files (which we can compare in the above dashboard later)
3. imagine I have a tool to analyse the training data and the
   model's output distributions on an actual chessboard visualisation.
   Like drawing arrows on the chessboard, showing probs, etc.

From previous experience, it would be better to develop different tools in a modular way.

So we could go about it in this order:

1. Python framework to run the experiments and store results.
2. Dashboard to visualise results.
3. Dashboard to control hyperparams and run training scripts.
4. Dashboard for chess data and model analysis.

Once (1) is done, it would be much easier to develop the dashboards (2) and (3)!
We could use something standard like Sqlite for (1) and maybe flask or streamlit or something
for (2) and (3). (4) is a bit uncertain, but probably the best way to go about it
would be starting with llichess's chess board modules.


## Problem specification

There are some choices we need to make while modeling the problem itself.
What exactly is it that we're trying to do first?

I was trying last time to just get a neural net to *learn the rules of chess*,
that is, by being shown a lot of games, just predict which moves are allowed and which ones
are not.

I just realised last night that this task can become much more simpler for the neural net
depending on the action space encoding.

In particular what I was trying to do last time was to make the network predict the probability
distribution of valid moves, with the action space being `(from square, to square)`, that is,
`64*64` actions.

However I realised most of the neurons which would have to predict the probabilities
would ideally have to always output `0`. Why? Because for every `from square`, only certain
`to squares` could ever be valid moves.

In particular, for every `from` square we would have an upper bound of
`7(hz) + 7(vt) + 7(dg)(max) + 7(dg)(max) + 8(kn)(max) = 36` possible `to`
squares. That means the real size of the action space should be closer to
`36*64=2304` instead of `64*64=4096` (not considering underpromotions).

Also Leela Chess Zero has an action space size of `1858` which they say
they gather from an `73*8*8` matrix using a certain mapping. Where did
they get `1858` from!?

Anyway, back to the original question. Let's actually try to do the same thing as last time.
We'll predict the `64*64` probabilities for `(from square, to square)`.
(We'll ignore underpromotion for now).

(*note to myself: keep in mind bugs related to underpromotion and castling.)

This would be a real test of *generalisation*. Is our network able to learn
*the rules of chess* or does it simply memorise the training data?

### Output?

What should the model output?

Last time I used KL-divergence loss to make the net predict a probability distribution for
all the moves, but I wonder if a per-move probability is better. In one experiment I had
found that a per-move probability is probably much easier to train as there is no dependence on
other moves. However should it really be this way? TODO: think about this more later.

For now let's make it do the latter. That is, we will have 64*64 per-move probabilities.
(ideally many of which should always be 0 after training).

### Let's go!

Okay we're all set for now, LESGOOO!
