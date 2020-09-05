# -*- coding: utf-8 -*-
"""
Created on Fri Nov 15 23:30:13 2019
@author: Giulio
"""

from Electoral_Montecarlo import Montecarlo_electoral



Seats2018  ={'M5S':221,'Csx':109,'Cdx':260,'LeU':22} #Examples for the graphic part


m = Montecarlo_electoral()#Initializing an object of the class

m.import_as_txt() # Filling the parameters of the class

m.check_import() #Interpreting correctly the parameter of the class

CS  = m.complete_simulation() #I can roughly see what happens at the end of the simulation in the stoutput

f = open('Results/'+m.election+'.txt','w')
print('Simulated Seats of '+m.election,file = f)

for i in list(CS.keys()):
	print((i + '\t' + str(CS[i])),file = f) #Saving the results on the txt file.
f.close()

m.graphic(CS,Seats2018) #This is the graphic part. A proper argument is given as an example.


