import sys
from os import path
import re

import numpy as np
import matplotlib.pyplot as plt
from scipy import signal


"""
    Class for creating dot plot for a set of 2 given sequences
"""
class DotPlot:

    sequence1 = ''
    sequence2 = ''
    window_size = 3
    threshold = 2
    regex = "^[ACDEFGHIKLMNPQRSTVWY\s]+$"


    """
        Constructor method

        Creates DotPlot object and initializes needed variables.

        input:
            argv: string [n] - vector of n input arguments
    """
    def __init__(self, argv):

        len_argv = len( argv )

        if  ( len_argv != 4 and len_argv != 3 ) or \
            argv[0] == "-h" or argv[0] == "--h" or \
            "-help" in argv or "--help" in argv or \
            not argv[-1].isnumeric() or not argv[-2].isnumeric():

                self.display_help()
                sys.exit()

        self.parse_input( argv )

    """
        normalize_sequence method

        Normalizes sequence string to expected format.

        input:
            sequence: string - string with sequence to normalize.
        
        output:
            Normalized sequence
    """
    def normalize_sequence(self, sequence):
        return sequence.upper().replace(" ", "").replace("\n", "")

    """
        pase_input method

        Parses input arguments (argv) to expected format

        input:
            argv: string [n] - vector of n input arguments
    """
    def parse_input(self, argv):

        len_argv = len(argv)

        if len_argv == 3:
            sequences = self.fasta_read(argv[0])

            if len(sequences) < 2:
                self.display_help()
                sys.exit()

            self.sequence1 = sequences[0]
            self.sequence2 = sequences[1]

        else:
            if re.search(self.regex, argv[0], re.IGNORECASE):
                self.sequence1 = self.normalize_sequence(argv[0])
            else:
                self.sequence1 = self.normalize_sequence(self.fasta_read(argv[0])[0])

            if re.search(self.regex, argv[1], re.IGNORECASE):
                self.sequence2 = self.normalize_sequence(argv[1])
            else:
                self.sequence2 = self.normalize_sequence(self.fasta_read(argv[1])[0])

        self.window_size = int(argv[-2])
        self.threshold = int(argv[-1])

    """
        fasta_read method

        Reads .fasta file and returns vector of sequences from file.

        input:
            directory: string - path to .fasta file.

        output:
            string [n]: vector of n sequences from file.
    """
    def fasta_read(self, directory):

        if not ( directory.endswith(".fasta") or directory.endswith(".FASTA") ):
            directory += ".fasta"

        if not path.isfile(directory):
            print("File: " + directory + " does not exist.")
            self.display_help()
            sys.exit()

        sequences = []
        seq = ""

        with open(directory, "r") as file_handle:
            for line in file_handle.readlines():
               
                if line[0] == ">":
                    if len(seq) != 0:
                        sequences.append(seq.upper())       
                    seq = ""
            
                else:
                    seq += line
        
        if len(seq) != 0:
            sequences.append(seq.upper())

        if len(sequences) == 0:
            print("File: " + directory + " does not contain any sequence or is not in right format (.fasta).")
            self.display_help()
            sys.exit()
            
        return sequences

    """
        dot_plot method

        Calculates dot plot matrix

        output:
            int [n, 2] - vector of n 2d coordinates (x, y) for dot plot
    """
    def dot_plot(self):
    
        l1 = len( self.sequence1 )
        l2 = len( self.sequence2 )
    
        padding = self.window_size - 1
    
        points = [[l1, l2]]
        grid = np.zeros( [l2, l1] )
    
        for i in range( l1 ):
            for j in range( l2 ):
                if self.sequence1[i] == self.sequence2[j]:
                    grid[j, i] = 1     
                    
        kernel = np.zeros( [self.window_size, self.window_size] )
        np.fill_diagonal( kernel, 1 )
        
        result = signal.convolve2d( grid, kernel, mode = 'valid' )
        result[result < self.threshold] = 0
        result = np.pad( result, (0, padding) )
        result *= grid

        for i in range(l1):
            for j in range(l2):
                if result[j, i] > 0:
                    points.append( [i, j] )

        return np.array(points)

    """
        plot method

        Displays and saves dot plot

        input:
            points: int [n, 2] - vector of n 2d coordinates (x, y) for dot plot
    """
    def plot(self, points):

       for point in points:
           print(point)
           sys.stdout.flush()

    def display_help(self):
        print("\nScript for creating dot plot from 2 sequences with threshold based sliding-window filtering.\n")
        
        print("Usage:")
        print("$ python dotPlot.py sequence1 sequence2 window_size threshold")
        print("$ python dotPlot.py fasta_file1 fasta_file2 window_size threshold")
        print("$ python dotPlot.py fasta_file_with_at_least_2_sequences window_size threshold\n")

        print("Example usage:")
        print("$ python dotPlot.py ACGCGCG ACACGCA 3 2")
        print("$ python dotPlot.py seq1.fasta seq2.fasta 5 3")
        print("$ python dotPlot.py seq3.fasta 2 2\n")



if __name__ == "__main__":
    dp = DotPlot( sys.argv[1:] )
    p = dp.dot_plot()
    dp.plot(p)

    