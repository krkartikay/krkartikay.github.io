---
title: "3. Supervised Learning"
date: '2024-01-15'
---

### First update!

I've got supervised learning to kinda work!

I've been able to generate a dataset consisting of lots of random positions and
the allowed moves in all those positions. Then I've been able to read that data
and train neural networks on it which learn the rules of chess reasonably well.

I'm implementing it again (cleanly) [in this repo](https://github.com/krkartikay/chess-sl)
and also documenting whatever I'm doing here.

### Generating the dataset

First we will need to generate the dataset consisting of randomly generated
positions and the allowed move in each position. This can be done using the
`chess` python library.

[gen_moves.py](https://github.com/krkartikay/chess-sl/blob/main/gen_moves.py)

```py
import chess
import random

def generate_random_game():
    board = chess.Board()
    history = []
    while not board.is_game_over():
        # print(board)
        valid_moves = list(board.generate_legal_moves())
        # print(valid_moves)
        random_move = random.choice(valid_moves)
        history.append((board, valid_moves))
        board.push(random_move)
    return history
```

Then we need to store the generated data. Now we could serialise it into any
format. Games are generally stored in PGN format and we could find some format
for our moves too but since we're going to train neural networks using this data
so it may be best to convert these to tensors already and store them in a tensor
format.

So far the code is pretty fast, taking only ~2s to generate 100 games.

```
$ time python gen_moves.py 
Generating game 1.
Generating game 2.
Generating game 3.
...
Generating game 100.
Done! Generated 100 games!

real    0m2.396s
user    0m2.282s
sys     0m0.111s
```

### Converting to tensors

There are many possible ways we could do this, but I'm going to encode the 6
piece types (Pawn, Rook, Knight, etc.) into different planes into a tensor.
I'm going to use +1 for the white pieces and -1 for the black pieces.
I'm also going to add another plane which is entirely +1 or -1 denoting whose
turn it is currently.

This is what the starting board is supposed to look like, as a tensor (White = +1
Black = -1, Gray = 0).

![starting position tensor](/notes/start-position.png)

Here's the code:

[chess_utils.py](https://github.com/krkartikay/chess-sl/blob/main/chess_utils.py)

```py
import chess
import torch


def board_to_tensor(board: chess.Board) -> torch.Tensor:
    return_tensor = torch.zeros((7, 8, 8))
    # Iterate over the 6 piece types and add them to the appropriate plane
    # in the return tensor.
    for layer in range(1, 7):
        pt = chess.PieceType(layer)
        # add +1 for all the white pieces and -1 for black pieces
        bitboard_white = board.pieces_mask(pt, chess.WHITE)
        bitboard_black = board.pieces_mask(pt, chess.BLACK)
        for sq in chess.SQUARES:
            if bitboard_white & (1 << sq):
                row, col = divmod(sq, 8)
                return_tensor[layer, row, col] += 1
            if bitboard_black & (1 << sq):
                row, col = divmod(sq, 8)
                return_tensor[layer, row, col] -= 1
        # fill in the last layer according with +/- 1 based on whose turn it is
        if board.turn == chess.WHITE:
            return_tensor[0, :, :] += 1
        else:
            return_tensor[0, :, :] -= 1
    return return_tensor
```

Simply calling this function in `main()` on every position we have so far
increases the running time of the script to around ~5-6 seconds.

I'm also writing unit tests this time... it helped me catch a bug already!
(Do you see what was wrong in the code above? Hehe...)

[chess_utils_test.py](https://github.com/krkartikay/chess-sl/blob/main/chess_utils_test.py)

```py
import chess
import chess_utils


def test_board_to_tensor():
    board = chess.Board()
    tensor = chess_utils.board_to_tensor(board)
    print(tensor)

    # tensor has correct shape
    assert tensor.size() == (7, 8, 8)

    # first turn is white
    assert tensor[0, 0, 0] == 1

    # board has equal number of pieces at the start
    for i in range(1, 7):
        assert tensor[i].sum() == 0
```

```
$ pytest
=========================== test session starts ============================
platform linux -- Python 3.11.4, pytest-7.4.0, pluggy-1.0.0
rootdir: /home/krkartikay/code/chess-sl
plugins: hydra-core-1.3.2, anyio-3.7.1
collected 1 item                                                           

chess_utils_test.py F                                                [100%]

================================= FAILURES =================================
___________________________ test_board_to_tensor ___________________________

    def test_board_to_tensor():
        board = chess.Board()
        tensor = chess_utils.board_to_tensor(board)
    
        # tensor has correct shape
        assert tensor.size() == (7, 8, 8)
    
        # first turn is white
>       assert tensor[0, 0, 0] == 1
E       assert tensor(6.) == 1

chess_utils_test.py:13: AssertionError
========================= short test summary info ==========================
FAILED chess_utils_test.py::test_board_to_tensor - assert tensor(6.) == 1
============================ 1 failed in 0.76s =============================
```

### Encoding moves

Another big decision to make here is how to encode and decode the moves.
As I discussed last time, certain encodings make it easier or harder for the
neural net to learn.

For now I'm going to use a kind of `(from sq, to sq)` encoding.

Here are my conversion functions:

[chess_utils.py](https://github.com/krkartikay/chess-sl/blob/main/chess_utils.py)

```py
def move_to_action(move: chess.Move) -> int:
    a = move.from_square
    b = move.to_square
    idx = (a * 64) + b
    return idx


def action_to_move(action: int, board: chess.Board) -> chess.Move:
    a, b = divmod(action, 64)
    move = chess.Move(a, b)

    # check for possible promotion
    if (chess.square_rank(b) == (7 if board.turn == chess.WHITE else 0)
            and board.piece_type_at(a) == chess.PAWN):
        move = chess.Move(a, b, chess.QUEEN)

    return move
```

Tested these via round trip encoding-decoding unit tests. Promotion works but
only to queen. We're gonna be ignoring underpromotion for now. It'll complicate
the action space architecture.

Okay, now we just convert all the games to tensors and save them to a file.

```py
def convert_to_tensors(
        games: List[Tuple[chess.Board, List[chess.Move]]]) -> torch.Tensor:
    all_positions = []
    all_valid_moves = []
    for game in games:
        for position, valid_moves in game:
            board_tensor = board_to_tensor(position)
            moves_tensor = moves_to_tensor(valid_moves)
            all_positions.append(board_tensor)
            all_valid_moves.append(moves_tensor)
    positions = torch.stack(all_positions)
    valid_moves = torch.stack(all_valid_moves)
    return positions, valid_moves


def save_to_file(positions, moves, filename='games.pth'):
    with open(filename, 'wb') as datafile:
        torch.save({"positions": positions, "moves": moves}, datafile)
```

And it works.  (Link to code so far at [commit `d513564`](https://github.com/krkartikay/chess-sl/tree/d5135642685c8b43e4ebd000319a94206cee2771).)

```
$ time python gen_moves.py 
Generating game 1.
Generating game 2.
Generating game 3.
...
Generating game 100.
Done! Generated 100 games!
Converting data to tensors.
Saving to output file.

real    0m5.955s
user    0m5.743s
sys     0m0.190s
```

### Creating a neural net!

Let's start with the simplest possible network, that has inputs in the format
`7x8x8` and outputs move probabilities in a vector of size `64x64`.

We will have just one hidden layer of `N_HIDDEN` neurons in between the input and
output. The output will have a sigmoid activation applied on it, in order
to give us numbers between 0 and 1 which can be interpreted as probability
of a move.

(We're doing per move probability here. it is also possible to use softmax for
getting a probability distribution over all possible moves, but that makes the
learning harder. So just doing per-move probability for now.)


[model.py](https://github.com/krkartikay/chess-sl/blob/main/model.py)

```py
import torch
import torch.nn as nn
import torch.nn.functional as F

N_HIDDEN = 64*64


class ChessModel(nn.Module):
    def __init__(self):
        super(ChessModel, self).__init__()

        self.hidden_layer = nn.Linear(7*8*8, N_HIDDEN)
        self.output_layer = nn.Linear(N_HIDDEN, 64*64)

    def forward(self, x):
        # Flatten the tensor
        x = x.view(x.size(0), -1)
        # Apply hidden layer
        x = self.hidden_layer(x)
        x = F.relu(x)
        # Output layer
        x = self.output_layer(x)
        x = F.sigmoid(x)
        return x

```

### Training it!!!

The most interesting part. Let's now load the data and train the neural net.

[train.py](https://github.com/krkartikay/chess-sl/blob/main/train.py)

```py
import torch
import torch.nn.functional as F

from torch.utils.data import TensorDataset, DataLoader
from torch.optim import SGD

from model import ChessModel

BATCH_SIZE = 256
LEARNING_RATE = 0.1
NUM_EPOCHS = 10

print("Loading data...")

with open("games.pth", "rb") as datafile:
    data = torch.load(datafile)
    positions: torch.Tensor = data["positions"]
    valid_moves: torch.Tensor = data["moves"].float()

print("Loaded data. Shape: ")
print(f"positions : {positions.size()}")
print(f"moves     : {valid_moves.size()}")
print()

chess_model = ChessModel()

dataset = TensorDataset(positions, valid_moves)
dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

sgd_optimizer = SGD(chess_model.parameters(), lr=LEARNING_RATE)

for epochs in range(NUM_EPOCHS):
    for positions, valid_moves in dataloader:
        sgd_optimizer.zero_grad()

        move_probs = chess_model(positions)
        loss = F.binary_cross_entropy(move_probs, valid_moves)

        loss.backward()
        sgd_optimizer.step()
        print(f"Loss: {loss.item():.4f}")

```

After adding a [bit more code](https://github.com/krkartikay/chess-sl/blob/677fb0146be77a1cfc8ee06944189b79cae4c1ac/train.py)
for train-test dataset splitting and test evaluation, here is the output:

```
(torch) krkartikay@KartikayLegion:~/code/chess-sl$ time python train.py 
Loading data...
Loaded data. Shape: 
positions : torch.Size([34511, 7, 8, 8])
moves     : torch.Size([34511, 4096])

1/  1, Loss: 0.6942
1/ 11, Loss: 0.6911
1/ 21, Loss: 0.6879
1/ 31, Loss: 0.6850
1/ 41, Loss: 0.6817
1/ 51, Loss: 0.6790
1/ 61, Loss: 0.6754
1/ 71, Loss: 0.6724
1/ 81, Loss: 0.6695
1/ 91, Loss: 0.6660
1/101, Loss: 0.6633
Epoch 1, Average Test Loss: 0.6601
2/  1, Loss: 0.6604
2/ 11, Loss: 0.6562
2/ 21, Loss: 0.6543
...
9/ 41, Loss: 0.1734
9/ 51, Loss: 0.1760
9/ 61, Loss: 0.2043
9/ 71, Loss: 0.1695
9/ 81, Loss: 0.1865
9/ 91, Loss: 0.1619
9/101, Loss: 0.1730
Epoch 9, Average Test Loss: 0.1667
10/  1, Loss: 0.1516
10/ 11, Loss: 0.1593
10/ 21, Loss: 0.1572
10/ 31, Loss: 0.1499
10/ 41, Loss: 0.1623
10/ 51, Loss: 0.1674
10/ 61, Loss: 0.1790
10/ 71, Loss: 0.1567
10/ 81, Loss: 0.1516
10/ 91, Loss: 0.1464
10/101, Loss: 0.1492
Epoch 10, Average Test Loss: 0.1475

real    1m46.265s
user    12m57.450s
sys     0m40.758s
```

It runs in about one minute on my PC. It kinda works for now. The loss is
decreasing, we've gotten a test loss of ~0.14. There's a lot more stuff left to
do, for example:

- Plotting the training and validation loss curves.
- Evaluating the network by actually making it play chess.
- Trying out different hyperparams and optimizers.
- Optimising the network, decreasing the loss further.
- Trying convolutional networks.

(Link to code so far at [commit `677fb01`](https://github.com/krkartikay/chess-sl/tree/677fb0146be77a1cfc8ee06944189b79cae4c1ac).)

I've made some progress on it locally but I'll update it here later. Getting too
late now... see ya!
