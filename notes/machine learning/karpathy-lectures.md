---
title: "Andrey Karpathy's Lectures"
date: '2023-05-14'
---

Just finished watching Andrej Karpathy's Neural Networks: Zero to Hero series on Youtube.

First, before anything else, I'd like to say that Andrej Karpathy is an amazing person for uploading these lectures for all of us even though he must have a very busy life. I agree with him that AI can bring prosperity for all only if everyone understands AI and learn how to use it. I believe that power concentrated in the hands of a few will not be good for humanity and the best we can do right now is to try and distribute this power by learning ML, training our own models and doing more _Open_ research on AI. Andrej has really upheld his _dharma_ as a teacher by contributing this lecture series for all of us.

Having said that, just writing my own thoughts on the lectures:

1. **First lecture, Micrograd.** Interesting refresher on how backpropagation works along with practical implementation of how to write an autograd engine. Was probably worth watching, but probably not worth implementing (for me at least); since I think I already understood how backpropagation (in the autograd sense) works. I had "figured it out" in college one time. May have been tremendously useful for other people if they didn't understand backprop yet.

2. **Second lecture, Bigram model and a basic neural net.** Was probably worth watching to see how Andrej coded it and trained it. Intersting insights into his workflow.

3. **Third + Fourth lecture, MLP multi-char context model.** The model I already knew how to build, but *the way Andrej discussed how to train it, how to stabilise it with batchnorm, the initialisation and visualisations during backpropagation, all that was very valuable information*. (Especially all the info in the fourth lecture, that was completely new for me). Training neural nets is basically guesswork unless you know how to do this, and guesswork is how I used to do it earlier. No wonder I had given up on neural net related projects last time when I was trying to implement RL algorithms myself.

4. **Fifth lecture, Backpropagating manually.** We had been taught how to backprop manually in college, so while this lecture was a good exercise for the brain, but I don't think it was very valuable for me personally. Could have saved hours I spent on this. I'm not going to backprop through a batchnorm layer again in my life anyway! (so I hope... lol).

5. **Sixth lecture, Wavenet.** I'm not sure if I gained anything new from this lecture at all. Probably I may have missed something important (if there was anything at all) because I watched this lecture half-falling-asleep, but still I think doing RNN's instead of this could have been better.

6. **Seventh, last lecture, NanoGPT.** So basically Andrej walked us through implementing NanoGPT, starting from the bigram model. Up to the halfway mark, there's really nothing 'new'. So if you, like me, just wanted to understand how transformers work, you could skip to almost half-way into this lecture and get started from there.

He explained the attention mechanism in a really intuitive way, and since I am already familiar with the matrix math, I found it really easy to follow, but the way he explained it would have been easy enough to follow even if you haven't worked with matrices much (yet).

I had expected Andrej to explain a bit more about how to set up GPU training etc. but I think that was not interesting for him and he just skipped over all that with one line:

"...and I scaled up and trained this neural network which took about 15 minutes on my A100 GPU. I would not recommend training this network on a CPU or a macbook. You would have to reduce the number of layers, n_embd, and so on..."

However he did mention in the video description that the GPU he's using is from lambdalabs, again very valuable information.

> The GPU I'm training the model on is from Lambda GPU Cloud, I think the best and easiest way to spin up an on-demand GPU instance in the cloud that you can ssh to: https://lambdalabs.com . If you prefer to work in notebooks, I think the easiest path today is Google Colab.

An open question still remains in my mind though: *Was the A100 really required?* How would the training perform on a 1080Ti for example? Or on an Nvidia 3060 GPU? Would it take 15 minutes still, to achieve the same loss? or maybe 30 minutes, or 24 hours? If it does run on a normal GPU in a reasonable amount of time, then how would it do on a macbook with ANE acceleration turned on? What about inference??

Overall I think this whole series was really valuable (for the insights into his thinking and workflow), and I wish Andrej (and other people in the industry) would do more videos of this type.

However, what I found severely missing from this series, which I had hoped it would contain, was the evolution of RNNs and LSTMs and how we ultimately got to Transformers. Because that would show *all the ways that don't work*, not just the one thing that does work. (Which is, in my opinion, way more valuable). I think Andrej rushed to complete this lecture series with this one lecture, (he probably found something more important to do with his time at OpenAI?), because he did mention at the start that he would probably cover RNNs some day.

I would have to study that from somewhere else now, but anyways I'm thankful to even have gotten to study this much from Andrej.

---------------------------------------------------------------------------

Now, I realise, the hard part actually begins. Really understanding all of this, maybe implementing all this on my own, reading the research papers, experimenting, etc. etc...