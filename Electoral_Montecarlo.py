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
	This function operates with dictionaries.
	       
    Parameters
	-------
	d : a generic dictionary with numeric values.
    
    Returns
	-------
	A list containing the keys with the highest values.

	"""
    max_val = max(list(d.values()))
    max_keys = [i for i in list(d.keys()) if d[i] == max_val] #the list of the keys having the highest value of d
    return (max_keys) #For our purposes it will be a list of just one element
	

class Montecarlo_electoral:
	 
	
	
	def __init__ (self,election = 'Italian_2018_General_Election'):	
		""" 
		
		This is the Constructor of the class Montecarlo_electoral
		    
	    Attributes
		-------
        Ndeputies: The number of deputies elected during our election.
        Results:   It is an empty dictionary that will be filled with the results of our simulation.
		Propval:   The %results of the setted election.
		Parties:   The names of the parties/coalitions in the setted election.
		Majorcoef: The value of the majoritary coefficient.
		Propcoef:  The value of the proportional coefficient.
		Election:  The name of the setted election.
		allResults:A list of all the results of the simulation
		
		Returns
		-------
		None
		
		"""		
		self.Ndeputies           = 630 #Fixed on italian conditions
		self.Propval 			 = []
		self.Parties             = []
		self.Majorcoef           = 0.37 #Fixed on italian conditions
		self.Propcoef            = 0.61 #Fixed on italian conditions
		self.checkinput          = True #This will reveal wether we have an Input problem or not
		self.election            = election
		self.allResults          = {}
	
	
	
	
	def import_as_excel(self,filename = 'Elections/Election.xls'):		
		"""
		This is a method that allows to import the data we need from an excel file.
	
		Parameters
		-------
		filename  :  It is simply the name of the file
		
		Returns
		-------
		None
		"""
			
			
		xls            = pd.read_excel(filename) #opening of the excel files as a Dataframe

		#initializing all the main parameters of the class
		
		
		
		self.Parties   = list(xls.columns)
		self.Propval   = list(float(xls[Party][0]) for Party in self.Parties)
		self.Propcoef  = float([(xls[Party][1]) for Party in self.Parties][1])
		self.Majorcoef = float([(xls[Party][2]) for Party in self.Parties][1])
		self.Ndeputies = float([(xls[Party][3]) for Party in self.Parties][1])
		self.election  = str([(xls[Party][4]) for Party in self.Parties][1])
		self.Results   = dict([(self.Parties[i],self.Propval[i]) for i in range(len(self.Parties))])

		
		
		
	def import_as_txt(self,filename = 'Elections/Election.txt'):	
		"""
		This is a method that allows to import the data we need from a txt file.
	
		Parameters
		-------
		filename  :  It is simply the name of the file
		
		
		Returns
		-------
		None
		"""		

		
		file           = [line.strip() for line in open(filename)] #opening of the file 
		#initializing all the main parameters of the class
		self.election  = file[0]
		self.Parties   = file[1].split('\t')
		self.Propval   = [float(r) for r in file[2].split('\t')]
		self.Propcoef  = float(file[3].split('\t')[1])
		self.Majorcoef = float(file[4].split('\t')[1])
		self.Ndeputies = float(file[5].split('\t')[1])
		self.Results   = dict([(self.Parties[i],self.Propval[i]) for i in range(len(self.Parties))])	


	def check_import(self) :
		"""
		This method checks if the imported data makes sense.
		
		Returns
		-------
		True:  if everything is okay
		False: if illogic data are imported.

		"""		
		for i in self.Parties:	
			if self.Parties.count(i)>1:
				raise ValueError('There are' + str(self.Parties.count(i))+ 'parties with the same name!')
				return False
		
		if sum(self.Propval)>1:
			raise ValueError("The sum of the 'proportional' result is larger than 1. Not possible")
			return False
		

		   
		if  (self.Propcoef + self.Majorcoef) >1:
			raise ValueError('Something is wrong with the values of the two coefficients\n')	
			return False
		
		return True



				   
	def fill_seats(self,seed = 1): 
		"""
		This method is the core of the program. It is used to fill the seats of our simulated Parliament.
		
		Arguments
		-------
		seed:    It is the seed to give as an argument to the random number, to reproduce the simulation.
		
		Returns
		-------
		A dictionary in which each Party has its simulated number of seats.
		"""
		np.random.seed(seed) #we are setting the seed
		seats = {key:int(self.Results[key]*self.Ndeputies*self.Propcoef)+int(self.Results[key]*(1-sum(list(self.Results.values())))) for key in list(self.Results.keys())}
		
		for i in range (int(self.Ndeputies*self.Majorcoef)):
			
			Resultscopy = self.Results.copy()
			Resultscopy = {key:self.Results[key]*np.random.rand() for key in self.Results.keys()}#this is the core of the program
			
			seats[rd.choice(max_key(Resultscopy))]+=1 #The Party whit the highest value is winning the seat
		
		return seats
	
	def complete_simulation(self,N=1000):
		"""
		This function provides a valid extimation for the assigned number of seats by averaging over N iterations.

		Parameters
		----------
		N is the number of iterations. It must be large enough for our simulation to converge

		Returns
		-------
		A dictionary with the Results of our total simulation.
		It will be used to be confronted with real data in the case of past elections
		or to foresee an upcoming election.

		"""
		seats = {key:0 for key in list(self.Results)}
		#this variables shall be used for the Graphic part.
		self.allResults = {key:[self.fill_seats(i)[key] for i in range (N)] for key in list(self.Results.keys())}
		for i in range(N):
			
			newseats = self.fill_seats(i)
			
			for key in list(self.Results):
				
				seats[key]+=newseats[key]
			
			 
		average_seats = {key:int(seats[key]/N) for key in list(self.Results.keys()) }
		return average_seats


	
	def graphic(self,final): 
		"""
		graphic(final,real) is a method which returns and saves two graphs,
		a histogram in which the data of our complete_simulation will be shown
		and  another where all thedata coming from all the iterations of the simulation are displayed
		
		Parameters
		----------
		final : It is a dictionary shaped according to complete_simulation()
		real : It is a dictionary containing the true results of the elecion we are simulating


		Raises
		------
		ValueError:
			if real and final have two different lenghts
			if the keys of real and those of final are different
		
		Returns
		------
		None"""
		
		
		
		bins 		= np.linspace(0,self.Ndeputies,int(self.Ndeputies/2)) #Creating an adeguate linspace
		real 		= [line.strip() for line in open('Elections/Real_Election_for_Confrontation.txt')]
		print(len(real))
		
		print(real) 
		if len(real) == 0:
			
			
			for i in self.Parties:
				plt.hist(final[i],bins,alpha = 0.5,label = i+'_sim') #Creating the single histogram
		
		
		
		elif len(real) !=0:
			
			real        = {real[0].split('\t')[i]:float(real[1].split('\t')[i]) for i in range(len(real[0].split('\t')))}
			
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
		plt.savefig("Graphic/Histogram-Confrontation_for_"+self.election+".png") #saving the histogram
		plt.close()
	
		for i in self.Parties:
			if self.Results[i]<0.05:
				continue
			plt.hist(self.allResults[i],bins,alpha = 0.5,label = i) #Plotting the histogram with all possible results throughout the simulation.
			

		plt.xlabel('Seats')
		plt.legend(loc='upper right')
		plt.savefig("Graphic/Numbers of possible results_for_"+self.election+'.png')
		plt.close()





