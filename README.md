# Montecarlo method for electoral laws
A good electoral law should be a decent balancement of both representivity and governability. The first principly leads to proportional laws, the second to majoritary law. So in the last year electoral laws mixing these two features were experimented all over european democracies.

Let's take into account the current italian eletcoral law and let's focus only on the election of "La Camera dei Deputati". There are 630  deputates in the small chamber. The 61% is elected in a proportional way (the party x gets N% votes, it gets 0.N*0.61*N_seats). The remaining 37% is elected through the collegia mechanism. This means the italian territory is split in 212 electoral collegia.

In each collegium different electoral coalitions (or single parties) fight to win that collegium. In fact, if X coalition/pary reaches the highest precentage in the land which represents the collegium it will take that seat in the Parliament.

The question rising up is the following: is it possible to foresee the assignment of the seats in the Parliament, only knowing the national results? The answer, as this program seems to prove, is yes.

The most obvious answer would be to assign the number of collegia according to the national results (X party gets N% votes, it will have N*0.37 seats in the Parliament).

This couldn't be further from the truth because if a party gets a score of 40% it is almost sure that it's going to win more than the 40% of collegia.

Immagine we have three main coalitions (A = 40%, B = 30%, C = 20%) and let's consider a single collegium. If we consider the reults as probability weight, we can consider to multiply every score to a random number between 0 and 1. Then, the seat will be obtained by the highest score vehiculated by a random number.

If we repeat this procedure over all the collegia, eventually we will map all the national territory and reproduce with decent accurancy the whole national territory.

Of course there are many flaws to this algorithm which is totally unable to foresee very localized electoral exploits of some regional parties. So if a party gets less than 1% on national scale and in a specific region with 3 collegia it has the 50% it will get 3 seats and no way to foresee that. (That is the case, for what concerns italian situation, of the SVP, the independent SudTirol Party).

Actually if we run very long simulations (milions and milions of iterations) a single anomalous result like that can be reproduced.

The algorithm might also be used to highlight some shortcoming of the specific electoral law we're dealing with. It migh happen (even if it sounds absurd) that two parties obtainin almost the same results on national scale will have a completely different assignment of seats and this algorithm can see to that


# Structure of the Repository

In the file [Electoral_Montecarlo.py](https://github.com/g95g95/Exam) a class *Montecarlo_electoral is defined*. All the methods that will be used in [Main_electoral.py](https://github.com/g95g95/Exam) are contained within it.

The program also have a pytest routine [testing_electoral.py](https://github.com/g95g95/Exam) where all the methods are tested.

* We start with the definition of the function *max_key* which, given a dictionary as argument, returns a list of the keys with the highest value (for the purposes of this code this list will only contain one element).

* Class *Montecarlo_electoral* begins with the definition of the constructor of our class that takes one default argument, i.e. the name of the electoral contest we are going to simulate and will come useful for the graphic part.
 
Different 

