# -*- coding: utf-8 -*-
"""
Created on Wed Oct 30 17:12:33 2019
@author: Giulio
"""


import numpy as np
import random as rd
import pandas as pd
import math
import matplotlib.pylab as plt




def max_key(d):
	"""
	max_key takes a dictionary as a input and finds its highest key.

	Parameters
		d: is a generic dictionaries, whose values are numbers

	Returns
		 -a list of the keys having the highest value
		 -If there is more than one element in the list, then the function simply
		  takes the element with the lowest index.


	"""
    max_key = ''
    max_value = 0
    for key in list(d.keys()):
        if d[key]>max_value:
            max_key = key
            max_value = d[key]
        elif d[key] == max_value:
            max_key = rd.choice([key,max_key]) #If two keys have the same value the highest key will be randomly chosen between the twos
    return max_key    

class Montecarlo_electoral:
	 
	
	def __init__ (self,chooseinput = 'stinput',filename = '',election = 'Italian_2018_General_Election'):
		
		self.Ndeputies           = 630 #Fixed on italian conditions
		self.chooseinput 		 = chooseinput.lower()
		self.Results      		 = {}
		self.Propval 			 = []
		self.Parties             = []
		self.Majorcoef           = 0.37 #Fixed on italian conditions
		self.Propcoef            = 0.61 #Fixed on italian conditions
		self.checkinput          = True #This will reveal wether we have an Input problem or not
		self.filename 			 = filename
		self.election            = election
		
		if self.chooseinput not in set(['stinput','excel','txt']): #the choice of the input must be valid
			self.checkinput = False
			raise ValueError ("You didn't insert the right input\n",self.chooseinput," is not a right input")
		
	def Import_Results(self):
	
		if self.chooseinput == 'stinput':
			
			#initializing all the main paramteters of the class
			self.Npart     = int (input("Enter the number of parties\n"))
			self.Parties   = [input('Enter the name of the party number '+str(i+1)+'\n') for i in range(self.Npart)]
			self.Propval   = [eval(input('Enter the general results of  '+str(Party)+'\t')) for Party in self.Parties]
			self.Propcoef  = eval(input('Enter the value of the proportional coefficient\n'))
			self.Majorcoef = eval(input('Enter the value of the majority coefficient\n'))
			self.Ndeputies = eval(input('Enter the value of the number of deputies\n'))
			self.Results   = dict([(self.Parties[i],self.Propval[i]) for i in range(self.Npart)])
			
		if self.chooseinput == 'excel':
			
			
			xls            = pd.read_excel(self.filename) #opening of the excel files as a Dataframe

			#initializing all the main parameters of the class
			self.Parties   = list(xls.columns)
			self.Propval   = list(xls[Party][0] for Party in self.Parties)
			self.Propcoef  = list([xls[Party][1] for Party in self.Parties])[1]
			self.Majorcoef = list([xls[Party][2] for Party in self.Parties])[1]
			self.Ndeputies = list([xls[Party][3] for Party in self.Parties])[1]
			self.Results   = dict([(self.Parties[i],self.Propval[i]) for i in range(len(self.Parties))])

		if self.chooseinput == 'txt':
			
			
			file           = [line.strip() for line in open(self.filename)] #opening of the file

			#initializing all the main parameters of the class
			self.Nparty    = len(file[0].split('\t'))
			self.Parties   = file[0].split('\t')
			self.Propval   = file[1].split('\t')
			self.Propcoef  = eval(file[2].split('\t')[1])
			self.Majorcoef = eval(file[3].split('\t')[1])
			self.Ndeputies = eval(file[4].split('\t')[1])
			self.Results   = dict([(self.Parties[i],self.Propval[i]) for i in range(self.Nparty)])
		

				 
	def check_input(self) :
			#The following may happen when no data is acquired
		if len(self.Parties) == 0: 
			raise ValueError('No names are inserted')
		
		if len(self.Propval) == 0:
			raise ValueError('No results are inserted')
			
		if self.Propcoef == None:
			raise ValueError('No Proportional coefficient is inserted')
			
		if self.Majorcoef  == None:
			raise ValueError('No major coefficience is inserted')
		
		
		
		
		
		for i in self.Parties: #The parties must have alfanumeric names and besides they should not have the same names			
			if i.isalnum():
				self.checkinput = True
			
			else:
				raise ValueError('die Name den Parteien du hast eingefügt ist nicht richtig')
			
			if self.Parties.count(i)>1:
				raise ValueError('There are' + str(self.Parties.count(i))+ ' with the same name!')
				
		
		
		for i in self.Propval:# The results must be expressed in decimal form. They must be interpreted as 
			#floats and their sum cannot be larger than one of course.
			
			try:
				i = float(i)
				
			except ValueError:
				self.checkinput = False
				print('The value you have inserted is not a number\n')
							
			if i>1:
				self.checkinput = False
				raise ValueError('The value you have inserted: ' + str(i)+' is larger than one! Unwirklich!\n')
			
			
			
		if self.checkinput == True:
			self.Propval = [float(i) for i in self.Propval] #if they can be viewed as float we can convert them into.
			self.Results =  dict([(self.Parties[i],self.Propval[i]) for i in range(len(self.Parties))])#now our Results dict is completed


			
		
		#the value of the coefficients(both Proportionals and Majoritary) is performed through 
		
		
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
	
	def Complete_Simulation(self,N=1000):
		self.allResults = {}
		seats = {key:0 for key in list(self.Results)}
	#This function provides a valid estimation for the assigned number of seats
	#by averaging over 1000 simulation. This result will be used for confrontation with real data
		self.allResults = {key:[self.Fill_Seats()[key] for i in range (N)] for key in list(self.Results.keys())}
		for i in range(N):
			newseats = self.Fill_Seats()
			
			for key in list(self.Results):
				
				seats[key]+=newseats[key]
			
			 
		average_seats = {key:int(seats[key]/N) for key in list(self.Results.keys()) }
		return average_seats


	
	def Graphics(self,real = {},nameofelections=''): #here the things I need to check is that the keys of real must be the same of final and 
		#the two dictionaries must have the same lenght
		
		final   = self.Complete_Simulation() #Running the simulation
		bins = np.linspace(0,self.Ndeputies,int(self.Ndeputies/2)) #Creating an adeguate linspace
		
		if len(real) == 0:
			
			
			for i in self.Parties:
				plt.hist(final[i],bins,alpha = 0.5,label = i+'_sim') #Creating the single histogram
		
		if len(real) !=0:
			
			if len(real) != len(final):
				raise ValueError ('There is not the same number of both real ad simulated parties!')
			
			if final.keys() != real.keys():
				raise ValueError ('The simulated Parties and the real parties seem to have different names!')
			
			
			
			for i in self.Parties:
				plt.hist(final[i],bins,alpha = 0.5,label = i+'_sim')
				plt.hist(real[i],bins,alpha = 0.5,label = i + 'real') #creating an histogram with both real and results data displayed
			
			
		plt.xlabel('Seats')
		plt.legend(loc='upper right')
		plt.title(self.election)
		plt.savefig("Histogram-Confrontation_for_"+self.election+".png") #saving the histogram
		plt.close()
	
		for i in self.Parties:
			if self.Results[i]<0.05:
				continue
			plt.hist(self.allResults[i],bins,alpha = 0.5,label = i) #Plotting the histogram with all possible results throughout the simulation.
			

		plt.xlabel('Seats')
		plt.legend(loc='upper right')
		plt.savefig("Numbers of possible results_for_"+self.election+'.png')
		plt.close()







