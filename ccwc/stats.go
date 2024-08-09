package main

import (
	"bufio"
	"errors"
	"io"
	"unicode"
)

type FileStats struct {
	lineCount int
	wordCount int
	byteCount int
	charCount int
	file      string
}

func CountStats(reader *bufio.Reader, flags Flags) (FileStats, error) {
	stats := &FileStats{}
	var previousChar rune

	for {
		char, size, err := reader.ReadRune()
		if err != nil {
			if errors.Is(err, io.EOF) {
				if !unicode.IsSpace(previousChar) {
					stats.wordCount++
				}
				return *stats, nil
			}

			return FileStats{}, nil
		}

		stats.byteCount += size
		stats.charCount += 1

		if char == '\n' {
			stats.lineCount++
		}

		if unicode.IsSpace(char) && !unicode.IsSpace(previousChar) {
			stats.wordCount++
		}

		previousChar = char

	}
}
