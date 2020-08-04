# -*- coding: utf-8 -*-
"""
Created on Fri Nov 15 23:30:13 2019
@author: Giulio
"""
import numpy as np
from Electoral_Montecarlo import Montecarlo_electoral
import matplotlib.pylab as plt


Seats2018  ={'M5S':221,'Centrosinistra':109,'Centrodestra':260,'LeU':22} #excluding abroad seats


m = Montecarlo_electoral('txt','test.txt')
m.Import_Results()

m.check_input()
m.Complete_Simulation()
m.Graphics(Seats2018)













"""The section below plots in an hystogram all the possible results for each party
in order to point out the possibility of akward results(the tail of distribution
of a party who got a lesser result than another party overlaps with that other party
tail's distribution.)
data = Electoral_Montecarlo.Possible_Results(10000)
plt.hist(data['Movimento 5 stelle'],bins,label = 'M5S')
plt.hist(data['Centrodestra'], bins, label='Cdx')
plt.hist(data['Centrosinistra'],bins,label = 'Csx')
plt.xlabel('Seats')
plt.legend(loc='upper left')
plt.savefig("Possible_outcome.png")
plt.close()



m = Montecarlo_electoral('txt')
m.Import_Results()

m.check_input()
m.Complete_Simulation()
m.Graphics()"""