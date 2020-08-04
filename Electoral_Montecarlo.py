# -*- coding: utf-8 -*-
"""
Created on Wed Oct 30 17:12:33 2019
@author: Giulio
"""


import numpy as np
import random as rd
import pandas as pd
import math





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

class Montecarlo_electoral:
	 
	
	def __init__ (self,chooseinput = 'stinput'):
		
		self.Nedupties           = 0  
		self.chooseinput 		 = chooseinput.lower()
		self.Results      		 = {}
		self.Propval 			 = []
		self.Parties             = []
		self.Majorcoef           = []
		self.Propcoef            = []
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
			self.Propval   = [eval(input('Enter the general results of  '+str(Party)+'\t')) for Party in self.Parties]
			self.Propcoef  = eval(input('Enter the value of the proportional coefficient\n'))
			self.Majorcoef = eval(input('Enter the value of the majority coefficient\n'))
			self.Ndeputies = eval(input('Enter the value of the number of deputies\n'))
			self.Results   = dict([(self.Parties[i],self.Propval[i]) for i in range(self.Npart)])
			
		if self.chooseinput == 'excel':
			
			filename       = input("Enter the name of the file\n")	
			xls            = pd.read_excel(filename)
			
			self.Parties   = list(xls.columns)
			self.Propval   = list(xls[Party][0] for Party in self.Parties)
			self.Propcoef  = list([xls[Party][1] for Party in self.Parties])[1]
			self.Majorcoef = list([xls[Party][2] for Party in self.Parties])[1]
			self.Ndeputies = list([xls[Party][3] for Party in self.Parties])[1]
			self.Results   = dict([(self.Parties[i],self.Propval[i]) for i in range(len(self.Parties))])

		if self.chooseinput == 'txt':
			
			filename       = input("Enter the name of the file\n")
			file           = [line.strip() for line in open(filename)]
			self.Nparty    = len(file[0].split('\t'))
			self.Parties   = file[0].split('\t')
			self.Propval   = file[1].split('\t')
			self.Propcoef  = eval(file[2].split('\t')[1])
			self.Majorcoef = eval(file[3].split('\t')[1])
			self.Ndeputies = eval(file[4].split('\t')[1])
			self.Results   = dict([(self.Parties[i],self.Propval[i]) for i in range(self.Nparty)])
		

				 
	def check_input(self) :
			
		if len(self.Parties) == 0:
			raise ValueError('No names are inserted')
		
		if len(self.Propval) == 0:
			raise ValueError('No results are inserted')
			
		if self.Propcoef == None:
			raise ValueError('No Proportional coefficient is inserted')
			
		if self.Majorcoef  == None:
			raise ValueError('No major coefficience is inserted')
		
		
		
		
		
		for i in self.Parties:
			
			if i.isalnum():
				self.checkinput = True
			
			else:
				raise ValueError('die Name den Parteien du hast eingefügt ist nicht richtig')
		
		
		
		for i in self.Propval:
			
			try:
				i = float(i)
				
			except ValueError:
				self.checkinput = False
				print('The value you have inserted is not a number\n')
							
			if i>1:
				self.checkinput = False
				raise ValueError('The value you have inserted: ' + str(i)+' is larger than one! Unwirklich!\n')
			
			
			
		if self.checkinput == True:
			self.Propval = [float(i) for i in self.Propval]
			self.Results =  dict([(self.Parties[i],self.Propval[i]) for i in range(len(self.Parties))])


			
		
				
		if(sum(self.Propval))>1:
			self.checkinput = False
			raise ValueError('The sum of the results cannot be larger than one!!! You made a mistake')
			
		
		try:
			float( self.Majorcoef)
		except ValueError:
			self.checkinput = False
			print('The value of Major coefficient you have inserted is not a number\n')
	
		if self.Majorcoef > 1:
			raise ValueError ('The Major coefficient is larger than one!\n Not possible')
			
	
		try:
			float( self.Propcoef)
		except ValueError:
			self.checkinput = False
			print('The value of Major coefficient you have inserted is not a number\n')
	
		if self.Propcoef > 1:
			raise ValueError ('The Major coefficient is larger than one!\n Not possible')

		   
		if self.Propcoef<1 and self.Majorcoef<1 and self.Propcoef + self.Majorcoef >1:
			raise ValueError('Something is wrong with the values of the two coefficients\n')
			   
				   
	def Fill_Seats(self): 
	#This method runs the Montecarlo's algorythm for each collegium. It can be
	#performed using different weights according to the electoral law we are considering
		seats = {key:int(self.Results[key]*self.Ndeputies*self.Propcoef)+int(self.Results[key]*(1-sum(list(self.Results.values())))) for key in list(self.Results.keys())}
		for i in range (int(self.Ndeputies*self.Majorcoef)):
			Resultscopy = self.Results.copy()
			Resultscopy = {key:self.Results[key]*np.random.rand() for key in self.Results.keys()}#this is the core of the program
			seats[max_key(Resultscopy)]+=1
		return seats
	
	def Complete_Simulation(self):
		seats = {key:0 for key in list(self.Results)}
	#This function provides a valid estimation for the assigned number of seats
	#by averaging over 10000 simulation. This result will be used for confrontation with real data
		for i in range(1000):
			for key in list(self.Results):
				seats[key]+=self.Fill_Seats()[key]
		average_seats = {key:int(seats[key]/1000.) for key in list(self.Results.keys()) }
		return average_seats
	
    

#m = Montecarlo_electoral('excel')
#m.Import_Results()
#m.check_input()
#m.Complete_Simulation()


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