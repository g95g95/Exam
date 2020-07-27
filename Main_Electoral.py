# -*- coding: utf-8 -*-
"""
Created on Fri Nov 15 23:30:13 2019
@author: Giulio
"""
import numpy as np
import Electoral_Montecarlo
import matplotlib.pylab as plt


Results2018={'Movimento 5 stelle':0.327,'Centrosinistra':0.22,'Centrodestra':0.37,'LeU':0.03}
Seats2018  ={'Movimento 5 stelle':221,'Centrosinistra':109,'Centrodestra':260,'LeU':22} #excluding abroad seats



data = (Electoral_Montecarlo.Complete_Simulation(635,Results2018,0.61,0.37))


bins = np.linspace(0,300,100)
"""
The section below will provide an histogram providing the confrantation between
real data and the results of the Simulation(data).
"""
plt.hist(data['Movimento 5 stelle'], bins, alpha=0.5, label='M5S-sim.')
plt.hist(data['Centrodestra'], bins, alpha=0.5, label='Cdx-sim.')
plt.hist(data['Centrosinistra'],bins,alpha= 0.5,label = 'Csx-sim.')
plt.hist(Electoral_Montecarlo.Seats2018['Movimento 5 stelle'],bins,alpha = 0.5,label ='M5sReal')
plt.hist(Electoral_Montecarlo.Seats2018['Centrodestra'],bins,alpha = 0.5,label ='CdxReal')
plt.hist(Electoral_Montecarlo.Seats2018['Centrosinistra'],bins,alpha = 0.5,label ='CsxReal')
plt.xlabel('Seats')
plt.legend(loc='upper left')
plt.savefig("Histogram-Confrontation.png")
plt.close()
"""The section below plots in an hystogram all the possible results for each party
in order to point out the possibility of akward results(the tail of distribution
of a party who got a lesser result than another party overlaps with that other party
tail's distribution.)"""
data = Electoral_Montecarlo.Possible_Results(10000)
plt.hist(data['Movimento 5 stelle'],bins,label = 'M5S')
plt.hist(data['Centrodestra'], bins, label='Cdx')
plt.hist(data['Centrosinistra'],bins,label = 'Csx')
plt.xlabel('Seats')
plt.legend(loc='upper left')
plt.savefig("Possible_outcome.png")
plt.close()
