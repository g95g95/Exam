# -*- coding: utf-8 -*-
"""
Created on Wed Oct 30 17:12:33 2019
@author: Giulio
"""


import numpy as np
import random as rd
#from string import lower
import pandas as pd
import math
#Results2018={'Movimento 5 stelle':0.327,'Centrosinistra':0.22,'Centrodestra':0.37,'LeU':0.03}
#ResultsHyp1 ={'Movimento 5 stelle':0.18,'Centrosinistra':0.20,'Lega':0.35,'Centrodestra':0.15}
#ResultsHyp2 ={'Centrosinistra':0.38,'Centrodestra':0.52}
#Seats2018  ={'Movimento 5 stelle':221,'Centrosinistra':109,'Centrodestra':260,'LeU':22} #excluding abroad seats

class Montecarlo_electoral:
	 
	
	def __init__ (self,chooseinput = 'stinput'):
		
		self.chooseinput = chooseinput.lower()
		self.Results     = {}
		self.checkValue  		 = True
		self.checkalpha 		 = True
		self.checksingpercentage = True
		self.checktotpercentage  = True
		self.checkinput          = True
		
		if self.chooseinput not in set(['stinput','excel','txt']):
			self.checkinput = False
			raise ValueError ("You didn't insert the right input\n",self.chooseinput," is not a right input")
		
	def Import_Results(self):
	
		if self.chooseinput == 'stinput':
			
			self.Npart     = int (input("Enter the number of parties\n"))
			self.Parties   = [input('Enter the name of the party number '+str(i+1)+'\n') for i in range(self.Npart)]
			self.Propval   = [float(input('Enter the general results of  '+str(Party)+'\t')) for Party in self.Parties]
			self.Propcoef  = float(input('Enter the value of the proportional coefficient\n'))
			self.Majorcoef = float(input('Enter the value of the majority coefficient\n'))
			self.Results   = dict([(self.Parties[i],self.Propval[i]) for i in range(self.Npart)])
			
		if self.chooseinput == 'excel':
			
			filename       = input("Enter the name of the file\n")	
			xls            = pd.read_excel(filename)
			
			self.Parties   = list(xls.columns)
			self.Propval   = list(xls[Party][0] for Party in self.Parties)
			self.Propcoeff = list([xls[Party][1] for Party in self.Parties])[:2]
			self.Majorcoeff= list([xls[Party][2] for Party in self.Parties])[:2]
			self.Results   = dict([(self.Parties[i],self.Propval[i]) for i in range(len(self.Parties))])
		
		if self.chooseinput == 'txt':
			
			filename       = input("Enter the name of the file\n")
			file           = [line.strip() for line in open(filename)]
			self.Nparty    = len(file[0].split('\t'))
			self.Parties   = file[0].split('\t')
			self.Propval   = file[1].split('\t')
			self.Propcoef  = float(file[2].split('\t')[1])
			self.Majorcoef = float(file[3].split('\t')[1])
			self.Results   = dict([(self.Parties[i],self.Propval[i]) for i in range(self.Nparty)])
		

				 
	def check_input(self) :
			
		for i in self.Parties:
			if  math.isnan(i) or not i.islpha():
				self.checaValue = False
				raise ValueError('die Name den Parteien du hast eingefügt ist nicht richtig')
		
		
		
		for i in self.Propval:
			if math.isnan(i):
				self.checkValue = False
				raise ValueError('The value you have inserted is not a number\n')
			
			if i.isalpha():
				self.checkalpha = False
				raise ValueError('There are letters in your Results!\n')
			
			if i>1:
				self.checksingpercentage = False
				raise ValueError('The value you have inserted is larger than one! Unwirklich!\n')
			
		
				
		if(sum(self.Propval))>1:
			self.checktotpercentage = False
			raise Exception('The sum of the results cannot be larger than one!!! You made a mistake')
			
		
	
	

			   
					   
				   
		
#m = Montecarlo_electoral('excel')
#m.Import_Results()		
	
    






"""
def max_key(d):#this method returns the key with the highest value of a dictionary
    max_key = ''
    max_value = 0
    for key in list(d.keys()):
        if d[key]>max_value:
            max_key = key
            max_value = d[key]
        elif d[key] == max_value:
            max_key = rd.choice([key,max_key])
    return max_key    
        

        
def Fill_Seats(N,Results,weight_maj,weight_prop): 
	#This method runs the Montecarlo's algorythm for each collegium. It can be
	#performed using different weights according to the electoral law we are considering
	seats = {key:int(Results[key]*N*weight_prop)+int(Results[key]*(1-sum(list(Results.values())))) for key in list(Results.keys())}
	for i in range (int(N*weight_maj)):
		Resultscopy = Results.copy()
		Resultscopy = {key:Results[key]*np.random.rand() for key in Results.keys()}#this is the core of the program
		seats[max_key(Resultscopy)]+=1
	return seats

def Complete_Simulation(N,Results,weight_maj,weight_prop):
	seats = {key:0 for key in list(Results)}
	#This function provides a valid estimation for the assigned number of seats
	#by averaging over 10000 simulation. This result will be used for confrontation
	with real data
	for i in range(10000):
		for key in list(Results):
			seats[key]+=Fill_Seats(N,Results,weight_maj,weight_prop)[key]
	average_seats = {key:int(seats[key]/10000.) for key in list(Results.keys()) }
	return average_seats

def winning_min_seats(Party,min_seats,Results):
	wins = 0
	#This method returns how many times a certain party can obtain more than
   # a specified number of seats
	for i in range(10000):
		current_situation = Fill_Seats(0.61,0.37,Results)
		if (current_situation[Party]>min_seats):
			wins +=1
			print(Party,"got",current_situation[Party],"seats")
	return wins
    

def Possible_Results(N,Results,weight_maj,weight_prop,Iterations):
	#This function returns a dicionary having the parties has keys and each value
	#is a list of all the results obtained all over an N iteration of Fill_Seats()
	possible_results = {key:[Fill_Seats(N,Results,weight_maj,weight_prop)[key]for i in range(Iterations)]for key in list(Results)}
	return possible_results

"""