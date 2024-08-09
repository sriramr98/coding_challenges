package main

import (
	"bufio"
	"flag"
	"fmt"
	"log"
	"os"
)

type Flags struct {
	countLines bool
	countWord  bool
	countBytes bool
	countChars bool
}

func (f Flags) allFalse() bool {
	return !f.countBytes && !f.countWord && !f.countLines && !f.countChars
}

func (f *Flags) enableAllFlags() {
	f.countChars = true
	f.countBytes = true
	f.countWord = true
	f.countLines = true
}

func printTotals(stats []FileStats) {
}

func printStats(stats FileStats, flags Flags, filePath string) {
	if flags.countLines {
		fmt.Printf("%d ", stats.lineCount)
	}

	if flags.countWord {
		fmt.Printf("%d ", stats.wordCount)
	}

	if flags.countBytes {
		fmt.Printf("%d ", stats.byteCount)
	}

	if flags.countChars {
		fmt.Printf("%d ", stats.charCount)
	}

	fmt.Printf("%v\n", filePath)
}

func main() {
	flags := &Flags{}

	flag.BoolVar(&flags.countChars, "m", false, "Count the number of chars of the file")
	flag.BoolVar(&flags.countLines, "l", false, "Count the number of llines in the file")
	flag.BoolVar(&flags.countWord, "w", false, "Count the number of words in the file")
	flag.BoolVar(&flags.countBytes, "c", false, "Count the number of bytes in the file")
	flag.Parse()

	if flags.allFalse() {
		flags.enableAllFlags()
	}

	filePaths := flag.CommandLine.Args()
	stats := []FileStats{}

	if len(filePaths) > 0 {
		for _, path := range filePaths {
			file, err := os.Open(path)
			if err != nil {
				log.Fatal(err)
			}

			stat, err := CountStats(bufio.NewReader(file), *flags)
			if err != nil {
				log.Fatal(err)
			}

			printStats(stat, *flags, path)
			stats = append(stats, stat)
		}

		if len(stats) > 1 {
			printTotals(stats)
		}
	} else {
		reader := bufio.NewReader(os.Stdin)
		stat, err := CountStats(reader, *flags)
		if err != nil {
			log.Fatal(err)
		}

		printStats(stat, *flags, "")
	}
}
