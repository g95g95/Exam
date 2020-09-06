# -*- coding: utf-8 -*-
"""
Created on Fri Nov 15 23:30:13 2019
@author: Giulio
"""

from Electoral_Montecarlo import Montecarlo_electoral


#Initializing an object of the class
m = Montecarlo_electoral()

# Filling the parameters of the class
m.import_as_txt()

#Interpreting correctly the parameter of the class
m.check_import() 

#I can roughly see what happens at the end of the simulation in the stoutput
CS  = m.complete_simulation() 

f = open('Results/'+m.election+'.txt','w')
print('Simulated Seats of '+m.election,file = f)

for i in list(CS.keys()):
	#Saving the results on the txt file.
	print((i + '\t' + str(CS[i])),file = f)
f.close()

#This is the graphic part.
m.graphic(CS) 


