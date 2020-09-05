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


# How to utilize the program

* The procedure we follow to execute the program is rather simple. in [Main_electoral.py](https://github.com/g95g95/Exam) we initialize an object of the class Montecarlo_electoral.

* Then we harvest the data we need through the methods **import_as_excel** and **import_as_txt** 


# Structure of the Repository

In the file [Electoral_Montecarlo.py](https://github.com/g95g95/Exam) a class *Montecarlo_electoral is defined*. All the methods that will be used in [Main_electoral.py](https://github.com/g95g95/Exam) are contained within it.

The program also have a pytest routine [testing_electoral.py](https://github.com/g95g95/Exam) where all the methods are tested.

* We start with the definition of the function *max_key* which, given a dictionary as argument, returns a list of the keys with the highest value (for the purposes of this code this list will only contain one element).

* Class ***Montecarlo_electoral*** begins with the definition of the constructor of our class that takes one default argument, i.e. the name of the electoral contest we are going to simulate and will come useful for the graphic part. Diferent variables of the class are defined. In particular we set the number of Deputies and the major and proportional coefficients as the italian ones, but they will change as soon as we import results from different source.

* **import_as_txt()** and **import_as_excel** provide that. Through these method we acquire the values for the main parameters we are interested at, i.e. the name of the parties and their Results in the elections (or in polls) respectively from a txt file or from an excel file. An example of how the files must be shaped is given in [Test](https://github.com/g95g95/Exam) in which a test.xls and test.txt files are present.
Eventually we put together the parties' names and their results in a dictionary called **Results** and that will play a key role in the algorithm.

* **check_input()** is an important method because it checks if the values we have imported are consistent. In particular errors will be raised if two or more parties share the same name, if the some of the results is larger than 1, and if the sum of the proportional coefficients and the majoritary one is larger than one.

* The **method fill_seats()** is actually the core of the program since the algorithm discussed above is within it. Starting from our **Results** vocabulary, at first we assign the seats corresponding to the proportional part and then we run a for cycle over all electoral collegia to assign the others, through the Montecarlo method I have explained above. Eventually this method returns a dictionary with the name of the parties as keys and the number of Seats achieved in a simulation.
This method is checked in the pytest routine verifying its validity for every number of deputates and every combination of proportional and majoritary coefficients.

* Since we are dealing with a stocastic processes, we want to eliminate aleatority and we can do that by performing many times (1000) Fill_Seats(). That is done through **complete_simulation()** which eventually returns a dictionary of the same shape of **fill_seats()** but this times the values of the Seats have been mediated and so we expect the result to be closer to the true Result.
This method also fills the class parameter **allResults** which is a dictionary with keys displayed by the name of each party and values as a list of the different values the party has achieved 
It was asked a 5% discrepancy between real and simulated data and the test with 2018 italian general elections was passed.

* Let's now take a glance at the graphic part that is useful to graphically visualize our Results. It takes place through the method **graphic** that has 1 argument set an empty dictionary by default named "real" and an argument which will have to be the dictionary of our complete simulation. This method returns a histogram with just the simulated data if real is not given or with both simulated data and real data when real is provided.
This method also draws a second histogram by exploiting the parameter **allResults** I have described above. So this second histogram will be a collection of the results for the different parties all over the simulations.
This graph can actually be useful to evaluate the oscillations of the parties and to evaluate all possible oscillations duringa  general elections.
This method ends with the histograms being saved in the folder [Graphics](https://github.com/g95g95/Exam)














