---
title: "4. Experimentation Framework"
date: '2024-01-20'
---

### Running the model on GPU

Ok, we had left off with training the model on our small dataset of 100 games
for 10 epochs. It was taking ~1 min on my machine to run it. However I noticed
later that it was so slow because it was training on CPU!

To train it on the GPU, we only need a small change.

```diff
- chess_model = ChessModel()
+ # Transfer data to GPU if available
+ device = 'cuda' if torch.cuda.is_available() else 'cpu'
+ 
+ positions = positions.to(device)
+ valid_moves = valid_moves.to(device)
+ 
+ # Create the neural net
+ chess_model = ChessModel().to(device)
```

The `.to(device)` function transfers data to the GPU in pytorch and the whole
computation works on the GPU after that.

```
(torch) krkartikay@KartikayLegion:~/code/chess-sl$ time python train.py 
...
Epoch 10, Average Test Loss: 0.1468

real    0m6.975s
user    0m6.034s
sys     0m1.003s
```

Now it's only taking ~7sec to train the model. That's almost a 10x improvement!

However, an important point to be noted here is that this is working only
because our dataset is small enough to fit in the VRAM of the GPU in one go.
If the dataset did not fit in the VRAM either of two things would happen:

1. Either the CUDA drivers fail with an out of memory error! (best-case scenario), or,
2. The training keeps running using our RAM ('shared memory') instead, but runs much more
    slowly and without any warnings.

In the second case we might think everything is running fine but actually there
would be an issue, and everything might be *much* slower than it can be.
Unfortunately (2) is the default behaviour of the CUDA drivers these days, but
that can be changed in the settings (later...).

The proper solution would really be to stream the data to the GPU per-batch, or
possibly even stream the data from disk to RAM (and from RAM to GPU) in a
multithreaded dataloader, in case the dataset is big enough to not fit in RAM.

However let's implement that later and focus on experimenting with the network
for now.

### Optimising the network

We could now try out various things to optimise the network but keeping track of
how various hyperparams are affecting the quality of the network is hard if we
do it manually.

So we'll now develop a framework to keep track of the configs and run
experiments by changing them systematically and noting the results.

### Observations

The most important thing while doing experiments is to keep track of
observations!

There's a risk of overengineering this part... For instance there are entire
teams at google which handle metric collection and monitoring. But I'll try to
keep things simple here.

Let's create an observer class which we can call `observer.record(variable)` on.
It will help us record and store the data.

[observer.py](https://github.com/krkartikay/chess-sl/blob/main/observer.py):
```py
# Observation framework

import os
import csv
import pickle
from matplotlib import pyplot as plt

class Observer:
    def __init__(self, name, path="", suffix=""):
        self.name = name
        self.suffix = suffix
        self.fullname = os.path.join(
            path, name + (f"_{suffix}" if suffix else ""))
        self.observations = []

    def record(self, variable):
        self.observations.append(variable)

    def write_csv(self):
        filename = (f"{self.fullname}.csv")
        if len(self.observations) == 0:
            return
        with open(filename, "w") as file_handle:
            csv_writer = csv.writer(file_handle)
            csv_writer.writerows([x] for x in self.observations)

    def save_pkl(self):
        filename = (f"{self.fullname}.pkl")
        pickle.dump(self.observations, open(filename, "wb"))

    def plot(self):
        filename = (f"{self.fullname}.png")
        plt.figure()
        plt.plot(self.observations)
        plt.savefig(filename)

    def avg(self):
        return sum(self.observations) / len(self.observations)

```

To be honest it's nothing more than an array with some functions to save it,
plot it, etc.

Let's see if we can plot the training and test loss with it now. (I've modified
the code a little bit to handle calling `record` on tuples/lists, and also
increased the epochs to 50.)

Relevant part of `train.py` now:
```py
sgd_optimizer = SGD(chess_model.parameters(), lr=LEARNING_RATE)

loss_observer = Observer('loss', path="results/")

for epoch in range(NUM_EPOCHS):
    for batch_num, (train_positions, train_valid_moves) in enumerate(train_dataloader):
        sgd_optimizer.zero_grad()

        move_probs = chess_model(train_positions)
        loss = F.binary_cross_entropy(move_probs, train_valid_moves)

        loss.backward()
        sgd_optimizer.step()

        if batch_num % 10 == 0:
            print(f"{epoch+1}/{batch_num+1:3d}, Loss: {loss.item():.4f}")

    # Test Evaluation
    chess_model.eval()

    total_test_loss = 0
    with torch.no_grad():
        for test_positions, test_valid_moves in test_dataloader:
            test_move_probs = chess_model(test_positions)
            test_loss = F.binary_cross_entropy(
                test_move_probs, test_valid_moves)
            total_test_loss += test_loss.item()

    last_training_loss = loss.item()
    average_test_loss = total_test_loss / len(test_dataloader)
    loss_observer.record((last_training_loss, average_test_loss))
    print(f"Epoch {epoch+1}, Average Test Loss: {average_test_loss:.4f}")

loss_observer.plot(['train_loss', 'test_loss'])
loss_observer.write_csv()
```

Training Output:
```
(torch) krkartikay@KartikayLegion:~/code/chess-sl$ time python train.py 
Loading data...
Loaded data. Shape: 
positions : torch.Size([34879, 7, 8, 8])
moves     : torch.Size([34879, 4096])

1/  1, Loss: 0.6941
1/ 11, Loss: 0.6910
1/ 21, Loss: 0.6880
...
50/ 91, Loss: 0.1098
50/101, Loss: 0.1038
Epoch 50, Average Test Loss: 0.1048

real    0m23.212s
user    0m21.790s
sys     0m1.442
```

`results/loss.png` and `results/loss.csv` were created successfully.

`loss.png`: ![loss plot](/notes/loss-plot-1.png)

`loss.csv`:
```
train_loss,test_loss
0.6621306538581848,0.6606337598391941
0.6188064217567444,0.6185613402298519
0.557918906211853,0.5588848718575069
...
```

(Link to code so far at [commit `6407403`](https://github.com/krkartikay/chess-sl/tree/6407403ea4519041087cd44952b7f165de0917d4).)
