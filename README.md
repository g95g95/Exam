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


# How to use the repository

* First the user should open [Elections](https://github.com/g95g95/Exam) and modify one of the two files (an excel or a txt file) according to the elections he wants to simulate. One must fill each file with the results the Party/Coalition in recent polls of an upcoming election, pay attention at respecting the sintax of the files. Now they are set according to the *2018 italian general election*.

* Once the user has filled the files with the proper parameters, the simulation is ready to be launched. That can be done by simply running [Main_electoral.py](https://github.com/g95g95/Exam) in a Python environment.

* The results of the simulation will be stored in a txt file contained in [Results](https://github.com/g95g95/Exam). Histograms of the seats and of the values the coalition/Party reached all over the iterations of the simulation will be stored in [Graphic](https://github.com/g95g95/Exam).


# Structure of the Repository

* In the file [Electoral_Montecarlo.py](https://github.com/g95g95/Exam) a class *Montecarlo_electoral* is defined. All the methods that will be used in [Main_electoral.py](https://github.com/g95g95/Exam) are contained within it. The results of the simulation will be stored in the form of dictionaries. The methods also include a graphic method that will provide two histograms build upon such forementioned dictionaries.

* The program also has a pytest routine [testing_electoral.py](https://github.com/g95g95/Exam) where all the methods are tested, mainly using **assert**-like tests.

* In the folder [Results](https://github.com/g95g95/Exam), as the name suggests, the results of the simulation are stored. It is a *txt* file with the seats assigned to each party/Coalition according to the simulation.

* In the folder [Test](https://github.com/g95g95/Exam) there are two "test" files (*.txt* and *.xls* respectively) to test the efficiency of data acquiring in the pytest routine. Both files are presetted on 2018 Italian General Elections.

* [Main_electoral.py](https://github.com/g95g95/Exam) is the main of my program. At first it creates an object of the class *Montecarlo_electoral* through the constructor of the class. Then a method to fill the parameter we need for the simulation is executed. A method *check_import* is also called soon after. If the data we acquired are not consistent, i.e. two parties/coalitions with the same name, the sum of the proportional results larger than 1, the sum of the proportional and majoritary coefficient larger than 1, then ValueErrors will be raised.Then the method *Complete_Simulation* is executed and its results stored in [Results](https://github.com/g95g95/Exam) as mentioned above. Eventually we call for the execution of the graphic method *graphic* which takes a default argument, beside the result of our simulation, namely the assigned seats during a real election that can be used to make graphical comparison with our simulated seats. The main then ends with histograms being saved in the folder [Graphic](https://github.com/g95g95/Exam).

* In the folder [Graphic](https://github.com/g95g95/Exam), the histograms of the method graphic are stored. They're probably the fanciest way to show this kind of results. Here below I show an example of how the histogram confrontating our simulated results with real assigned seats looks like (always for 2018 Italian General Elections).

![2018IGE1](https://github.com/g95g95/Exam/blob/master/Graphic/Histogram-Confrontation_for_2018_Italian_General_elections.png)











